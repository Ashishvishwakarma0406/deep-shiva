import React from 'react';
import { SendIcon, SparkleIcon } from './icons.jsx';

const PromptBar = ({ 
    input, 
    setInput, 
    handleSend, 
    handleSuggestFollowUp, 
    isLoading, 
    messages 
}) => {
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-gray-800 via-gray-800 to-transparent">
      <div className="max-w-3xl mx-auto px-6 pb-6">
         {messages.length > 0 && !isLoading && (
            <div className="flex justify-center mb-2">
                <button onClick={handleSuggestFollowUp} className="flex items-center gap-2 text-sm bg-gray-700/50 hover:bg-gray-700 py-2 px-4 rounded-lg transition-colors">
                    <SparkleIcon />
                    Suggest a follow-up
                </button>
            </div>
         )}
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Message your local assistant..."
            className="w-full bg-gray-700 rounded-2xl p-4 pr-16 text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="1"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || input.trim() === ''}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
          >
            <SendIcon />
          </button>
        </div>
        <p className="text-center text-xs text-gray-500 pt-2">
          Powered by your local Mistral 7B model.
        </p>
      </div>
    </div>
  );
};

export default PromptBar;
