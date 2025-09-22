import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import { Message, ChatInfo, getDemoMessages, getChatInfo, formatMessageTime, generateChatId } from "./chat-utils";

function TestChat() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const chatId = params.id || generateChatId();
  const [message, setMessage] = useState("");
  const [showMediaBar, setShowMediaBar] = useState(false);
  const [chatInfo, setChatInfo] = useState<ChatInfo | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Animation for the media bar
  const mediaBarHeight = useRef(new Animated.Value(0)).current;
  
  // Load chat data
  useEffect(() => {
    // Get chat info and messages
    const info = getChatInfo(chatId as string);
    const demoMessages = getDemoMessages(chatId as string);
    
    setChatInfo(info);
    setMessages(demoMessages);
  }, [chatId]);
  
  // Toggle media bar
  const toggleMediaBar = () => {
    const toValue = showMediaBar ? 0 : 60;
    Animated.spring(mediaBarHeight, {
      toValue,
      friction: 7,
      tension: 40,
      useNativeDriver: false,
    }).start();
    setShowMediaBar(!showMediaBar);
  };

  // Send a new message
  const sendMessage = () => {
    if (message.trim()) {
      const newMessage: Message = {
        id: messages.length + 1,
        text: message,
        sender: "me",
        time: formatMessageTime(new Date())
      };
      setMessages([...messages, newMessage]);
      setMessage("");
      
      // Scroll to bottom after sending message
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        
        <View style={styles.contactInfo}>
          <View style={styles.avatar}>
            {chatInfo?.online && <View style={styles.onlineIndicator} />}
          </View>
          <View>
            <Text style={styles.contactName}>{chatInfo?.name || 'Загрузка...'}</Text>
            <Text style={styles.contactStatus}>
              {chatInfo?.online ? 'В сети' : chatInfo?.lastSeen || 'Не в сети'}
            </Text>
          </View>
        </View>
        
        <TouchableOpacity style={styles.callButton}>
          <Ionicons name="call" size={22} color="#333" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.videoCallButton}>
          <Ionicons name="videocam" size={22} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Chat Messages */}
      <ScrollView 
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: false })}
      >
        {messages.map((msg) => (
          <View 
            key={msg.id} 
            style={[
              styles.messageBubble, 
              msg.sender === "me" ? styles.myMessage : styles.theirMessage
            ]}
          >
            <Text style={styles.messageText}>{msg.text}</Text>
            <Text style={styles.messageTime}>{msg.time}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Input Area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        style={styles.inputContainer}
      >
        {/* Media Bar (Files, Stickers, Voice) */}
        <Animated.View style={[styles.mediaBar, { height: mediaBarHeight }]}>
          <TouchableOpacity style={styles.mediaButton}>
            <Ionicons name="document" size={24} color="#333" />
            <Text style={styles.mediaButtonText}>Файлы</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.mediaButton}>
            <FontAwesome5 name="smile" size={24} color="#333" />
            <Text style={styles.mediaButtonText}>Стикеры</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.mediaButton}>
            <FontAwesome5 name="microphone" size={24} color="#333" />
            <Text style={styles.mediaButtonText}>Голос</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Message Input */}
        <View style={styles.inputRow}>
          <TouchableOpacity 
            style={styles.attachButton}
            onPress={toggleMediaBar}
          >
            <Ionicons 
              name={showMediaBar ? "close" : "add"} 
              size={24} 
              color="#333" 
            />
          </TouchableOpacity>
          
          <TextInput
            style={styles.input}
            placeholder="Сообщение..."
            value={message}
            onChangeText={setMessage}
            multiline
          />
          
          <TouchableOpacity 
            style={styles.sendButton}
            onPress={sendMessage}
          >
            <Ionicons name="send" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F9F9",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFE3CF",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  backButton: {
    padding: 8,
  },
  contactInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E1E1E1",
    marginRight: 12,
    position: "relative",
  },
  onlineIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#4CAF50",
    position: "absolute",
    bottom: 0,
    right: 0,
    borderWidth: 2,
    borderColor: "#FFE3CF",
  },
  contactName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  contactStatus: {
    fontSize: 12,
    color: "#666",
  },
  callButton: {
    padding: 8,
    marginLeft: 8,
  },
  videoCallButton: {
    padding: 8,
    marginLeft: 4,
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: "#F9F9F9",
  },
  messagesContent: {
    padding: 16,
  },
  messageBubble: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  myMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#FFB17A",
    borderBottomRightRadius: 4,
  },
  theirMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#E1E1E1",
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    color: "#333",
  },
  messageTime: {
    fontSize: 10,
    color: "#666",
    alignSelf: "flex-end",
    marginTop: 4,
  },
  inputContainer: {
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    backgroundColor: "#FFE3CF",
  },
  mediaBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#FFE3CF",
    overflow: "hidden",
  },
  mediaButton: {
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
  },
  mediaButtonText: {
    fontSize: 12,
    marginTop: 4,
    color: "#333",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
  },
  attachButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#E0E0E0",
    marginRight: 8,
  },
  input: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
  },
  sendButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#FFB17A",
    marginLeft: 8,
  },
});

export default React.memo(TestChat);
