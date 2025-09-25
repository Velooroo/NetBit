import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiSend, FiPaperclip, FiSmile } from 'react-icons/fi';

const MessagesApp: React.FC = () => {
  const [message, setMessage] = useState('');

  const mockChats = [
    { id: 1, name: 'Development Team', lastMessage: 'New commit pushed to main', time: '10:30 AM', unread: 3, avatar: '👥' },
    { id: 2, name: 'Sarah Wilson', lastMessage: 'Can you review the PR?', time: '9:45 AM', unread: 1, avatar: '👩‍💻' },
    { id: 3, name: 'Project Alpha', lastMessage: 'Meeting at 2 PM', time: 'Yesterday', unread: 0, avatar: '🚀' },
    { id: 4, name: 'Support Team', lastMessage: 'Ticket resolved', time: 'Monday', unread: 0, avatar: '🛠️' },
  ];

  const mockMessages = [
    { id: 1, sender: 'Sarah Wilson', content: 'Hey, can you take a look at the new authentication flow?', time: '9:30 AM', isOwn: false },
    { id: 2, sender: 'You', content: 'Sure! Let me check it out now.', time: '9:32 AM', isOwn: true },
    { id: 3, sender: 'Sarah Wilson', content: 'Great! The PR is #142, I\'ve added some detailed comments.', time: '9:33 AM', isOwn: false },
    { id: 4, sender: 'You', content: 'Looking good! I\'ll review and approve it shortly.', time: '9:45 AM', isOwn: true },
  ];

  const [selectedChat, setSelectedChat] = useState(mockChats[1]);

  const sendMessage = () => {
    if (message.trim()) {
      // Handle message sending logic here
      setMessage('');
    }
  };

  return (
    <div className="h-full flex bg-gray-50">
      {/* Chat List */}
      <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Messages</h2>
        </div>
        
        <div className="flex-1 overflow-auto">
          {mockChats.map((chat) => (
            <motion.div
              key={chat.id}
              className={`p-4 cursor-pointer border-b border-gray-100 hover:bg-gray-50 ${
                selectedChat.id === chat.id ? 'bg-blue-50 border-blue-200' : ''
              }`}
              onClick={() => setSelectedChat(chat)}
              whileHover={{ backgroundColor: '#f9fafb' }}
            >
              <div className="flex items-center space-x-3">
                <div className="text-2xl">{chat.avatar}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900 truncate">{chat.name}</h3>
                    <span className="text-xs text-gray-500">{chat.time}</span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">{chat.lastMessage}</p>
                </div>
                {chat.unread > 0 && (
                  <div className="w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {chat.unread}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Chat Content */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 bg-white border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">{selectedChat.avatar}</div>
            <div>
              <h3 className="font-medium text-gray-900">{selectedChat.name}</h3>
              <p className="text-sm text-green-600">● Online</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-auto p-4 space-y-4">
          {mockMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  msg.isOwn
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-900'
                }`}
              >
                <p className="text-sm">{msg.content}</p>
                <p className={`text-xs mt-1 ${
                  msg.isOwn ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {msg.time}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div className="p-4 bg-white border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <motion.button
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <FiPaperclip size={20} />
            </motion.button>
            
            <div className="flex-1">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type a message..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            
            <motion.button
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <FiSmile size={20} />
            </motion.button>
            
            <motion.button
              onClick={sendMessage}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FiSend size={16} />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesApp;