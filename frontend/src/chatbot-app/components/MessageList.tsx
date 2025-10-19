
import React, { useRef, useEffect } from 'react';
import { type Message as MessageType } from '../types';
import { Message } from './Message';
import { SpinnerIcon } from './icons/SpinnerIcon';

interface MessageListProps {
  messages: MessageType[];
  isLoading: boolean;
  onSendMessage: (input: string) => void;
}

export const MessageList: React.FC<MessageListProps> = ({ messages, isLoading, onSendMessage }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  return (
    <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
      <div className="flex flex-col space-y-4">
        {messages.map((msg, index) => (
          <Message 
            key={index} 
            message={msg}
            isLastMessage={index === messages.length - 1}
            onSuggestedReplyClick={onSendMessage}
          />
        ))}
        {isLoading && messages.length > 0 && messages[messages.length-1].sender === 'user' && (
          <div className="flex items-start space-x-3 max-w-lg">
             <div className="w-8 h-8 bg-slate-700 rounded-full flex-shrink-0 flex items-center justify-center border border-slate-500">
               <SpinnerIcon className="w-5 h-5 text-blue-400"/>
            </div>
            <div className="bg-slate-700 p-3 rounded-lg rounded-tl-none">
              <p className="text-slate-400 italic text-sm">Awaiting transmission...</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};
