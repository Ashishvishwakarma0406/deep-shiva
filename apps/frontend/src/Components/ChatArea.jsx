import React, { useRef, useEffect } from 'react';
import { UserIcon, AssistantIcon } from './icons.jsx';

const ChatArea = ({ messages }) => {
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-6 pt-16 pb-48">
      <div className="max-w-3xl mx-auto">
        {messages.map((msg, index) => (
          <div key={index} className={`flex items-start gap-4 py-6 ${msg.role === 'user' ? '' : 'bg-gray-700/50 -mx-6 px-6'}`}>
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
              {msg.role === 'user' ? <UserIcon /> : <AssistantIcon />}
            </div>
            <div className="flex-grow pt-1 whitespace-pre-wrap">
              {msg.content}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>
    </div>
  );
};

export default ChatArea;
