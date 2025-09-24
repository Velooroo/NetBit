import React, { useState, useEffect, useRef } from 'react';
import { FiMessageCircle, FiSend, FiUser, FiSearch, FiMoreVertical, FiPlus, FiPaperclip, FiSmile } from 'react-icons/fi';

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FiMessageCircle className="mx-auto h-12 w-12 text-gray-400" />
          <h2 className="mt-2 text-xl font-bold text-gray-900">Messages not available</h2>
          <p className="mt-1 text-gray-600">Please log in to access your messages.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden" style={{ height: '600px' }}>
          <div className="flex h-full">
            {/* Chat List Sidebar */}
            <div className="w-80 border-r border-gray-200 flex flex-col">
              {/* Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
                  <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                    <FiPlus className="h-5 w-5" />
                  </button>
                </div>
                
                {/* Search */}
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>

              {/* Chat List */}
              <div className="flex-1 overflow-y-auto">
                {filteredChats.map((chat) => {
                  const otherParticipant = chat.participants[0];
                  return (
                    <div
                      key={chat.id}
                      onClick={() => setSelectedChat(chat)}
                      className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                        selectedChat?.id === chat.id ? 'bg-blue-50 border-blue-200' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-gray-600 flex items-center justify-center">
                            <span className="text-sm font-medium text-white">
                              {otherParticipant.username.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          {chat.isOnline && (
                            <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {otherParticipant.username}
                            </p>
                            {chat.lastMessage && (
                              <p className="text-xs text-gray-500">
                                {formatTime(chat.lastMessage.timestamp)}
                              </p>
                            )}
                          </div>
                          {chat.lastMessage && (
                            <div className="flex items-center justify-between">
                              <p className="text-sm text-gray-600 truncate">
                                {chat.lastMessage.content}
                              </p>
                              {chat.unreadCount > 0 && (
                                <span className="ml-2 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                  {chat.unreadCount}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
              {selectedChat ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200 bg-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 rounded-full bg-gray-600 flex items-center justify-center">
                          <span className="text-sm font-medium text-white">
                            {selectedChat.participants[0].username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">
                            {selectedChat.participants[0].username}
                          </h3>
                          <p className="text-xs text-gray-500">
                            {selectedChat.isOnline ? 'Online' : 'Offline'}
                          </p>
                        </div>
                      </div>
                      <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                        <FiMoreVertical className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((message, index) => {
                      const isCurrentUser = message.senderId === currentUser.id;
                      const showDate = index === 0 || 
                        formatDate(message.timestamp) !== formatDate(messages[index - 1].timestamp);

                      return (
                        <div key={message.id}>
                          {showDate && (
                            <div className="text-center my-4">
                              <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                {formatDate(message.timestamp)}
                              </span>
                            </div>
                          )}
                          <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              isCurrentUser
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-900'
                            }`}>
                              <p className="text-sm">{message.content}</p>
                              <p className={`text-xs mt-1 ${
                                isCurrentUser ? 'text-blue-100' : 'text-gray-500'
                              }`}>
                                {formatTime(message.timestamp)}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-gray-200 bg-white">
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                        <FiPaperclip className="h-5 w-5" />
                      </button>
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="Type a message..."
                          className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                        <FiSmile className="h-5 w-5" />
                      </button>
                      <button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                        className="p-2 text-white bg-blue-600 hover:bg-blue-700 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <FiSend className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <FiMessageCircle className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No conversation selected</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Choose a conversation from the sidebar to start messaging.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;