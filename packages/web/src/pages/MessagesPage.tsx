import React, { useState, useEffect, useRef } from 'react';
import { FiMessageCircle, FiSend, FiUser, FiSearch, FiMoreVertical, FiPlus, FiPaperclip, FiSmile } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedBackground, GlassCard, GlassButton, GlassInput } from '../components/ui';

interface User {
  id: number;
  username: string;
  email: string | null;
}

interface Message {
  id: number;
  senderId: number;
  senderName: string;
  content: string;
  timestamp: string;
  type: 'text' | 'image' | 'file';
}

interface Chat {
  id: number;
  participants: User[];
  lastMessage: Message | null;
  unreadCount: number;
  isOnline: boolean;
}

const MessagesPage: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load user data from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse user data');
      }
    }

    // Mock data for demonstration
    const mockChats: Chat[] = [
      {
        id: 1,
        participants: [
          { id: 2, username: 'alice', email: 'alice@example.com' },
          { id: 3, username: 'bob', email: 'bob@example.com' },
        ],
        lastMessage: {
          id: 1,
          senderId: 2,
          senderName: 'alice',
          content: 'Hey! How is the project going?',
          timestamp: '2024-12-23T10:30:00Z',
          type: 'text',
        },
        unreadCount: 2,
        isOnline: true,
      },
      {
        id: 2,
        participants: [
          { id: 4, username: 'charlie', email: 'charlie@example.com' },
        ],
        lastMessage: {
          id: 2,
          senderId: 4,
          senderName: 'charlie',
          content: 'The API changes look good! 👍',
          timestamp: '2024-12-22T15:45:00Z',
          type: 'text',
        },
        unreadCount: 0,
        isOnline: false,
      },
      {
        id: 3,
        participants: [
          { id: 5, username: 'diana', email: 'diana@example.com' },
        ],
        lastMessage: {
          id: 3,
          senderId: 5,
          senderName: 'diana',
          content: 'Can you review my pull request?',
          timestamp: '2024-12-21T09:15:00Z',
          type: 'text',
        },
        unreadCount: 1,
        isOnline: true,
      },
    ];

    setChats(mockChats);
  }, []);

  useEffect(() => {
    if (selectedChat) {
      // Mock messages for the selected chat
      const mockMessages: Message[] = [
        {
          id: 1,
          senderId: selectedChat.participants[0].id,
          senderName: selectedChat.participants[0].username,
          content: 'Hi there! How are you doing?',
          timestamp: '2024-12-23T09:00:00Z',
          type: 'text',
        },
        {
          id: 2,
          senderId: currentUser?.id || 1,
          senderName: currentUser?.username || 'You',
          content: 'I\'m doing great! Working on some new features.',
          timestamp: '2024-12-23T09:05:00Z',
          type: 'text',
        },
        {
          id: 3,
          senderId: selectedChat.participants[0].id,
          senderName: selectedChat.participants[0].username,
          content: 'That sounds exciting! What kind of features?',
          timestamp: '2024-12-23T09:10:00Z',
          type: 'text',
        },
        ...(selectedChat.lastMessage ? [selectedChat.lastMessage] : []),
      ];
      setMessages(mockMessages);
    }
  }, [selectedChat, currentUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedChat || !currentUser) return;

    const message: Message = {
      id: messages.length + 1,
      senderId: currentUser.id,
      senderName: currentUser.username,
      content: newMessage,
      timestamp: new Date().toISOString(),
      type: 'text',
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const filteredChats = chats.filter(chat =>
    chat.participants.some(participant =>
      participant.username.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  if (!currentUser) {
    return (
      <AnimatedBackground variant="blue" particles={true} particleCount={20} reduced={true}>
        <div className="min-h-screen flex items-center justify-center px-4">
          <GlassCard className="text-center">
            <div className="text-blue-400 mb-4">
              <FiMessageCircle className="h-16 w-16 mx-auto mb-4" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Messages not available</h2>
            <p className="text-gray-300 mb-6">Please log in to access your messages.</p>
            <GlassButton variant="primary" size="lg">
              Sign in
            </GlassButton>
          </GlassCard>
        </div>
      </AnimatedBackground>
    );
  }

  return (
    <AnimatedBackground variant="blue" particles={true} particleCount={25} reduced={true}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2 text-center"
              style={{
                filter: 'drop-shadow(0 0 20px rgba(59, 130, 246, 0.8))',
                textShadow: '0 0 30px rgba(59, 130, 246, 0.6), 0 0 60px rgba(59, 130, 246, 0.4)',
              }}>
            Messages
          </h1>
          <p className="text-blue-200 text-center">Connect and collaborate with your team</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <GlassCard className="overflow-hidden" style={{ height: '650px' }}>
            <div className="flex h-full">
              {/* Enhanced Chat List Sidebar */}
              <div className="w-80 border-r border-white/10 flex flex-col">
                {/* Enhanced Header */}
                <div className="p-6 border-b border-white/10">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-white flex items-center">
                      <FiMessageCircle className="mr-3 text-blue-400" />
                      Conversations
                    </h2>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 text-blue-400 hover:text-blue-300 rounded-lg hover:bg-white/10 transition-all duration-200"
                    >
                      <FiPlus className="h-5 w-5" />
                    </motion.button>
                  </div>
                  
                  {/* Enhanced Search */}
                  <div className="relative">
                    <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-400 h-4 w-4" />
                    <GlassInput
                      type="text"
                      placeholder="Search conversations..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-12"
                    />
                  </div>
                </div>

                {/* Enhanced Chat List */}
                <div className="flex-1 overflow-y-auto">
                  <AnimatePresence>
                    {filteredChats.map((chat, index) => {
                      const otherParticipant = chat.participants[0];
                      return (
                        <motion.div
                          key={chat.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ delay: index * 0.1 }}
                          onClick={() => setSelectedChat(chat)}
                          className={`p-4 border-b border-white/5 cursor-pointer hover:bg-white/10 transition-all duration-200 ${
                            selectedChat?.id === chat.id ? 'bg-blue-500/20 border-blue-400/40' : ''
                          }`}
                          whileHover={{ x: 4 }}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="relative flex-shrink-0">
                              <motion.div
                                whileHover={{ scale: 1.05 }}
                                className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center shadow-lg"
                              >
                                <span className="text-sm font-medium text-white">
                                  {otherParticipant.username.charAt(0).toUpperCase()}
                                </span>
                              </motion.div>
                              {chat.isOnline && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-400 rounded-full border-2 border-gray-900 shadow-lg"
                                />
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-white truncate">
                                  {otherParticipant.username}
                                </p>
                                {chat.lastMessage && (
                                  <p className="text-xs text-blue-300">
                                    {formatTime(chat.lastMessage.timestamp)}
                                  </p>
                                )}
                              </div>
                              {chat.lastMessage && (
                                <div className="flex items-center justify-between">
                                  <p className="text-sm text-gray-300 truncate">
                                    {chat.lastMessage.content}
                                  </p>
                                  {chat.unreadCount > 0 && (
                                    <motion.span
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      className="ml-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center shadow-lg"
                                    >
                                      {chat.unreadCount}
                                    </motion.span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>

              {/* Enhanced Main Chat Area */}
              <div className="flex-1 flex flex-col">
                {selectedChat ? (
                  <>
                    {/* Enhanced Chat Header */}
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-6 border-b border-white/10 bg-white/5 backdrop-blur-sm"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center shadow-lg">
                            <span className="text-sm font-medium text-white">
                              {selectedChat.participants[0].username.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <h3 className="text-lg font-medium text-white">
                              {selectedChat.participants[0].username}
                            </h3>
                            <p className="text-sm text-blue-300 flex items-center">
                              <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                                selectedChat.isOnline ? 'bg-green-400' : 'bg-gray-400'
                              }`} />
                              {selectedChat.isOnline ? 'Online' : 'Offline'}
                            </p>
                          </div>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 text-blue-400 hover:text-blue-300 rounded-lg hover:bg-white/10 transition-all duration-200"
                        >
                          <FiMoreVertical className="h-5 w-5" />
                        </motion.button>
                      </div>
                    </motion.div>

                    {/* Enhanced Messages */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                      <AnimatePresence>
                        {messages.map((message, index) => {
                          const isCurrentUser = message.senderId === currentUser.id;
                          const showDate = index === 0 || 
                            formatDate(message.timestamp) !== formatDate(messages[index - 1].timestamp);

                          return (
                            <motion.div
                              key={message.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                              transition={{ delay: index * 0.05 }}
                            >
                              {showDate && (
                                <div className="text-center my-6">
                                  <span className="text-xs text-blue-300 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                                    {formatDate(message.timestamp)}
                                  </span>
                                </div>
                              )}
                              <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                                <motion.div
                                  whileHover={{ scale: 1.02 }}
                                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl backdrop-blur-sm shadow-lg ${
                                    isCurrentUser
                                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                                      : 'bg-white/20 text-white border border-white/20'
                                  }`}
                                >
                                  <p className="text-sm leading-relaxed">{message.content}</p>
                                  <p className={`text-xs mt-2 ${
                                    isCurrentUser ? 'text-blue-100' : 'text-blue-300'
                                  }`}>
                                    {formatTime(message.timestamp)}
                                  </p>
                                </motion.div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Enhanced Message Input */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-6 border-t border-white/10 bg-white/5 backdrop-blur-sm"
                    >
                      <div className="flex items-center space-x-3">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 text-blue-400 hover:text-blue-300 rounded-lg hover:bg-white/10 transition-all duration-200"
                        >
                          <FiPaperclip className="h-5 w-5" />
                        </motion.button>
                        <div className="flex-1 relative">
                          <GlassInput
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder="Type a message..."
                            className="rounded-full"
                          />
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 text-blue-400 hover:text-blue-300 rounded-lg hover:bg-white/10 transition-all duration-200"
                        >
                          <FiSmile className="h-5 w-5" />
                        </motion.button>
                        <GlassButton
                          onClick={handleSendMessage}
                          disabled={!newMessage.trim()}
                          variant="primary"
                          size="sm"
                          className="!p-3 rounded-full"
                          style={{
                            background: !newMessage.trim() ? 
                              'rgba(59, 130, 246, 0.3)' :
                              'linear-gradient(135deg, #3B82F6 0%, #2563EB 50%, #1D4ED8 100%)',
                            boxShadow: !newMessage.trim() ? 'none' : '0 4px 20px rgba(59, 130, 246, 0.4)',
                          }}
                        >
                          <FiSend className="h-5 w-5" />
                        </GlassButton>
                      </div>
                    </motion.div>
                  </>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex-1 flex items-center justify-center"
                  >
                    <div className="text-center">
                      <div className="text-blue-400 mb-6">
                        <FiMessageCircle className="h-20 w-20 mx-auto mb-4" />
                      </div>
                      <h3 className="text-2xl font-medium text-white mb-2">No conversation selected</h3>
                      <p className="text-blue-200 mb-6">
                        Choose a conversation from the sidebar to start messaging.
                      </p>
                      <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </AnimatedBackground>
  );
};

export default MessagesPage;