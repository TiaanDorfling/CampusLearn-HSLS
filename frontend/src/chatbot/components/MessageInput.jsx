//components/MessageInput
import React, { useRef, useState, useEffect } from 'react';
import { SendIcon } from './icons/SendIcon';
import { PaperclipIcon } from './icons/PaperclipIcon';
import { MicrophoneIcon } from './icons/MicrophoneIcon';

export const MessageInput = ({
  value,
  onChange,
  onSubmit,
  isLoading,
  selectedFile,
  onFileSelect,
  onFileClear,
}) => {
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);
  const [isListening, setIsListening] = useState(false);
  const [micError, setMicError] = useState(null);

  useEffect(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognitionAPI) {
      recognitionRef.current = new SpeechRecognitionAPI();
      const recognition = recognitionRef.current;
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        onChange({ target: { value: value + finalTranscript + interimTranscript } });
      };

      recognition.onerror = (event) => {
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

  const handleFileChange = (e) => {
    onFileSelect(e.target.files?.[0] || null);
  };

  const handleAttachClick = () => fileInputRef.current?.click();

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit(e);
    }
  };

  const handleTextChange = (e) => {
    if (micError) setMicError(null);
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
              onClick={() => { onFileClear(); if(fileInputRef.current) fileInputRef.current.value = ""; }}
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
          <input type="file" accept="image/*,application/pdf" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
          <button type="button" onClick={handleAttachClick} disabled={isLoading} className="p-2 text-slate-400 hover:text-blue-400 disabled:opacity-50 transition-colors" aria-label="Attach file">
            <PaperclipIcon className="w-6 h-6" />
          </button>
          <button type="button" onClick={handleMicClick} disabled={isLoading} className={`p-2 rounded-full transition-colors disabled:opacity-50 ${isListening ? 'text-red-500 animate-pulse' : 'text-slate-400 hover:text-blue-400'}`} aria-label={isListening ? 'Stop listening' : 'Start listening'}>
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
          <button type="submit" disabled={isLoading || (!value.trim() && !selectedFile)} className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-500 disabled:bg-slate-600 disabled:cursor-not-allowed flex-shrink-0 transition-colors" aria-label="Send message">
            <SendIcon className="w-6 h-6" />
          </button>
        </div>
      </form>
    </div>
  );
};
