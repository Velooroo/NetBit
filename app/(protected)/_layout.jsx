/** ******************************************************************************
 * @file    (protected)/_layout.js
 * @author  Kazilsky
 * @brief   Main layout component with authentication and routing
 *          Главный компонент макета с аутентификацией и маршрутизацией
 *
 *          This file contains:
 *           - Import statements / Импорт необходимых модулей
 *           - Constant definitions / Определения констант
 *           - Private function declarations / Приватные функции
 *           - Component definitions / Определения компонентов
 *           - Main component implementation / Реализация основного компонента
 *           - Style definitions / Определения стилей
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

/**
 * @note
 * This component is responsible for managing the protected layout of the application.
 * It ensures that only authenticated users can access the content and provides
 * navigation between the main pages.
 * 
 * Этот компонент отвечает за управление защищенным макетом приложения.
 * Он гарантирует, что только авторизованные пользователи могут получить доступ к контенту,
 * и предоставляет навигацию между основными страницами.
 */

/* Includes ------------------------------------------------------------------*/
// Import necessary modules / Импорт необходимых модулей
import { useAuth } from '@/context/AuthProvider';                                                /*!< Authentication context */
import { Redirect, Tabs, usePathname } from 'expo-router';                                       /*!< Routing modules */
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform } from 'react-native'; /*!< React Native components */

/* Constants -----------------------------------------------------------------*/
/**
 * @defgroup RouteConstants Route constants definition
 * @{
 */
/**
 * @brief Route constants definition
 *        Определение констант маршрутов
 * @{
 */
const ROUTE_CONSTANTS = {                     /*!< Constants for defining the router name / Константа для определения названия роутера */
  DEFAULT_ROUTE_NAME: "Unknown Page",         /*!< Default Route name / Имя маршрута по умолчанию */
  HOME_ROUTE: "/",                            /*!< Home Route / Главная страница */
  OPTIONS_ROUTE: "OPTIONS"                    /*!< Options Route / Страница настроек */
};
/**
 * @brief Route constants for tab
 *        Определение констант табов
 * @{
 */
const ROUTE_NAMES = {                         /*!< Route Name for tab / Имя роутера для табов */
  [ROUTE_CONSTANTS.HOME_ROUTE]: "Messages",   /*!< Messages page / Страница сообщений */
  [ROUTE_CONSTANTS.OPTIONS_ROUTE]: "Settings" /*!< Settings page / Страница настроек */
};
/**
 * @}
 * @endbrief // End of route constants definition / Конец определения констант маршрутов
 */

/* Private Functions ---------------------------------------------------------*/
/**
 * @defgroup RouteFunction
 * @{
 */
/**
 * @brief  Gets the current route name
 *         Получает имя текущего маршрута
 * 
 * @param  None
 * @return Route name as string / Имя маршрута в виде строки (Message)
 *
 */
function useRouteName() {
  const pathname = usePathname(); // Current path / Текущий путь

  // WARNING: Возможна ошибка при разборе пути, если формат URL изменится
  const routeSegment = pathname.split('/')[1] || ROUTE_CONSTANTS.HOME_ROUTE; // Extract route segment / Извлечение сегмента маршрута

  // NOTE: Используется значение по умолчанию, если маршрут не найден
  return ROUTE_NAMES[routeSegment.toUpperCase()] || ROUTE_CONSTANTS.DEFAULT_ROUTE_NAME; 
}
/**
 * @}
 * @endbrief // End of router functions / Конец функций для роутинга 
 */
/**
 * @}
 * @endgroup // End of private functions / Конец приватных функций
 */

/* Components ----------------------------------------------------------------*/
/**
 * @brief  Header component definition
 *         Определение компонента заголовка
 * 
 * @param  routeName: Current route name / Имя текущего маршрута
 *         user: Logged in user name / Имя авторизованного пользователя
 *         onLogout: Logout handler function / Функция обработки выхода
 */
