import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Sidebar from './components/Sidebar/Sidebar';
import ChatHeader from './components/ChatHeader/ChatHeader';
import MessageList from './components/MessageList/MessageList';
import ChatInput from './components/ChatInput/ChatInput';
import './App.css';

const API_BASE_URL = 'http://localhost:3877/api';

function App() {
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);     // ← re-fetch sidebar when bumped
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversations, isLoading]);

  // ─── Load a session's messages when one is selected ───
  const handleSelectSession = async (sessionId) => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/chat/sessions/${sessionId}`);
      if (res.data.success) {
        setActiveSessionId(sessionId);
        setConversations(res.data.data.messages);
      }
    } catch (error) {
      console.error('Error loading session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Start a fresh chat ───
  const handleNewChat = () => {
    setActiveSessionId(null);
    setConversations([]);
  };

  // ─── Send a message ───
  const handleSendMessage = async (question) => {
    const tempUserMessage = { id: Date.now(), role: 'user', content: question };
    setConversations((prev) => [...prev, tempUserMessage]);
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/chat/conversations`, {
        Question: question,
        sessionId: activeSessionId,   // ← null on first message → backend creates a session
      });

      if (response.data.success) {
        const { sessionId, userConversation, assistantConversation } = response.data.data;

        // First message of a brand-new chat → adopt the new session id
        if (!activeSessionId) {
          setActiveSessionId(sessionId);
          setRefreshKey((k) => k + 1);   // tell the sidebar to refresh
        }

        setConversations((prev) => {
          const filtered = prev.filter((msg) => msg.id !== tempUserMessage.id);
          return [...filtered, userConversation, assistantConversation];
        });
      }
    } catch (error) {
      console.error('Error posting conversation:', error);

      const errorMessage =
        error.response?.data?.message ||
        'There was an error generating a response.';

      const errorConversation = {
        id: Date.now() + 1,
        role: 'assistant',
        content: errorMessage,
      };
      setConversations((prev) => [...prev, errorConversation]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='app'>
      <Sidebar
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
        refreshKey={refreshKey}
      />

      <main className='chat'>
        <ChatHeader />

        <MessageList
          conversations={conversations}
          isLoading={isLoading}
          messagesEndRef={messagesEndRef}
        />

        <ChatInput
          handleSendMessage={handleSendMessage}
          isLoading={isLoading}
        />
      </main>
    </div>
  );
}

export default App;
