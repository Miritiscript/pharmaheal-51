
import React, { useState, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { generatePharmacyResponse } from '@/services/geminiService';
import { Message, ChatHistory } from './types';
import ChatHeader from './ChatHeader';
import ChatMessage from './ChatMessage';
import LoadingMessage from './LoadingMessage';
import ChatInput from './ChatInput';
import { v4 as uuidv4 } from 'uuid';

const LOCAL_STORAGE_KEY = 'pharmacy-chat-history';

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
  const chatWindowRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

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

  const handleSendMessage = async (input: string) => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: uuidv4(),
      content: input,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Call Gemini API for pharmacy information
      const pharmacyResponse = await generatePharmacyResponse(input);
      
      const aiResponse: Message = {
        id: uuidv4(),
        content: pharmacyResponse.text,
        isUser: false,
        timestamp: new Date(),
        pharmacyData: pharmacyResponse,
      };
      
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error getting pharmacy response:', error);
      toast({
        title: "Error",
        description: "Failed to get a response. Please try again later.",
        variant: "destructive",
      });
      
      // Add error message to chat
      const errorMessage: Message = {
        id: uuidv4(),
        content: "I'm sorry, I couldn't process your request at the moment. Please try again later.",
        isUser: false,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
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
  };

  return (
    <div className="flex flex-col h-[85vh] max-w-3xl mx-auto glass-card overflow-hidden">
      <ChatHeader onReset={resetChat} />

      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={chatWindowRef} id="chat-window">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        {isLoading && <LoadingMessage />}
      </div>

      <ChatInput 
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
      />
    </div>
  );
};

export default ChatInterface;
