import React, { useState, useRef, useCallback } from "react";
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  Animated,
  Button,
} from "react-native";
import { useRouter, Link } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import moment from "moment";

import { useDimensions } from "@/hooks/useDimensions";
import { styles } from "@/app/(protected)/styles/index";

import { BUTTONS_OPTIONS, BUTTONS_ORDER } from "@/constants/contacts/button";
import { TABS_OPTIONS, TABS_ORDER } from "@/constants/contacts/tabs";

import {
  getValidatedContacts,
  getPinnedValidatedContacts,
  logContactPress,
  Contact,
} from "@/utils/contacts";
import { getHistories } from "@/utils/people";
import { createTabAnimations } from "@/animations/tab";

// Типы для пропсов компонента ContactItem
interface ContactItemProps {
  contact: Contact;
  isPinned?: boolean;
  isLast: boolean;
  onPress: (contact: Contact) => void;
}

/**
 * Компонент элемента контакта
 * Обрабатывает отображение отдельного контакта с разделительной линией
 */
const ContactItem = React.memo(
  ({ contact, isPinned = false, isLast, onPress }: ContactItemProps) => {
    const { wp } = useDimensions();

    /**
     * Рендерит разделительную линию с учетом типа контакта
     */
    const renderSeparator = () => (
      <View style={{ flexDirection: "row" }}>
        {!isLast && !isPinned ? (
          <>
            <View style={[styles.lineBackground, { width: wp(22.5) }]} />
            <View style={[styles.lineItem, { width: wp(55) }]} />
            <View style={[styles.lineBackground, { width: wp(22.5) }]} />
          </>
        ) : (
          <View style={[styles.lineItem, { width: wp(100) }]} />
        )}
      </View>
    );

    return (
      <TouchableOpacity onPress={() => onPress(contact)} activeOpacity={0.8}>
        <View style={isPinned ? styles.contactPinItem : styles.contactItem}>
          {/* Аватар с индикатором статуса */}
          <View style={styles.avatar}>
            <View
              style={[contact.online && [styles.statusIndicator, styles.online]]}
            />
          </View>

          {/* Основная информация о контакте */}
          <View style={styles.contactInfo}>
            <Text style={styles.contactName}>{contact.name}</Text>
            <Text style={styles.contactStatus}>{contact.status}</Text>
          </View>

          {/* Правая секция с дополнительной информацией */}
          <View style={styles.rightContainer}>
            {!contact.notification && (
              <Ionicons
                name="notifications-off"
                size={16}
                color="#666"
                style={styles.muteIcon}
              />
            )}
            <Text style={styles.timeText}>
                {moment(contact.lastMessageData).isSame(moment(), "day")
                ? moment(contact.lastMessageData).format("HH:MM")
                  : moment(contact.lastMessageData).isSame(moment(), "year")
                  ? moment(contact.lastMessageData).format("DD.MM")
                    : moment(contact.lastMessageData).format("DD.MM.YY")
                }
            </Text>
          </View>
        </View>

        {renderSeparator()}
      </TouchableOpacity>
    );
  },
);

/**
 * Экран контактов с табами и списками контактов
 */
