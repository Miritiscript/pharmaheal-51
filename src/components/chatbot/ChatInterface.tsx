
import React, { useState, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { generatePharmacyResponse } from '@/services/geminiService';
import { Message, ChatHistory } from './types';
import ChatHeader from './ChatHeader';
import ChatMessage from './ChatMessage';
import LoadingMessage from './LoadingMessage';
import ChatInput from './ChatInput';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';

const LOCAL_STORAGE_KEY = 'pharmacy-chat-history';
const MAX_RETRIES = 2; // Maximum number of automatic retries

const ChatInterface: React.FC = () => {
  const [currentChatId, setCurrentChatId] = useState<string>(() => {
    return uuidv4();
  });
  
  const [messages, setMessages] = useState<Message[]>(() => {
    // Try to load existing chat from localStorage
    try {
      const savedChats = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedChats) {
        const chats: ChatHistory[] = JSON.parse(savedChats);
        const latestChat = chats[0]; // Get the most recent chat
        
        if (latestChat) {
          // Convert string dates back to Date objects
          const parsedMessages = latestChat.messages.map(msg => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }));
          
          setCurrentChatId(latestChat.id);
          return parsedMessages;
        }
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
    
    // Return default welcome message if no history exists
    return [{
      id: uuidv4(),
      content: 'Hello! I\'m your AI pharmacy assistant. Ask me about medications, side effects, drug interactions, or treatment options for specific conditions.',
      isUser: false,
      timestamp: new Date(),
    }];
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [currentQueryForRetry, setCurrentQueryForRetry] = useState<string | null>(null);
  const [lastError, setLastError] = useState<Error | null>(null);
  const chatWindowRef = useRef<HTMLDivElement>(null);
  const { toast: uiToast } = useToast();

  // Auto-scroll to bottom of chat when new messages arrive
  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);
  
  // Save messages to localStorage whenever they change
  useEffect(() => {
    try {
      const savedChats = localStorage.getItem(LOCAL_STORAGE_KEY);
      let chats: ChatHistory[] = savedChats ? JSON.parse(savedChats) : [];
      
      // Find if current chat exists in storage
      const chatIndex = chats.findIndex(chat => chat.id === currentChatId);
      
      // Create chat title from first user message or use default
      const firstUserMessage = messages.find(msg => msg.isUser);
      const chatTitle = firstUserMessage 
        ? firstUserMessage.content.substring(0, 30) + (firstUserMessage.content.length > 30 ? '...' : '')
        : 'New conversation';
      
      const updatedChat: ChatHistory = {
        id: currentChatId,
        messages: messages,
        createdAt: chatIndex >= 0 ? new Date(chats[chatIndex].createdAt) : new Date(),
        updatedAt: new Date(),
        title: chatTitle
      };
      
      if (chatIndex >= 0) {
        // Update existing chat
        chats[chatIndex] = updatedChat;
      } else {
        // Add new chat to the beginning of the array
        chats = [updatedChat, ...chats];
      }
      
      // Limit stored chats to 10
      chats = chats.slice(0, 10);
      
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(chats));
    } catch (error) {
      console.error('Error saving chat history:', error);
    }
  }, [messages, currentChatId]);

  // Auto-retry logic
  useEffect(() => {
    if (currentQueryForRetry && retryCount > 0 && retryCount <= MAX_RETRIES) {
      const doRetry = async () => {
        console.log(`Auto-retrying query (attempt ${retryCount}): ${currentQueryForRetry.substring(0, 30)}...`);
        try {
          await processQuery(currentQueryForRetry);
        } catch (error) {
          console.error("Auto-retry failed:", error);
          // Don't increment retryCount here as processQuery will do it if needed
        }
      };
      
      // Add a delay between retries
      const retryDelay = 2000 * Math.pow(1.5, retryCount - 1);
      console.log(`Retrying in ${retryDelay}ms`);
      const timeoutId = setTimeout(doRetry, retryDelay);
      
      return () => clearTimeout(timeoutId);
    }
  }, [currentQueryForRetry, retryCount]);

  const processQuery = async (input: string): Promise<void> => {
    setIsLoading(true);
    
    try {
      console.log("Processing pharmacy query:", input);
      
      // Call Gemini API for pharmacy information with Groq fallback
      const pharmacyResponse = await generatePharmacyResponse(input);
      
      console.log("Response received:", pharmacyResponse ? "success" : "undefined");
      
      if (!pharmacyResponse || !pharmacyResponse.text) {
        throw new Error("No response received from the medical service.");
      }
      
      // Check if this response came from fallback mechanism
      const isFromFallback = pharmacyResponse.error !== undefined;
      
      const aiResponse: Message = {
        id: uuidv4(),
        content: pharmacyResponse.text,
        isUser: false,
        timestamp: new Date(),
        pharmacyData: pharmacyResponse,
        fallbackUsed: isFromFallback
      };
      
      setMessages(prev => [...prev, aiResponse]);
      
      // Reset retry state on success
      setRetryCount(0);
      setCurrentQueryForRetry(null);
      setLastError(null);
      
      // Show success toast for user feedback
      toast.success(isFromFallback ? "Response received from fallback system" : "Response received", { 
        description: "Medical information retrieved" + (isFromFallback ? " using fallback system" : " successfully"), 
        duration: 3000 
      });
      
    } catch (error) {
      console.error('Error getting pharmacy response:', error);
      
      // Store the error for retry logic
      setLastError(error instanceof Error ? error : new Error(String(error)));
      
      // Increment retry count and store query for retry
      if (retryCount < MAX_RETRIES) {
        setRetryCount(prev => prev + 1);
        setCurrentQueryForRetry(input);
        
        // Show "retrying" toast
        toast.info(`Retrying... (${retryCount + 1}/${MAX_RETRIES})`, { duration: 2000 });
        
      } else {
        // If we've reached max retries, show an error message
        let errorMessage: string;
        
        if (error instanceof Error) {
          errorMessage = error.message;
        } else {
          errorMessage = "Please enter a valid medical prompt such as: disease name, description, drug recommendations, side effects, indications, contraindications, herbal medicine alternatives, or food-based treatments.";
        }
        
        // Add error message to chat
        const errorMsg: Message = {
          id: uuidv4(),
          content: errorMessage,
          isUser: false,
          timestamp: new Date(),
          error: true
        };
        
        setMessages(prev => [...prev, errorMsg]);
        
        toast.error("Error retrieving medical information", { 
          description: errorMessage.substring(0, 100) + (errorMessage.length > 100 ? '...' : ''), 
          duration: 5000 
        });
        
        uiToast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
        
        // Reset retry state 
        setRetryCount(0);
        setCurrentQueryForRetry(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (input: string) => {
    if (!input.trim()) {
      uiToast({
        title: "Invalid Input",
        description: "Please enter a valid medical prompt such as: disease name, description, drug recommendations, side effects, indications, contraindications, herbal medicine alternatives, or food-based treatments.",
        variant: "destructive",
      });
      return;
    }

    const userMessage: Message = {
      id: uuidv4(),
      content: input,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    
    // Reset retry count for new query
    setRetryCount(0);
    setCurrentQueryForRetry(null);
    
    try {
      await processQuery(input);
    } catch (error) {
      // Error handling is done inside processQuery
      console.error("Failed to process message:", error);
    }
  };

  const resetChat = () => {
    const newChatId = uuidv4();
    setCurrentChatId(newChatId);
    setMessages([
      {
        id: uuidv4(),
        content: 'Hello! I\'m your AI pharmacy assistant. Ask me about medications, side effects, drug interactions, or treatment options for specific conditions.',
        isUser: false,
        timestamp: new Date(),
      },
    ]);
    
    // Reset retry state
    setRetryCount(0);
    setCurrentQueryForRetry(null);
    setLastError(null);
    
    toast.success("Chat has been reset", { duration: 3000 });
  };

  const handleRetry = async () => {
    if (!currentQueryForRetry) {
      // If there's no query stored for retry, find the last user message
      const lastUserMessage = [...messages].reverse().find(msg => msg.isUser);
      if (lastUserMessage) {
        try {
          await handleSendMessage(lastUserMessage.content);
        } catch (error) {
          console.error("Manual retry failed:", error);
        }
      } else {
        uiToast({
          title: "Cannot Retry",
          description: "No previous query found to retry.",
          variant: "destructive",
        });
      }
    } else {
      // If we have a stored query for retry, use it
      try {
        // Reset retry count to allow full retry attempts
        setRetryCount(0);
        await handleSendMessage(currentQueryForRetry);
      } catch (error) {
        console.error("Manual retry failed:", error);
      }
    }
  };

  return (
    <div className="flex flex-col h-[85vh] max-w-3xl mx-auto glass-card overflow-hidden">
      <ChatHeader onReset={resetChat} />

      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={chatWindowRef} id="chat-window">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        {isLoading && <LoadingMessage />}
        
        {lastError && !isLoading && retryCount >= MAX_RETRIES && (
          <div className="flex justify-center my-2">
            <button 
              onClick={handleRetry}
              className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100 px-4 py-2 rounded-full text-sm flex items-center gap-2 hover:bg-amber-200 dark:hover:bg-amber-800 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              Try Again
            </button>
          </div>
        )}
      </div>

      <ChatInput 
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
      />
    </div>
  );
};

export default ChatInterface;
