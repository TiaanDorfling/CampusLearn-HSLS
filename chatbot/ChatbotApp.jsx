import React, { useState, useEffect } from 'react';
import { ChatInterface } from './components/ChatInterface';
import { sendMessageToBot, getInitialGreeting } from './services/geminiService';

const CHAT_HISTORY_KEY = 'optimist-prime-chat-history';

const ChatbotApp = () => {
  const [messages, setMessages] = useState(() => {
    try {
      const savedMessages = localStorage.getItem(CHAT_HISTORY_KEY);
      return savedMessages ? JSON.parse(savedMessages) : [];
    } catch (error) {
      console.error("Failed to parse chat history from localStorage", error);
      return [];
    }
  });

  const [isLoading, setIsLoading] = useState(messages.length === 0);

  useEffect(() => {
    try {
      if (messages.length > 0) {
        localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages));
      }
    } catch (error) {
      console.error("Failed to save chat history to localStorage", error);
    }
  }, [messages]);

  useEffect(() => {
    if (messages.length === 0) {
      const fetchGreeting = async () => {
        setIsLoading(true);
        try {
          const { text, suggestedReplies } = await getInitialGreeting();
          setMessages([{ text, sender: 'bot', suggestedReplies }]);
        } catch (error) {
          setMessages([
            {
              text: "Greetings. I am Optimist Prime. It seems my connection to Cybertron is weak. Please refresh to try again.",
              sender: 'bot'
            }
          ]);
        } finally {
          setIsLoading(false);
        }
      };
      fetchGreeting();
    }
  }, []);

  const handleSendMessage = async (userInput, file) => {
    if (!userInput.trim() && !file) return;

    const userMessage = {
      text: userInput,
      sender: 'user',
      file: file ? { name: file.name, type: file.type } : undefined,
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const { text, suggestedReplies } = await sendMessageToBot(userInput, file || undefined);
      const botMessage = { text, sender: 'bot', suggestedReplies };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error(error);
      const errorMessage = {
        text: "A communication disruption has occurred. Your transmission may not have been received. Please try again.",
        sender: 'bot'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearConversation = () => {
    setMessages([]);
    console.log("Chat history cleared!");
  };

  return (
    <div className="bg-slate-900 min-h-screen flex flex-col items-center justify-center p-2 sm:p-4">
      <ChatInterface
        messages={messages}
        isLoading={isLoading}
        onSendMessage={handleSendMessage}
        onClearConversation={handleClearConversation}
      />
    </div>
  );
};

console.log(
  "Gemini Key Loaded:",
  import.meta.env.VITE_GEMINI_API_KEY ? "✅ Yes" : "❌ No"
);

export default ChatbotApp;
