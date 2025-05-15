/**
 * Утилиты для работы с чатами
 */

// Типы сообщений
export interface Message {
  id: number;
  text: string;
  sender: 'me' | 'them';
  time: string;
  attachments?: Attachment[];
}

// Типы вложений
export interface Attachment {
  id: number;
  type: 'image' | 'file' | 'voice' | 'sticker';
  url: string;
  name?: string;
  size?: number;
  duration?: number; // для голосовых сообщений
}

// Информация о чате
export interface ChatInfo {
  id: string;
  name: string;
  avatar?: string;
  online: boolean;
  lastSeen?: string;
  typing?: boolean;
}

// Генерация уникального ID для чата
export function generateChatId(): string {
  return `chat-${Math.random().toString(36).substring(2, 9)}`;
}

// Форматирование времени сообщения
export function formatMessageTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Получение демо-сообщений для тестового чата
export function getDemoMessages(chatId: string): Message[] {
  // Используем chatId как seed для генерации разных сообщений для разных чатов
  const seed = parseInt(chatId.replace(/[^0-9]/g, '').substring(0, 3) || '123');
  
  const messages: Message[] = [
    {
      id: 1,
      text: "Привет! Как дела?",
      sender: "them",
      time: "14:22"
    },
    {
      id: 2,
      text: "Все хорошо, спасибо! А у тебя?",
      sender: "me",
      time: "14:23"
    }
  ];
  
  // Добавляем разные сообщения в зависимости от chatId
  if (seed % 3 === 0) {
    messages.push({
      id: 3,
      text: "Отлично! Планируешь что-нибудь на выходные?",
      sender: "them",
      time: "14:25"
    });
  } else if (seed % 3 === 1) {
    messages.push({
      id: 3,
      text: "Нормально. Видел последние новости?",
      sender: "them",
      time: "14:25"
    });
  } else {
    messages.push({
      id: 3,
      text: "Тоже неплохо. Что нового?",
      sender: "them",
      time: "14:25"
    });
  }
  
  messages.push({
    id: 4,
    text: "Давай встретимся завтра?",
    sender: "me",
    time: "14:26"
  });
  
  return messages;
}

// Получение информации о чате по ID
export function getChatInfo(chatId: string): ChatInfo {
  return {
    id: chatId,
    name: `Пользователь #${chatId}`,
    online: Math.random() > 0.5,
    lastSeen: Math.random() > 0.5 ? "сегодня в 15:30" : "вчера в 23:45"
  };
}
