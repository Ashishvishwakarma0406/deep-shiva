import React from 'react';
import { LogoIcon, PlusIcon, SparkleIcon, UserIcon } from './icons.jsx';

const Sidebar = ({ 
    isSidebarOpen, 
    conversations, 
    activeConversationId, 
    setActiveConversationId, 
    startNewChat, 
    handleSummarize,
    isLoading 
}) => {
  return (
    <aside className={`bg-gray-900 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-72' : 'w-0'} overflow-hidden`}>
      <div className="p-4 flex flex-col h-full">
        <div className="flex items-center gap-3 mb-4">
            <LogoIcon />
            <h1 className="text-xl font-semibold">Deep-Shiva</h1>
        </div>
        <button onClick={startNewChat} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-700 transition-colors w-full text-left mb-2">
          <PlusIcon />
          New Chat
        </button>
        <button 
          onClick={handleSummarize} 
          disabled={isLoading || !activeConversationId || conversations[activeConversationId]?.messages.length < 1} 
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-700 transition-colors w-full text-left mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <SparkleIcon />
          Summarize Title
        </button>
        <div className="flex-grow overflow-y-auto pr-2">
          {Object.values(conversations).map(convo => (
            <div 
              key={convo.id} 
              onClick={() => setActiveConversationId(convo.id)}
              className={`p-3 rounded-lg cursor-pointer truncate ${activeConversationId === convo.id ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
            >
              {convo.title}
            </div>
          ))}
        </div>
        <div className="border-t border-gray-700 pt-4">
          <div className="p-3 rounded-lg hover:bg-gray-700 cursor-pointer flex items-center gap-3">
            <UserIcon />
            <span>Profile</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
