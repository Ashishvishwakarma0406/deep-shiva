import React, { useState } from 'react';
import Sidebar from './Components/Sidebar.jsx';
import ChatArea from './Components/ChatArea.jsx';
import PromptBar from './Components/PromptBar.jsx';
import { HamburgerIcon } from './Components/icons.jsx';

const initialConversations = {
    '1': {
        id: '1',
        title: 'React vs. Vue',
        messages: [{ role: 'assistant', content: 'Comparing React and Vue. Where should we start?' }]
    },
    '2': {
        id: '2',
        title: 'History of AI',
        messages: [{ role: 'assistant', content: 'The history of AI is fascinating. Ask me anything!' }]
    }
};

const defaultMessage = { role: 'assistant', content: "Hello! I'm your AI assistant. How can I help you today?" };

export default function App() {
  const [conversations, setConversations] = useState(initialConversations);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const activeConversation = activeConversationId ? conversations[activeConversationId] : null;
  const messages = activeConversation ? activeConversation.messages : [defaultMessage];
  
  const callLocalLlmAPI = async (messageHistory, stream = true) => {
      const payload = {
          model: "mistral",
          messages: messageHistory,
          stream: stream
      };
      const apiUrl = `/api/chat`; 
      
      const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
      });

      if (!response.ok) {
          const errorBody = await response.text();
          throw new Error(`API call failed with status: ${response.status}. Body: ${errorBody}`);
      }
      
      return response;
  };

  const handleSend = async () => {
    if (input.trim() === '' || isLoading) return;

    const currentInput = input;
    setInput('');
    setIsLoading(true);

    const newUserMessage = { role: 'user', content: currentInput };
    let conversationId = activeConversationId;
    let isNewConversation = false;

    // If there's no active conversation, prepare to create a new one.
    if (!conversationId) {
        isNewConversation = true;
        conversationId = crypto.randomUUID();
    }

    // Add user message and assistant placeholder in a single state update.
    setConversations(prev => {
        const updatedConversations = { ...prev };
        
        // Create new conversation if it doesn't exist
        if (isNewConversation) {
            updatedConversations[conversationId] = {
                id: conversationId,
                title: currentInput.substring(0, 30) + (currentInput.length > 30 ? '...' : ''),
                messages: []
            };
        }
        
        // Add messages to the conversation
        const currentMessages = updatedConversations[conversationId].messages;
        updatedConversations[conversationId].messages = [
            ...currentMessages,
            newUserMessage,
            { role: 'assistant', content: '' } // Placeholder for streaming
        ];
        
        return updatedConversations;
    });

    if (isNewConversation) {
        setActiveConversationId(conversationId);
    }

    try {
        const messageHistory = conversations[conversationId] ? 
            [...conversations[conversationId].messages, newUserMessage] : 
            [newUserMessage];

        const response = await callLocalLlmAPI(messageHistory, true);
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        
        let streamedText = '';
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value);
            const lines = chunk.split('\n').filter(line => line.startsWith('data: '));

            for (const line of lines) {
                const jsonStr = line.replace(/^data: /, '');
                try {
                    const parsedChunk = JSON.parse(jsonStr);
                    const delta = parsedChunk.choices[0]?.delta?.content;
                    if (delta) {
                        streamedText += delta;
                        setConversations(prev => {
                            const updatedConvo = { ...prev[conversationId] };
                            const lastMessageIndex = updatedConvo.messages.length - 1;
                            updatedConvo.messages[lastMessageIndex].content = streamedText;
                            return { ...prev, [conversationId]: updatedConvo };
                        });
                    }
                } catch (e) {
                     console.error("Error parsing stream chunk:", e, "Chunk:", jsonStr);
                }
            }
        }
    } catch (error) {
        console.error("Error calling local LLM API:", error);
        setConversations(prev => {
            const updatedConvo = { ...prev[conversationId] };
            const lastMessageIndex = updatedConvo.messages.length - 1;
            updatedConvo.messages[lastMessageIndex].content = "Sorry, I couldn't connect to the local model. Please ensure it's running.";
            return { ...prev, [conversationId]: updatedConvo };
        });
    } finally {
        setIsLoading(false);
    }
  };

  const handleSuggestFollowUp = async () => {
      setIsLoading(true);
      const lastMessage = messages[messages.length - 1]?.content;
      if (!lastMessage) {
          setIsLoading(false);
          return;
      }
      const prompt = `Based on the last response: "${lastMessage}", suggest one relevant follow-up question. Provide only the question text.`;
      
      try {
          const messageHistory = [...messages, {role: 'user', content: prompt}];
          const response = await callLocalLlmAPI(messageHistory, false);
          const result = await response.json();
          const content = result.choices[0]?.message?.content;
          if (content) {
              setInput(content.trim().replace(/["']/g, ""));
          }
      } catch (error) {
          console.error("Error getting suggestion:", error);
      } finally {
          setIsLoading(false);
      }
  };

  const handleSummarize = async () => {
      if (!activeConversation || messages.length < 1) return;
      setIsLoading(true);
      const conversationText = messages.map(m => `${m.role}: ${m.content}`).join('\n');
      const prompt = `Summarize the following conversation into a short, 3-5 word title: \n\n${conversationText}`;

      try {
          const messageHistory = [...messages, {role: 'user', content: prompt}];
          const response = await callLocalLlmAPI(messageHistory, false);
          const result = await response.json();
          const title = result.choices[0]?.message?.content;
          if (title) {
              setConversations(prev => {
                  const updatedConvo = { ...prev[activeConversationId], title: title.replace(/["']/g, "") };
                  return { ...prev, [activeConversationId]: updatedConvo };
              });
          }
      } catch (error) {
          console.error("Error summarizing conversation:", error);
      } finally {
          setIsLoading(false);
      }
  };
  
  const startNewChat = () => {
      setActiveConversationId(null);
  }

  return (
    <div className="flex h-screen bg-gray-800 text-white font-sans">
      <Sidebar 
        isSidebarOpen={isSidebarOpen}
        conversations={conversations}
        activeConversationId={activeConversationId}
        setActiveConversationId={setActiveConversationId}
        startNewChat={startNewChat}
        handleSummarize={handleSummarize}
        isLoading={isLoading}
      />
      <main className="flex-1 flex flex-col relative">
        <header className="absolute top-0 left-0 p-4 z-10">
            <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 rounded-md hover:bg-gray-700"
            >
                <HamburgerIcon />
            </button>
        </header>
        <ChatArea messages={messages} />
        <PromptBar 
          input={input}
          setInput={setInput}
          handleSend={handleSend}
          handleSuggestFollowUp={handleSuggestFollowUp}
          isLoading={isLoading}
          messages={messages}
        />
      </main>
    </div>
  );
}
