/** ******************************************************************************
 * @file    context/AuthProvider.js
 * @author  Kazilsky
 * @brief   Authentication context provider for managing user authentication state
 *          Поставщик контекста аутентификации для управления состоянием пользователя
 *
 *          This file contains:
 *           - Import statements / Импорт необходимых модулей
 *           - Constant definitions / Определения констант
 *           - Private function declarations / Приватные функции
 *           - Component definitions / Определения компонентов
 *******************************************************************************
 * @attention
 *
 * Copyright (c) 2023 Sparked.
 * All rights reserved.
 *
 * This software is licensed under terms that can be found in the LICENSE file
 * in the root directory of this software component.
 * If no LICENSE file comes with this software, it is provided AS-IS.
 *
 *******************************************************************************/

/* Includes ------------------------------------------------------------------*/
// Import necessary modules / Импорт необходимых модулей
import React, { createContext, useContext, useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { useStorageState } from '../hooks/useStorageState';
import { testStorageUser } from '@/constants/userInfo';

/* Constants -----------------------------------------------------------------*/
/**
 * @defgroup AuthConstants Authentication constants definition
 * @{
 */
const AUTH_CONSTANTS = {
  DEFAULT_ERROR_MESSAGE: "Authentication error",                /*!< Default error message / Сообщение об ошибке по умолчанию */
  LOGIN_ERROR_INVALID_CREDENTIALS: "Invalid credentials",       /*!< Invalid credentials error / Ошибка неверных учетных данных */
  LOGIN_ERROR_MISSING_FIELDS: "Please enter email and password" /*!< Missing fields error / Ошибка отсутствия полей */
};
/**
 * @}
 * @endbrief // End of authentication constants definition / Конец определения констант аутентификации
 */

/* Private Functions ---------------------------------------------------------*/
/**
 * @defgroup AuthFunctions Authentication helper functions
 * @{
 */
/**
 * @brief  Validates user credentials
 *         Проверяет учетные данные пользователя
 * 
 * @param  username: User's username / Имя пользователя
 * @param  password: User's password / Пароль пользователя
 * @return Promise resolving on success or rejecting with an error message
 */
function validateCredentials(username, password) {
  if (!username || !password) {
    return Promise.reject(new Error(AUTH_CONSTANTS.LOGIN_ERROR_MISSING_FIELDS));
  }

  if (username !== testStorageUser.username || password !== testStorageUser.password) {
    return Promise.reject(new Error(AUTH_CONSTANTS.LOGIN_ERROR_INVALID_CREDENTIALS));
  }

  return Promise.resolve();
}
/**
 * @}
 * @endbrief // End of authentication helper functions / Конец вспомогательных функций аутентификации
 */

/* Context Definitions -------------------------------------------------------*/
/**
 * @brief  Authentication context definition
 *         Определение контекста аутентификации
 */
const AuthContext = createContext();

/**
 * @brief  Custom hook to access authentication context
 *         Пользовательский хук для доступа к контексту аутентификации
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

/* Main Component ------------------------------------------------------------*/
/**
 * @brief  Authentication provider main component
 *         Главный компонент провайдера аутентификации
 * 
 * @details This component handles:
 *          - User authentication state management / Управление состоянием аутентификации пользователя
 *          - Login and logout functionality / Функциональность входа и выхода
 *          - Route protection based on authentication status / Защита маршрутов на основе статуса аутентификации
 */
export const AuthProvider = ({ children, initialUser }) => {
  /* Private variables ------------------------------------------------------*/
  const [storedUser, setStoredUser] = useStorageState('user', initialUser); /*!< User storage state / Состояние хранилища пользователя */
  const segments = useSegments();                                           /*!< Current route segments / Текущие сегменты маршрута */
  const router = useRouter();                                               /*!< Router instance / Экземпляр маршрутизатора */

  /* Effects ----------------------------------------------------------------*/
  /**
   * @brief  Effect to handle route redirection based on authentication status
   *         Эффект для обработки перенаправления маршрутов на основе статуса аутентификации
   */
  useEffect(() => {
    const inAuthGroup = segments[0] === '(protected)'; // Check if in protected route group / Проверка, находится ли в защищенной группе маршрутов

    if (!storedUser && inAuthGroup) {
      router.replace('/');                      // Redirect to login page / Перенаправление на страницу входа
    } else if (storedUser && !inAuthGroup) {
      router.replace('/(protected)');           // Redirect to protected area / Перенаправление в защищенную зону
    }
  }, [storedUser, segments]);

  /* Handlers ---------------------------------------------------------------*/
  /**
   * @brief  Handles user login
   *         Обрабатывает вход пользователя
   * 
   * @param  username: User's username / Имя пользователя
   * @param  password: User's password / Пароль пользователя
   * @retval Promise resolving on successful login or rejecting with an error
   */
  const login = async (username, password) => {
    try {
      await validateCredentials(username, password); /*!< Validate credentials / Проверка учетных данных */
      await setStoredUser(username);                 /*!< Update stored user / Обновление хранимого пользователя */
    } catch (error) {
      return Promise.reject(error);                  /*!< Reject with error / Отклонение с ошибкой */
    }
  };

  /**
   * @brief  Handles user logout
   *         Обрабатывает выход пользователя
   */
  const logout = async () => {
    await setStoredUser(null); // Clear stored user / Очистка хранимого пользователя
    router.replace('/(auth)'); // Redirect to login page / Перенаправление на страницу входа
  };

  /* Context value ----------------------------------------------------------*/
  const value = {
    user: storedUser,
    login,
    logout,
    isAuthenticated: !!storedUser
  };

  /* Main render ------------------------------------------------------------*/
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * @}
 * @endbrief // End of main component / Конец основного компонента
 */