import React, { useState, useEffect } from 'react';
import { Send, Search, Phone, Video, MoreVertical, Paperclip, Smile } from 'lucide-react';

interface Message {
  id: number;
  content: string;
  sender: string;
  timestamp: Date;
  isOwn: boolean;
}

interface Chat {
  id: number;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  online: boolean;
}

export default function ChatPage() {
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Тестовые данные чатов
  const [chats] = useState<Chat[]>([
    {
      id: 1,
      name: 'Алексей Петров',
      avatar: '👨‍💻',
      lastMessage: 'Привет! Как дела с проектом?',
      timestamp: '14:30',
      unread: 2,
      online: true
    },
    {
      id: 2,
      name: 'Мария Сидорова',
      avatar: '👩‍🎨',
      lastMessage: 'Отправила дизайн макеты',
      timestamp: '13:45',
      unread: 0,
      online: true
    },
    {
      id: 3,
      name: 'Команда Frontend',
      avatar: '👥',
      lastMessage: 'Обсуждаем новые компоненты',
      timestamp: '12:20',
      unread: 5,
      online: false
    },
    {
      id: 4,
      name: 'DevOps Team',
      avatar: '⚙️',
      lastMessage: 'CI/CD pipeline готов',
      timestamp: 'Вчера',
      unread: 0,
      online: false
    },
    {
      id: 5,
      name: 'Анна Козлова',
      avatar: '👩‍💼',
      lastMessage: 'Готовы к деплою?',
      timestamp: 'Вчера',
      unread: 1,
      online: true
    }
  ]);

  // Тестовые сообщения
  const testMessages: { [key: number]: Message[] } = {
    1: [
      { id: 1, content: 'Привет! Как продвигается работа над NetBit?', sender: 'Алексей Петров', timestamp: new Date('2024-01-15T10:00:00'), isOwn: false },
      { id: 2, content: 'Привет! Отлично, уже почти закончили backend на Rust', sender: 'Вы', timestamp: new Date('2024-01-15T10:02:00'), isOwn: true },
      { id: 3, content: 'Супер! А чаты уже работают?', sender: 'Алексей Петров', timestamp: new Date('2024-01-15T10:05:00'), isOwn: false },
      { id: 4, content: 'Да, вот этот интерфейс - живой пример! 😄', sender: 'Вы', timestamp: new Date('2024-01-15T10:07:00'), isOwn: true },
      { id: 5, content: 'Круто! Когда планируете релиз?', sender: 'Алексей Петров', timestamp: new Date('2024-01-15T14:30:00'), isOwn: false }
    ],
    2: [
      { id: 1, content: 'Привет! Отправляю дизайн макеты для новых страниц', sender: 'Мария Сидорова', timestamp: new Date('2024-01-15T13:40:00'), isOwn: false },
      { id: 2, content: 'Спасибо! Посмотрю сегодня', sender: 'Вы', timestamp: new Date('2024-01-15T13:41:00'), isOwn: true },
      { id: 3, content: 'Особое внимание уделите цветовой схеме чатов', sender: 'Мария Сидорова', timestamp: new Date('2024-01-15T13:45:00'), isOwn: false }
    ],
    3: [
      { id: 1, content: 'Всем привет! Обсуждаем новые React компоненты', sender: 'Frontend Lead', timestamp: new Date('2024-01-15T12:00:00'), isOwn: false },
      { id: 2, content: 'Нужно стандартизировать кнопки и инпуты', sender: 'Разработчик 1', timestamp: new Date('2024-01-15T12:05:00'), isOwn: false },
      { id: 3, content: 'Согласен, создам общую библиотеку компонентов', sender: 'Вы', timestamp: new Date('2024-01-15T12:10:00'), isOwn: true },
      { id: 4, content: 'Отлично! Используем Tailwind для стилей?', sender: 'Разработчик 2', timestamp: new Date('2024-01-15T12:15:00'), isOwn: false },
      { id: 5, content: 'Да, у нас уже настроен Tailwind CSS', sender: 'Вы', timestamp: new Date('2024-01-15T12:20:00'), isOwn: true }
    ]
  };

  useEffect(() => {
    if (selectedChat) {
      setMessages(testMessages[selectedChat.id] || []);
    }
  }, [selectedChat]);

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedChat) return;

    const message: Message = {
      id: messages.length + 1,
      content: newMessage,
      sender: 'Вы',
      timestamp: new Date(),
      isOwn: true
    };

    setMessages([...messages, message]);
    setNewMessage('');
  };

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar с чатами */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Заголовок */}
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-800">NetBit Messenger</h1>
          <p className="text-sm text-gray-500">Общение в команде</p>
        </div>

        {/* Поиск */}
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Поиск чатов..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Список чатов */}
        <div className="flex-1 overflow-y-auto">
          {filteredChats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => setSelectedChat(chat)}
              className={`p-4 cursor-pointer border-b border-gray-100 hover:bg-gray-50 ${
                selectedChat?.id === chat.id ? 'bg-blue-50 border-blue-200' : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-lg">
                    {chat.avatar}
                  </div>
                  {chat.online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {chat.name}
                    </h3>
                    <span className="text-xs text-gray-500">{chat.timestamp}</span>
                  </div>
                  <p className="text-sm text-gray-500 truncate">{chat.lastMessage}</p>
                </div>
                {chat.unread > 0 && (
                  <div className="w-5 h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">
                    {chat.unread}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Область сообщений */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* Заголовок чата */}
            <div className="p-4 bg-white border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    {selectedChat.avatar}
                  </div>
                  {selectedChat.online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-medium text-gray-900">{selectedChat.name}</h2>
                  <p className="text-sm text-gray-500">
                    {selectedChat.online ? 'В сети' : 'Был недавно'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full">
                  <Phone className="h-5 w-5" />
                </button>
                <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full">
                  <Video className="h-5 w-5" />
                </button>
                <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full">
                  <MoreVertical className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Сообщения */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.isOwn
                        ? 'bg-blue-500 text-white'
                        : 'bg-white text-gray-900 border border-gray-200'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        message.isOwn ? 'text-blue-100' : 'text-gray-500'
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString('ru-RU', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Поле ввода */}
            <div className="p-4 bg-white border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full">
                  <Paperclip className="h-5 w-5" />
                </button>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Напишите сообщение..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button className="absolute right-2 top-2 p-1 text-gray-500 hover:text-gray-700">
                    <Smile className="h-4 w-4" />
                  </button>
                </div>
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          /* Пустое состояние */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                💬
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Выберите чат
              </h3>
              <p className="text-gray-500">
                Выберите чат из списка слева, чтобы начать общение
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}