const ContactsScreen = () => {
  const router = useRouter();
  const { wp, hp } = useDimensions();
  const { top, left, bottom, right } = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<string>(BUTTONS_OPTIONS.CHATS);
  const { indicatorPosition, animateTab } = useRef(
    createTabAnimations(),
  ).current;

  // Получение данных контактов
  const contacts = getValidatedContacts();
  const pinnedContacts = getPinnedValidatedContacts();
  const histories = getHistories();

  // Мемоизированные обработчики событий
  const handleContactPress = useCallback((contact: Contact) => {
    logContactPress(contact);
  }, []);

  const handleTabPress = useCallback(
    (tab: string, index: number) => {
      setActiveTab(tab);
      animateTab(index, 100);
      console.log(`Tab switched to: ${tab}`);
    },
    [animateTab],
  );

  const handleButtonPress = useCallback((tab: string) => {
    console.log(`Button used: ${tab}`);
  }, []);

  // Интерполяция позиции индикатора табов
  const indicatorLeft = indicatorPosition.interpolate({
    inputRange: [0, 1, 2],
    outputRange: ["0%", "33.33%", "66.66%"],
  });

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#FFE3CF",
        paddingTop: top,
        paddingLeft: left,
        paddingBottom: bottom,
        paddingRight: right,
      }}
    >
      <TouchableOpacity
        style={{
          backgroundColor: "#FFB17A",
          padding: 12,
          borderRadius: 10,
          alignSelf: "center",
          marginTop: 10,
          marginBottom: 10,
          elevation: 3,
        }}
        onPress={() => router.push({
          pathname: '/chat',
          params: { id: 'test-chat-123' }
        })}
      >
        <Text style={{ color: "#FFF", fontWeight: "bold", fontSize: 16 }}>
          Открыть тестовый чат
        </Text>
      </TouchableOpacity>
      
      <View style={[styles.chatContainer, { width: wp(100) }]}>
        {/* Шапка с кнопками и табами */}
        <View style={styles.headerContainer}>
          {/* Верхняя панель кнопок */}
          <View style={[styles.buttonGrid, { marginBottom: wp(4) }]}>
            {BUTTONS_ORDER.map((tab: keyof typeof BUTTONS_OPTIONS) => (
              <TouchableOpacity
                key={tab}
                style={{ flex: 1 }}
                onPress={() => handleButtonPress(tab)}
                activeOpacity={0.7}
              >
                <View style={styles.buttonView}>
                  <Text style={styles.buttonTitle}>{BUTTONS_OPTIONS[tab]}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Шапка с историями */}
          <View
            style={{
              width: wp(90),
              height: 150,
              flexDirection: "row",
              marginHorizontal: wp(7),
            }}
          >
            {histories.map((history) => (
              <View style={{ flex: 1 }}>
                <Link
                  href={{
                    pathname: '/chat',
                    params: { id: 'bacon' }
                  }} style={{ flex: 1 }}
                >
                  <TouchableOpacity
                    key={history.id}
                    style={{
                      width: wp(100),
                      height: hp(100),
                    }}
                    onPress={() => handleButtonPress(String(history.id))}
                  >
                    <View style={styles.history}></View>
                  </TouchableOpacity>
                </Link> 
              </View>
            ))}
          </View>

          {/* Панель табов с анимированным индикатором */}
          <View style={[styles.tabGrid]}>
            <Animated.View
              style={[
                styles.tabIndicator,
                { left: indicatorLeft, width: "33.33%" },
              ]}
            />

            {TABS_ORDER.map((tab: keyof typeof TABS_OPTIONS, index: number) => (
              <TouchableOpacity
                key={tab}
                style={{ flex: 1 }}
                onPress={() => handleTabPress(tab, index)}
                activeOpacity={0.1}
              >
                <View style={styles.buttonView}>
                  <Text style={styles.buttonTitle}>{TABS_OPTIONS[tab]}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Разделительная линия под шапкой */}
        <View style={[styles.lineItem, { width: wp(100) }]} />

        {/* Основной список контактов */}
        <ScrollView style={styles.contactContainer}>
          {/* Закрепленные контакты */}
          {pinnedContacts.map((contact, index) => (
            <ContactItem
              key={contact.id}
              contact={contact}
              isPinned
              isLast={index === pinnedContacts.length - 1}
              onPress={handleContactPress}
            />
          ))}

          {/* Обычные контакты */}
          {contacts.map((contact, index) => (
            <ContactItem
              key={contact.id}
              contact={contact}
              isLast={index === contacts.length - 1}
              onPress={handleContactPress}
            />
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

export default React.memo(ContactsScreen);
