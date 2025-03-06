
import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ChatInterface from '@/components/chatbot/ChatInterface';

const Chatbot: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 pt-24 pb-16 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">AI Medical Assistant</h1>
            <p className="text-muted-foreground">
              Ask questions about medications, symptoms, or health conditions
            </p>
          </div>
          <ChatInterface />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Chatbot;
