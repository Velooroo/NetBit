import React, { useState, useRef } from "react";
import {
  View,
  ScrollView,
  SafeAreaView,
  Text,
  TouchableOpacity,
  Animated,
} from "react-native";

import { useDimensions } from "@/hooks/useDimensions";
import { styles } from "@/app/(protected)/styles/index";

import { BUTTONS_OPTIONS, BUTTONS_ORDER } from "@/constants/contacts/button";
import { TABS_OPTIONS, TABS_ORDER } from "@/constants/contacts/tabs";

import {
  // Functions
  getValidatedContacts,
  logContactPress,
  // Types
  Contact,
} from "@/utils/contacts";
import { createTabAnimations } from "@/animations/tab";

/**
 * Contacts Screen Component
 *
 * Displays a list of contacts with interactive tabs and animations.
 *
 * @component
 * @example
 * return <ContactsScreen />
 */
const ContactsScreen = () => {
  const { wp, hp } = useDimensions();
  const [activeTab, setActiveTab] = useState<string>(BUTTONS_OPTIONS.CHATS);
  const { indicatorPosition, animateTab } = useRef(
    createTabAnimations()
  ).current;
  const contacts = getValidatedContacts();

  /**
   * Handles tab press event
   * @param {string} tab - The tab that was pressed
   * @param {number} index - The index of the tab
   */
  const handleButtonPress = (tab: string) => {
    console.log(`Button used: ${tab}`);
  };

  /**
   * Handles tab press event
   * @param {string} tab - The tab that was pressed
   * @param {number} index - The index of the tab
   */
  const handleTabPress = (tab: string, index: number) => {
    setActiveTab(tab);
    animateTab(index, 100);
    console.log(`Tab switched to: ${tab}`);
  };

  /**
   * Handles contact press event
   * @param {Contact} contact - The contact that was pressed
   */
  const handleContactPress = (contact: Contact) => {
    logContactPress(contact);
  };

  // Calculate indicator position based on active tab
  const indicatorLeft = indicatorPosition.interpolate({
    inputRange: [0, 1, 2],
    outputRange: ["0%", "33.33%", "66.66%"],
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingVertical: hp(0) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.chatContainer,
            {
              height: hp(100),
              width: wp(100),
            },
          ]}
        >
          <View style={styles.headerContainer}>
            {/* Button Bar */}
            <View
              style={[
                {
                  paddingVertical: hp(2),
                },
              ]}
            >
              {/* Header Buttons */}
              <View style={[styles.buttonGrid, { paddingVertical: hp(2) }]}>
                {BUTTONS_ORDER.map((tab: keyof typeof BUTTONS_OPTIONS) => (
                  <TouchableOpacity
                    key={tab}
                    style={{ flex: 1 }}
                    onPress={() => handleButtonPress(tab)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.buttonView]}>
                      <Text style={[styles.buttonTitle]}>
                        {BUTTONS_OPTIONS[tab]}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Tabs Bar */}
            <View
              style={[
                styles.buttonGrid,
                {
                  width: "auto",
                  marginHorizontal: wp(5),
                  paddingVertical: hp(2),
                },
              ]}
            >
              {/* Animated Indicator */}
              <Animated.View
                style={[
                  styles.tabIndicator,
                  {
                    left: indicatorLeft,
                    width: "33.33%",
                  },
                ]}
              />

              {/* Tabs */}
              {TABS_ORDER.map(
                (tab: keyof typeof TABS_OPTIONS, index: number) => (
                  <TouchableOpacity
                    key={tab}
                    style={{ flex: 1 }}
                    onPress={() => handleTabPress(tab, index)}
                    activeOpacity={0.1}
                  >
                    <View style={[styles.buttonView]}>
                      <Text style={[styles.buttonTitle]}>
                        {TABS_OPTIONS[tab]}
                      </Text>
                    </View>
                  </TouchableOpacity>
                )
              )}
            </View>
          </View>
          <View style={[styles.lineItemPin]}></View>

          {/* Contacts List */}
          <View style={styles.contactContainer}>
            {contacts.map((contact, index) => (
              <TouchableOpacity
                key={String(contact.id)}
                onPress={() => handleContactPress(contact)}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.contactItem,
                    styles.lineItem,
                    index === contacts.length - 1 && styles.lastItem,
                  ]}
                >
                  <View style={styles.avatar}>
                    <View
                      style={[
                        styles.statusIndicator,
                        contact.online && styles.online,
                      ]}
                    />
                  </View>
                  <View style={styles.contactInfo}>
                    <Text style={styles.contactName}>{contact.name}</Text>
                    <Text style={styles.contactStatus}>{contact.status}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ContactsScreen;
