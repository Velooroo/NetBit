import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Settings, Edit, Plus } from 'lucide-react';

interface UserProfile {
  id: number;
  name: string;
  username: string;
  email: string;
  phone: string;
  location: string;
  joinDate: string;
  avatar: string;
  status: string;
  bio: string;
  projects: number;
  repositories: number;
  followers: number;
}

interface Project {
  id: number;
  name: string;
  description: string;
  language: string;
  stars: number;
  lastUpdate: string;
}

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'activity'>('overview');
  
  // Тестовые данные профиля
  const [profile] = useState<UserProfile>({
    id: 1,
    name: 'Алексей Петров',
    username: 'alexdev',
    email: 'alex.petrov@netbit.dev',
    phone: '+7 (999) 123-45-67',
    location: 'Москва, Россия',
    joinDate: '2023-06-15',
    avatar: '👨‍💻',
    status: 'Senior Developer',
    bio: 'Fullstack разработчик с опытом в Rust, React и Node.js. Люблю создавать качественные продукты и делиться знаниями с командой.',
    projects: 12,
    repositories: 24,
    followers: 156
  });

  // Тестовые проекты
  const [projects] = useState<Project[]>([
    {
      id: 1,
      name: 'NetBit Backend',
      description: 'Rust backend для универсальной платформы разработчиков',
      language: 'Rust',
      stars: 89,
      lastUpdate: '2 часа назад'
    },
    {
      id: 2,
      name: 'React Chat UI',
      description: 'Компоненты чата для React приложений',
      language: 'TypeScript',
      stars: 45,
      lastUpdate: '1 день назад'
    },
    {
      id: 3,
      name: 'API Gateway',
      description: 'Микросервисный шлюз для обработки запросов',
      language: 'Node.js',
      stars: 23,
      lastUpdate: '3 дня назад'
    },
    {
      id: 4,
      name: 'Mobile Chat App',
      description: 'React Native приложение для мобильного чата',
      language: 'React Native',
      stars: 67,
      lastUpdate: '1 неделя назад'
    }
  ]);

  const activities = [
    { id: 1, action: 'Создал новый репозиторий', target: 'netbit-frontend', time: '2 часа назад' },
    { id: 2, action: 'Сделал коммит в', target: 'netbit-backend', time: '4 часа назад' },
    { id: 3, action: 'Открыл pull request в', target: 'react-components', time: '1 день назад' },
    { id: 4, action: 'Закрыл issue в', target: 'api-gateway', time: '2 дня назад' },
    { id: 5, action: 'Добавил звезду к', target: 'awesome-rust', time: '3 дня назад' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Заголовок */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-2xl">
                  {profile.avatar}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
                  <p className="text-gray-600">@{profile.username}</p>
                  <p className="text-sm text-blue-600">{profile.status}</p>
                </div>
              </div>
              <div className="flex space-x-3">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                  <Edit className="h-4 w-4" />
                  <span>Редактировать</span>
                </button>
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
                  <Settings className="h-4 w-4" />
                  <span>Настройки</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Основная информация */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Информация</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-700">{profile.email}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-700">{profile.phone}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-700">{profile.location}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-700">
                    Присоединился {new Date(profile.joinDate).toLocaleDateString('ru-RU')}
                  </span>
                </div>
              </div>
            </div>

            {/* Статистика */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Статистика</h3>
              <div className="grid grid-cols-1 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{profile.projects}</div>
                  <div className="text-sm text-gray-600">Проектов</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{profile.repositories}</div>
                  <div className="text-sm text-gray-600">Репозиториев</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{profile.followers}</div>
                  <div className="text-sm text-gray-600">Подписчиков</div>
                </div>
              </div>
            </div>
          </div>

          {/* Основной контент */}
          <div className="lg:col-span-2">
            {/* О себе */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">О себе</h3>
              <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
            </div>

            {/* Табы */}
            <div className="bg-white rounded-lg shadow">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`py-4 px-6 border-b-2 font-medium text-sm ${
                      activeTab === 'overview'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Обзор
                  </button>
                  <button
                    onClick={() => setActiveTab('projects')}
                    className={`py-4 px-6 border-b-2 font-medium text-sm ${
                      activeTab === 'projects'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Проекты
                  </button>
                  <button
                    onClick={() => setActiveTab('activity')}
                    className={`py-4 px-6 border-b-2 font-medium text-sm ${
                      activeTab === 'activity'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Активность
                  </button>
                </nav>
              </div>

              <div className="p-6">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 mb-4">Последние проекты</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {projects.slice(0, 4).map((project) => (
                          <div key={project.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                            <h5 className="font-medium text-gray-900">{project.name}</h5>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{project.description}</p>
                            <div className="flex items-center justify-between mt-3">
                              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                {project.language}
                              </span>
                              <div className="flex items-center space-x-2">
                                <span className="text-xs text-gray-500">⭐ {project.stars}</span>
                                <span className="text-xs text-gray-500">{project.lastUpdate}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'projects' && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h4 className="text-lg font-medium text-gray-900">Все проекты</h4>
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                        <Plus className="h-4 w-4" />
                        <span>Новый проект</span>
                      </button>
                    </div>
                    <div className="space-y-4">
                      {projects.map((project) => (
                        <div key={project.id} className="p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h5 className="text-lg font-medium text-gray-900">{project.name}</h5>
                              <p className="text-gray-600 mt-1">{project.description}</p>
                              <div className="flex items-center space-x-4 mt-3">
                                <span className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
                                  {project.language}
                                </span>
                                <span className="text-sm text-gray-500">⭐ {project.stars} звезд</span>
                                <span className="text-sm text-gray-500">Обновлен {project.lastUpdate}</span>
                              </div>
                            </div>
                            <button className="text-gray-400 hover:text-gray-600">
                              <Settings className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'activity' && (
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-6">Последняя активность</h4>
                    <div className="space-y-4">
                      {activities.map((activity) => (
                        <div key={activity.id} className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-gray-900">
                              <span className="font-medium">{profile.name}</span> {activity.action} <span className="font-medium text-blue-600">{activity.target}</span>
                            </p>
                            <p className="text-sm text-gray-500">{activity.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}