function Header({ routeName, user, onLogout }) {
  return (
    <View style={styles.header}>
      {/* Application logo / Логотип приложения */}
      <Text style={styles.logo}>{routeName}</Text>
      
      {/* User information container / Контейнер информации о пользователе */}
      <View style={styles.userContainer}>
        <Text style={styles.username}>{user}</Text>
        
        {/* Logout button / Кнопка выхода */}
        {/* HACK: Временное решение для обработки выхода. Нужно пересмотреть логику */}
        <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
          <Text style={styles.logoutText}>Logout</Text> {/* Выйти */}
        </TouchableOpacity>
      </View>
    </View>
  );
}
/**
 * @}
 * @endbrief // End of components / Конец определения компонентов
 */

/* Main Component ------------------------------------------------------------*/
/**
 * @brief  Protected Layout main component
 *         Главный компонент защищенного макета
 * 
 * @details This component handles:
 *          - Authentication check / Проверку аутентификации
 *          - Header display / Отображение заголовка
 *          - Navigation management / Управление навигацией
 */
export default function ProtectedLayout() {
  /* Private variables ------------------------------------------------------*/
  const { isAuthenticated, user, logout } = useAuth(); // Authentication data / Данные аутентификации

  // DEPRECATED: Старый метод проверки аутентификации. Будет удален в будущем
  if (!isAuthenticated) {
    // OPTIMIZE: Улучшить производительность перенаправления
    return <Redirect href="/(auth)" />; // Redirect to auth page / Перенаправление на страницу авторизации
  }

  /* Condition checks -------------------------------------------------------*/
  // ERROR: Если пользователь не авторизован, должно быть явное перенаправление
  if (!user) {
    console.error("User data is missing!"); // Log error / Логирование ошибки
    return null;
  }

  /* Main render ------------------------------------------------------------*/
  return (
    <View style={styles.container}>
      {/* Header section / Секция заголовка */}
      <SafeAreaView>
        <Header 
          routeName={useRouteName()} 
          user={user} 
          onLogout={logout} 
        />
      </SafeAreaView>

      {/* Tab navigation section / Секция табов навигации ---------------------*/}
      <Tabs screenOptions={{ headerShown: false }}>
        {/* Home tab / Главная страница ------------------------------------*/}
        {/* TODO: Добавить анимацию при переходе на главную страницу */}
        <Tabs.Screen 
          name="index" 
          options={{ title: ROUTE_NAMES[ROUTE_CONSTANTS.HOME_ROUTE] }} 
        />

        {/* Options tab / Страница настроек --------------------------------*/}
        {/* FIXME: Исправить отображение заголовка на странице настроек */}
        <Tabs.Screen 
          name="options" 
          options={{ title: ROUTE_NAMES[ROUTE_CONSTANTS.OPTIONS_ROUTE] }} 
        />
      </Tabs>
    </View>
  );
}

/**
 * @}
 * @endbrief // End of main component / Конец основного компонента
 */

/* Styles --------------------------------------------------------------------*/
/**
 * @brief Component styles definition
 *       Определение стилей компонента
 */
const styles = StyleSheet.create({
  /**
   * @defgroup ContainerStyles Styles for containers
   * @{
   */
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  
  /**
   * @defgroup HeaderStyles Styles for header
   * @{
   */
  header: {
    backgroundColor: '#fff',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4
      },
      android: {
        elevation: 3
      }
    })
  },
  
  /**
   * @defgroup LogoStyles Styles for logo
   * @{
   */
  logo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333'
  },
  
  /**
   * @defgroup UserContainerStyles Styles for user container
   * @{
   */
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  
  /**
   * @defgroup UsernameStyles Styles for username
   * @{
   */
  username: {
    fontSize: 16,
    color: '#666'
  },
  
  /**
   * @defgroup LogoutButtonStyles Styles for logout button
   * @{
   */
  logoutButton: {
    backgroundColor: '#ff4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6
  },
  
  /**
   * @defgroup LogoutTextStyles Styles for logout text
   * @{
   */
  logoutText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500'
  },
  
  /** @} */
  /** @} */
  /** @} */
  /** @} */
});

/**
 * @}
 * @endgroup // End of style definitions / Конец определений стилей
 */