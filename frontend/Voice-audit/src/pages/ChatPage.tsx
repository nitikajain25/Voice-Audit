import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { logout } from '../firebase/auth';
import { processText, getGoogleAuthUrl, checkBackendHealth, checkGoogleConnection } from '../services/api.service';
import { 
  createChat, 
  saveMessage, 
  loadUserChats, 
  loadChatMessages,
  updateChatTitle,
  saveUserProfile 
} from '../services/firestore.service';
import { initChromeExtension } from '../services/chromeExtension.service';
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

// Extend Window interface for webkitSpeechRecognition
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
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
  const [transcribedText, setTranscribedText] = useState<string>('');
  const recognitionRef = useRef<any>(null);
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
<<<<<<< HEAD
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
=======
  const [textInput, setTextInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [backendConnected, setBackendConnected] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
>>>>>>> 4b3f2fd1c26ad46d6d9e50917b75c034d1cc67db
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

<<<<<<< HEAD
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);
=======
  // Load user data and chats on mount
  useEffect(() => {
    if (!currentUser) {
      navigate('/auth');
      return;
    }

    // Save user profile if not already saved
    saveUserProfile(currentUser).catch(console.error);

    // Load chat history from Firestore
    loadUserChats(currentUser.uid)
      .then((chats) => {
        if (chats.length > 0) {
          // Convert FirestoreChatHistory to ChatHistory format
          const formattedChats: ChatHistory[] = chats.map((chat) => ({
            id: chat.id || Date.now().toString(),
            title: chat.title,
            messages: [], // Messages will be loaded separately
            createdAt: chat.createdAt instanceof Date ? chat.createdAt : new Date(),
          }));
          setChatHistories(formattedChats);
          
          // Load messages for the first chat
          const firstChat = chats[0];
          if (firstChat.id) {
            setCurrentChatId(firstChat.id);
            loadChatMessages(firstChat.id).then((loadedMessages) => {
              if (loadedMessages.length > 0) {
                const formattedMessages: Message[] = loadedMessages.map((msg) => ({
                  id: msg.id || Date.now().toString(),
                  text: msg.text,
                  sender: msg.sender,
                  timestamp: msg.timestamp instanceof Date ? msg.timestamp : new Date(),
                }));
                setMessages(formattedMessages);
              } else {
                // Default welcome message
                setMessages([{
                  id: '1',
                  text: 'Hello! I\'m your voice audit. Type a command to get started.',
                  sender: 'assistant',
                  timestamp: new Date(),
                }]);
              }
            });
          }
        } else {
          // Create first chat if none exists
          createChat(currentUser.uid, 'New Chat').then((chatId) => {
            setCurrentChatId(chatId);
            setChatHistories([{
              id: chatId,
              title: 'New Chat',
              messages: [],
              createdAt: new Date(),
            }]);
          });
        }
      })
      .catch((error) => {
        console.error('Error loading chats:', error);
      });

    // Check backend connection
    checkBackendHealth()
      .then(() => {
        setBackendConnected(true);
        addSystemMessage('Backend connected successfully!');
      })
      .catch((error) => {
        setBackendConnected(false);
        addSystemMessage(`⚠️ ${error.message}`);
      });

    // Check Google connection status
    if (currentUser) {
      checkGoogleConnection()
        .then((result) => {
          const connected = result.connected || result.isConnected || false;
          setIsGoogleConnected(connected);
          if (connected) {
            console.log('✅ Google account is connected');
          } else {
            console.log('⚠️ Google account not connected');
          }
        })
        .catch((error) => {
          console.error('Error checking Google connection:', error);
          setIsGoogleConnected(false);
        });
    }

    // Initialize Chrome extension integration
    const cleanupExtension = initChromeExtension((text: string) => {
      // When extension sends text, automatically submit it
      if (text.trim() && !isProcessing) {
        handleTextSubmit(text);
      }
    });

    // Cleanup on unmount
    return () => {
      cleanupExtension();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, navigate]);

  const addSystemMessage = (text: string) => {
    const systemMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'assistant',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, systemMessage]);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
>>>>>>> 4b3f2fd1c26ad46d6d9e50917b75c034d1cc67db

  const startListening = () => {
    if (isRecording) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in your browser. Please use Chrome or Edge.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsRecording(true);
      setTranscribedText('');
    };

    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      setTranscribedText(text);
      setIsRecording(false);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
      if (event.error === 'no-speech') {
        alert('No speech detected. Please try again.');
      } else if (event.error === 'not-allowed') {
        alert('Microphone permission denied. Please allow microphone access.');
      }
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

