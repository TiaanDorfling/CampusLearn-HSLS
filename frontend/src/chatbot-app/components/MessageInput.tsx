
import React, { useRef, useState, useEffect } from 'react';
import { SendIcon } from './icons/SendIcon';
import { PaperclipIcon } from './icons/PaperclipIcon';
import { MicrophoneIcon } from './icons/MicrophoneIcon';

// --- TypeScript definitions for the Web Speech API ---
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
  item(index: number): SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  [index: number]: SpeechRecognitionAlternative;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: { new (): SpeechRecognition };
    webkitSpeechRecognition: { new (): SpeechRecognition };
  }
}
// --- End of TypeScript definitions ---


interface MessageInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  selectedFile: File | null;
  onFileSelect: (file: File | null) => void;
  onFileClear: () => void;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  value,
  onChange,
  onSubmit,
  isLoading,
  selectedFile,
  onFileSelect,
  onFileClear,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);

  useEffect(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognitionAPI) {
      recognitionRef.current = new SpeechRecognitionAPI();
      const recognition = recognitionRef.current;
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscript = '';
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        // Use a dummy event to call the parent's onChange handler
        const dummyEvent = {
          target: { value: value + finalTranscript + interimTranscript },
        } as React.ChangeEvent<HTMLTextAreaElement>;
        onChange(dummyEvent);
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
         if (event.error === 'network') {
          setMicError("Network error. Please check your connection.");
        } else if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setMicError("Microphone access denied.");
        } else {
          setMicError(`Error: ${event.error}`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };
    }
  }, [value, onChange]);


  const handleMicClick = () => {
    setMicError(null);
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
    }
    setIsListening(!isListening);
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    } else {
      onFileSelect(null);
    }
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit(e as any);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (micError) setMicError(null); // Clear mic error on typing
    onChange(e);
  };

  return (
    <div className="p-4 border-t border-slate-700 bg-slate-800/80 rounded-b-lg">
      <form onSubmit={onSubmit} className="relative">
        {selectedFile && (
          <div className="absolute bottom-full left-0 right-0 p-2 bg-slate-700/80 backdrop-blur-sm rounded-t-md flex justify-between items-center text-sm">
            <span className="text-slate-300 truncate pl-2">
              Attached: {selectedFile.name}
            </span>
            <button
              type="button"
              onClick={() => {
                onFileClear();
                if(fileInputRef.current) {
                  fileInputRef.current.value = "";
                }
              }}
              className="text-slate-400 hover:text-white font-bold text-lg px-2"
              aria-label="Remove file"
              disabled={isLoading}
            >
              &times;
            </button>
          </div>
        )}
        {micError && (
             <div className="absolute bottom-full left-0 right-0 p-2 bg-red-800/80 backdrop-blur-sm rounded-t-md flex justify-center items-center text-sm">
                <p className="text-white">{micError}</p>
             </div>
        )}
        <div className="flex items-center space-x-2">
          <input
            type="file"
            accept="image/*,application/pdf"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            aria-hidden="true"
          />
          <button
            type="button"
            onClick={handleAttachClick}
            disabled={isLoading}
            className="p-2 text-slate-400 hover:text-blue-400 disabled:opacity-50 transition-colors"
            aria-label="Attach file"
          >
            <PaperclipIcon className="w-6 h-6" />
          </button>
           <button
            type="button"
            onClick={handleMicClick}
            disabled={isLoading}
            className={`p-2 rounded-full transition-colors disabled:opacity-50 ${
              isListening
                ? 'text-red-500 animate-pulse'
                : 'text-slate-400 hover:text-blue-400'
            }`}
            aria-label={isListening ? 'Stop listening' : 'Start listening'}
          >
            <MicrophoneIcon className="w-6 h-6" />
          </button>
          <textarea
            value={value}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask Optimist Prime..."
            rows={1}
            disabled={isLoading}
            className="flex-1 bg-slate-900/50 border border-slate-600 rounded-lg py-2 px-3 resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none text-white scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800"
            style={{ maxHeight: '120px' }}
            aria-label="Message input"
          />
          <button
            type="submit"
            disabled={isLoading || (!value.trim() && !selectedFile)}
            className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-500 disabled:bg-slate-600 disabled:cursor-not-allowed flex-shrink-0 transition-colors"
            aria-label="Send message"
          >
            <SendIcon className="w-6 h-6" />
          </button>
        </div>
      </form>
    </div>
  );
};
