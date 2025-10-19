
import React from 'react';
import { marked } from 'marked';
import { type Message as MessageType } from '../types';
import { BotIcon } from './icons/BotIcon';
import { FileIcon } from './icons/FileIcon';

interface MessageProps {
  message: MessageType;
  isLastMessage?: boolean;
  onSuggestedReplyClick?: (text: string) => void;
}

export const Message: React.FC<MessageProps> = ({ message, isLastMessage, onSuggestedReplyClick }) => {
  const isBot = message.sender === 'bot';

  if (isBot) {
    const botResponseHtml = marked.parse(message.text, { breaks: true, gfm: true });
    return (
      <div className="flex flex-col items-start space-y-2 max-w-xl animate-fade-in">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex-shrink-0 flex items-center justify-center border border-slate-500">
            <BotIcon className="w-5 h-5 text-white"/>
          </div>
          <div className="bg-slate-700 p-3 rounded-lg rounded-tl-none shadow-md">
            <div
              className="prose prose-sm prose-invert max-w-none prose-p:my-2 prose-headings:my-3 prose-strong:text-slate-100 prose-ul:my-2 prose-li:my-0 prose-li:marker:text-blue-400"
              dangerouslySetInnerHTML={{ __html: botResponseHtml }}
            />
          </div>
        </div>
        {isLastMessage && message.suggestedReplies && message.suggestedReplies.length > 0 && (
          <div className="pl-11 flex flex-wrap gap-2">
            {message.suggestedReplies.map((reply, index) => (
              <button
                key={index}
                onClick={() => onSuggestedReplyClick?.(reply)}
                className="px-3 py-1 bg-slate-600/50 text-blue-300 text-sm rounded-full border border-slate-600 hover:bg-slate-600 hover:text-white transition-colors"
              >
                {reply}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex justify-end animate-fade-in">
       <div className="flex flex-col items-end gap-2">
        {message.file && (
            <div className="bg-slate-700/50 p-2 rounded-lg max-w-xs flex items-center gap-2 border border-slate-600">
                <FileIcon className="w-5 h-5 text-slate-300 flex-shrink-0" />
                <span className="text-slate-300 text-sm truncate">{message.file.name}</span>
            </div>
        )}
        {message.text && (
            <div className="bg-red-600 p-3 rounded-lg rounded-br-none max-w-xl shadow-md">
                <p className="text-white whitespace-pre-wrap">{message.text}</p>
            </div>
        )}
       </div>
    </div>
  );
};

// Add a simple fade-in animation for messages via style tag in the component
const styles = `
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
  animation: fadeIn 0.3s ease-out forwards;
}
`;
if (!document.getElementById('message-animation-styles')) {
    const styleSheet = document.createElement("style");
    styleSheet.id = 'message-animation-styles';
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
}
