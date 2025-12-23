import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { logout } from '../firebase/auth';
import './ChatPage.css';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

interface ChatHistory {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
}

const ChatPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m your voice audit. Record a command to get started.',
      sender: 'assistant',
      timestamp: new Date(),
    },
  ]);
  const [isRecording, setIsRecording] = useState(false);
  const [chatHistories, setChatHistories] = useState<ChatHistory[]>([
    {
      id: '1',
      title: 'New Chat',
      messages: [],
      createdAt: new Date(),
    },
  ]);
  const [currentChatId, setCurrentChatId] = useState('1');
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        handleAudioSubmit(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleAudioSubmit = async (_audioBlob: Blob) => {
    // Simulate sending audio to service
    // In production, _audioBlob would be sent to the backend API
    const userMessage: Message = {
      id: Date.now().toString(),
      text: '[Voice Command Recorded]',
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);

    // Simulate processing delay
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'I received your voice command. Processing your request...',
        sender: 'assistant',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    }, 1000);
  };

  const handleNewChat = () => {
    const newChat: ChatHistory = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [],
      createdAt: new Date(),
    };
    setChatHistories((prev) => [newChat, ...prev]);
    setCurrentChatId(newChat.id);
    setMessages([
      {
        id: '1',
        text: 'Hello! I\'m your voice audit. Record a command to get started.',
        sender: 'assistant',
        timestamp: new Date(),
      },
    ]);
  };

  const handleChatSelect = (chatId: string) => {
    const chat = chatHistories.find((c) => c.id === chatId);
    if (chat) {
      setCurrentChatId(chatId);
      setMessages(chat.messages.length > 0 ? chat.messages : [
        {
          id: '1',
          text: 'Hello! I\'m your voice audit. Record a command to get started.',
          sender: 'assistant',
          timestamp: new Date(),
        },
      ]);
    }
  };

  return (
    <div className="chat-page">
      <div className="chat-sidebar">
        <div className="sidebar-header">
          <h2>Voice Audit</h2>
          <button className="new-chat-btn" onClick={handleNewChat}>
            + New Chat
          </button>
        </div>

        <div className="chat-history">
          {chatHistories.map((chat) => (
            <div
              key={chat.id}
              className={`chat-history-item ${currentChatId === chat.id ? 'active' : ''}`}
              onClick={() => handleChatSelect(chat.id)}
            >
              <span className="chat-icon">💬</span>
              <span className="chat-title">{chat.title}</span>
            </div>
          ))}
        </div>

        <div className="sidebar-footer">
          <button
            className="account-btn"
            onClick={() => setShowAccountMenu(!showAccountMenu)}
          >
            <span className="account-icon">👤</span>
            <span>{currentUser?.displayName || currentUser?.email || 'Account'}</span>
          </button>
          {showAccountMenu && (
            <div className="account-menu">
              <div className="account-menu-user-info">
                <div className="account-menu-email">{currentUser?.email}</div>
                {currentUser?.displayName && (
                  <div className="account-menu-name">{currentUser.displayName}</div>
                )}
              </div>
              <div className="account-menu-divider"></div>
              <div className="account-menu-item">Profile</div>
              <div className="account-menu-item">Settings</div>
              <div 
                className="account-menu-item account-menu-item-danger"
                onClick={async () => {
                  try {
                    await logout();
                    navigate('/auth');
                  } catch (error) {
                    console.error('Error signing out:', error);
                  }
                }}
              >
                Sign Out
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="chat-main">
        <div className="chat-messages">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`message ${message.sender === 'user' ? 'user-message' : 'assistant-message'}`}
            >
              <div className="message-content">
                {message.text}
              </div>
              <div className="message-time">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-container">
          <button
            className={`record-btn ${isRecording ? 'recording' : ''}`}
            onMouseDown={startRecording}
            onMouseUp={stopRecording}
            onTouchStart={startRecording}
            onTouchEnd={stopRecording}
            title="Hold to record"
          >
            {isRecording ? (
              <>
                <span className="record-icon">⏹</span>
                <span>Recording...</span>
              </>
            ) : (
              <>
                <span className="record-icon">🎤</span>
                <span>Hold to Record</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;

