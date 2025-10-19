// frontend/src/pages/chatbot/ChatbotPage.jsx
import React from 'react';
// Import App from chatbot-app and alias it as ChatbotApp
import ChatbotApp from '../../chatbot-app/App.tsx';

const ChatbotPage = () => {
  return (
    <div className="chatbot-page-container min-h-screen flex items-center justify-center bg-slate-900 p-4">
      <ChatbotApp /> {/* Now this refers to the aliased import */}
    </div>
  );
};

export default ChatbotPage;