<<<<<<< HEAD
  const handleSend = () => {
    if (transcribedText.trim()) {
      handleTextSubmit(transcribedText);
      setTranscribedText('');
    }
  };

  const handleCancel = () => {
    if (isRecording) {
      stopRecording();
    }
    setTranscribedText('');
  };

  const handleRecordAgain = () => {
    handleCancel();
    startListening();
  };

  const handleTextSubmit = async (text: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      text: text,
=======
  const handleAudioSubmit = async (_audioBlob: Blob) => {
    // Note: Chrome extension converts audio to text, so we'll use text input instead
    // This function is kept for compatibility but text input is the primary method
    const userMessage: Message = {
      id: Date.now().toString(),
      text: '[Voice Command Recorded - Please use text input]',
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    addSystemMessage('Please type your command in the text input below, or use the Chrome extension to convert voice to text.');
  };

  const handleTextSubmit = async (text: string) => {
    if (!text.trim() || isProcessing || !currentUser) return;

    // Check if command likely requires Google (quick check before sending)
    const lowerText = text.toLowerCase();
    const needsGoogle = lowerText.includes('meeting') || lowerText.includes('schedule') || 
                       lowerText.includes('calendar') || lowerText.includes('event') ||
                       lowerText.includes('task') || lowerText.includes('todo') ||
                       lowerText.includes('email') || lowerText.includes('send') ||
                       lowerText.includes('gmail') || lowerText.includes('mail');

    // If command needs Google but not connected, show helpful message
    if (needsGoogle && !isGoogleConnected) {
      const userMessage: Message = {
        id: Date.now().toString(),
        text: text.trim(),
        sender: 'user',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `❌ Google account not connected.\n\n💡 To use Calendar, Tasks, or Gmail features, please:\n1. Click the "🔗 Connect Google" button in the sidebar (bottom left)\n2. Complete the authorization\n3. Try your command again\n\nYour command: "${text.trim()}"`,
        sender: 'assistant',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      return;
    }

    // Ensure we have a chat ID
    let chatId = currentChatId;
    if (chatId === '1' || !chatId) {
      // Create new chat if needed
      chatId = await createChat(currentUser.uid, text.substring(0, 30) || 'New Chat');
      setCurrentChatId(chatId);
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
>>>>>>> 4b3f2fd1c26ad46d6d9e50917b75c034d1cc67db
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    
    // Save user message to Firestore
    saveMessage(chatId, {
      text: text.trim(),
      sender: 'user',
      chatId,
    }).catch(console.error);

    setTextInput('');
    setIsProcessing(true);

    try {
      const response = await processText(text.trim());
      
      // Check if response indicates Google auth is needed
      const needsAuth = !response.success && (
        response.message?.includes("not connected") || 
        response.message?.includes("authenticate") ||
        response.message?.includes("Connect Google")
      );
      
      let messageText = response.success 
        ? `✅ ${response.message}\n${response.data ? JSON.stringify(response.data, null, 2) : ''}`
        : `❌ ${response.message}`;
      
      // Add helpful message if Google auth is needed
      if (needsAuth && !isGoogleConnected) {
        messageText += `\n\n💡 Tip: Click the "Connect Google" button in the sidebar to enable Calendar, Tasks, and Gmail features.`;
      }
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: messageText,
        sender: 'assistant',
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, assistantMessage]);
      
      // Save assistant message to Firestore
      saveMessage(chatId, {
        text: assistantMessage.text,
        sender: 'assistant',
        chatId,
      }).catch(console.error);

      // Update chat title if it's still "New Chat"
      const currentChat = chatHistories.find(c => c.id === chatId);
      if (currentChat && currentChat.title === 'New Chat') {
        const newTitle = text.substring(0, 30) || 'Chat';
        updateChatTitle(chatId, newTitle).catch(console.error);
        setChatHistories(prev => prev.map(c => 
          c.id === chatId ? { ...c, title: newTitle } : c
        ));
      }
    } catch (error: any) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `❌ Error: ${error.message || 'Failed to process request. Make sure backend is running and you are authenticated.'}`,
        sender: 'assistant',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      
      // Save error message to Firestore
      saveMessage(chatId, {
        text: errorMessage.text,
        sender: 'assistant',
        chatId,
      }).catch(console.error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConnectGoogle = async () => {
    if (!currentUser) {
      addSystemMessage('❌ Please sign in first');
      return;
    }

    try {
      const authUrl = await getGoogleAuthUrl();
      
      // Open OAuth flow in popup window
      const popup = window.open(
        authUrl,
        'Google OAuth',
        'width=500,height=600,left=100,top=100'
      );

      if (!popup) {
        addSystemMessage('❌ Popup blocked. Please allow popups and try again.');
        return;
      }

      addSystemMessage('Opening Google OAuth... Please complete the authorization in the popup window.');

      // Listen for OAuth success message from popup
      const messageHandler = async (event: MessageEvent) => {
        // Security: In production, verify event.origin
        if (event.data && event.data.type === 'GOOGLE_OAUTH_SUCCESS') {
          window.removeEventListener('message', messageHandler);
          
          // Check Google connection status
          try {
            const status = await checkGoogleConnection();
            if (status.connected) {
              setIsGoogleConnected(true);
              addSystemMessage('✅ Google account connected successfully! You can now use Calendar, Tasks, and Gmail features.');
            } else {
              addSystemMessage('⚠️ OAuth completed but connection status unclear. Please try again.');
            }
          } catch (error: any) {
            console.error('Error checking Google connection:', error);
            addSystemMessage('⚠️ OAuth completed. Please refresh to verify connection.');
          }
        }
      };

      window.addEventListener('message', messageHandler);

      // Also check if popup is closed (fallback)
      const checkPopup = setInterval(async () => {
        if (popup.closed) {
          clearInterval(checkPopup);
          window.removeEventListener('message', messageHandler);
          
          // Only check if we didn't already get a success message
          setTimeout(async () => {
            try {
              const status = await checkGoogleConnection();
              if (status.connected && !isGoogleConnected) {
                setIsGoogleConnected(true);
                addSystemMessage('✅ Google account connected!');
              }
            } catch (error) {
              // Silent fail - user might have cancelled
            }
          }, 1000);
        }
      }, 1000);

      // Cleanup after 5 minutes
      setTimeout(() => {
        clearInterval(checkPopup);
        window.removeEventListener('message', messageHandler);
        if (!popup.closed) {
          popup.close();
        }
      }, 5 * 60 * 1000);

    } catch (error: any) {
      console.error('Error connecting Google:', error);
      addSystemMessage(`❌ Failed to connect Google: ${error.message}`);
    }
  };

  const handleNewChat = async () => {
    if (!currentUser) return;

    try {
      const chatId = await createChat(currentUser.uid, 'New Chat');
      const newChat: ChatHistory = {
        id: chatId,
        title: 'New Chat',
        messages: [],
        createdAt: new Date(),
      };
      setChatHistories((prev) => [newChat, ...prev]);
      setCurrentChatId(chatId);
      setMessages([
        {
          id: '1',
          text: 'Hello! I\'m your voice audit. Type a command to get started.',
          sender: 'assistant',
          timestamp: new Date(),
        },
      ]);
    } catch (error) {
      console.error('Error creating new chat:', error);
    }
  };

  const handleChatSelect = async (chatId: string) => {
    const chat = chatHistories.find((c) => c.id === chatId);
    if (chat) {
      setCurrentChatId(chatId);
      
      // Load messages from Firestore
      try {
        const loadedMessages = await loadChatMessages(chatId);
        if (loadedMessages.length > 0) {
          const formattedMessages: Message[] = loadedMessages.map((msg) => ({
            id: msg.id || Date.now().toString(),
            text: msg.text,
            sender: msg.sender,
            timestamp: msg.timestamp instanceof Date ? msg.timestamp : new Date(),
          }));
          setMessages(formattedMessages);
        } else {
          setMessages([
            {
              id: '1',
              text: 'Hello! I\'m your voice audit. Type a command to get started.',
              sender: 'assistant',
              timestamp: new Date(),
            },
          ]);
        }
      } catch (error) {
        console.error('Error loading messages:', error);
        setMessages([
          {
            id: '1',
            text: 'Hello! I\'m your voice audit. Type a command to get started.',
            sender: 'assistant',
            timestamp: new Date(),
          },
        ]);
      }
    }
  };

  return (
    <div className="chat-page">
      <div className={`chat-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
<<<<<<< HEAD
          {!sidebarCollapsed && (
            <>
              <h2>Voice Audit</h2>
              <button className="new-chat-btn" onClick={handleNewChat}>
                + New Chat
              </button>
            </>
          )}
          <button 
            className="sidebar-toggle-btn"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
=======
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
          {!isGoogleConnected && (
            <button
              className="connect-google-btn"
              onClick={handleConnectGoogle}
              disabled={isProcessing}
              style={{
                width: '100%',
                padding: '10px',
                marginBottom: '10px',
                backgroundColor: '#4285f4',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              🔗 Connect Google
            </button>
          )}
          {isGoogleConnected && (
            <div style={{
              width: '100%',
              padding: '10px',
              marginBottom: '10px',
              backgroundColor: '#34a853',
              color: 'white',
              borderRadius: '5px',
              fontSize: '14px',
              textAlign: 'center',
              fontWeight: '500'
            }}>
              ✅ Google Connected
            </div>
          )}
          <button
            className="account-btn"
            onClick={() => setShowAccountMenu(!showAccountMenu)}
>>>>>>> 4b3f2fd1c26ad46d6d9e50917b75c034d1cc67db
          >
            <i className={`bi bi-chevron-${sidebarCollapsed ? 'right' : 'left'}`}></i>
          </button>
        </div>

        {!sidebarCollapsed && (
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
        )}

        {!sidebarCollapsed && (
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
                className="account-menu-item"
                onClick={handleConnectGoogle}
              >
                {isGoogleConnected ? '✓ Google Connected' : 'Connect Google'}
              </div>
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
        )}
      </div>

      <div className="chat-main">
        <div className="chat-header">
          <h1>Voice Audit</h1>
        </div>
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
<<<<<<< HEAD
          {transcribedText ? (
            <div className="voice-input-wrapper">
              <div className="recording-controls">
                <button
                  className="control-btn record-again-btn"
                  onClick={handleRecordAgain}
                  title="Record Again"
                >
                  <i className="bi bi-mic-fill"></i>
                </button>
                <button
                  className="control-btn cancel-btn"
                  onClick={handleCancel}
                  title="Cancel"
                >
                  <i className="bi bi-x-lg"></i>
                </button>
              </div>
              <div className="voice-input-text">
                <p className="voice-input-title">
                  {transcribedText}
                </p>
                <p className="voice-input-subtitle">
                  Review your transcription or send
                </p>
              </div>
              <button
                className="send-btn-circle"
                onClick={handleSend}
                title="Send"
              >
                <i className="bi bi-send-fill"></i>
              </button>
            </div>
          ) : (
            <div className="voice-input-wrapper">
              <button
                className={`record-btn-circle ${isRecording ? 'recording' : ''}`}
                onClick={isRecording ? stopRecording : startListening}
                title={isRecording ? 'Stop Recording' : 'Click to Start Recording'}
              >
                <i className={`bi ${isRecording ? 'bi-stop-fill' : 'bi-mic-fill'}`}></i>
              </button>
              <div className="voice-input-text">
                <p className="voice-input-title">
                  {isRecording ? 'Listening...' : 'Click to Start Recording'}
                </p>
                <p className="voice-input-subtitle">
                  Speak your command and click send
                </p>
              </div>
              <button
                className="send-btn-circle"
                onClick={handleSend}
                title="Send"
                disabled={!transcribedText}
              >
                <i className="bi bi-send-fill"></i>
              </button>
=======
          <div className="input-wrapper">
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleTextSubmit(textInput);
                }
              }}
              placeholder="Type your command here or use Chrome extension for voice..."
              className="text-input"
              disabled={isProcessing || !backendConnected}
            />
            <button
              onClick={() => handleTextSubmit(textInput)}
              disabled={!textInput.trim() || isProcessing || !backendConnected}
              className="send-btn"
            >
              {isProcessing ? 'Processing...' : 'Send'}
            </button>
          </div>
          <button
            className={`record-btn ${isRecording ? 'recording' : ''}`}
            onMouseDown={startRecording}
            onMouseUp={stopRecording}
            onTouchStart={startRecording}
            onTouchEnd={stopRecording}
            title="Hold to record (Chrome extension will convert to text)"
            disabled={!backendConnected}
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
          {!backendConnected && (
            <div className="backend-status">
              ⚠️ Backend not connected. Please start the backend server.
>>>>>>> 4b3f2fd1c26ad46d6d9e50917b75c034d1cc67db
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;

