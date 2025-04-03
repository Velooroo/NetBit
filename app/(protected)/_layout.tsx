import { View, StyleSheet, Pressable, useWindowDimensions } from "react-native";
import { Tabs } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function ProtectedLayout() {
  const { width } = useWindowDimensions();

  const CustomTabBar = ({ state, navigation }) => {
    return (
      <View style={styles.tabBarContainer}>
        {/* Основной контент с закруглением */}
        <View style={styles.tabBarBackground} />
        <View style={styles.tabBarContent}>
          {state.routes.map((route, index) => {
            const isActive = state.index === index;
            const iconName =
              route.name === "index" ? "message-text" : "account";

            return (
              <Pressable
                key={route.key}
                onPress={() => navigation.navigate(route.name)}
                style={[styles.tabButton, isActive && styles.activeButton]}
              >
                <MaterialCommunityIcons
                  name={iconName}
                  size={30}
                  color={isActive ? "#ed622b" : "#666"}
                />
                {isActive && <View style={styles.activeDot} />}
              </Pressable>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Tabs
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{ headerShown: false }}
      >
        <Tabs.Screen options={{ tabBarStyle: { zIndex: 2 } }} name="index" />
        <Tabs.Screen name="options" />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  tabBarContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 81,
    zIndex: 1,
  },
  tabBarBackground: {
    position: "absolute",
    bottom: 0,
    height: 60,
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    elevation: 5,
  },
  tabBarContent: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    flex: 1,
    marginBottom: 20,
    borderRadius: 24,
    backgroundColor: "#f5f5f5",
    elevation: 5,
  },
  tabButton: {
    alignItems: "center",
    padding: 12,
    position: "relative",
    borderRadius: 20, // Закругление кнопок
  },
  activeButton: {
    backgroundColor: "#f5f5f5", // Добавление фона для активной кнопки
    elevation: 10, // Эффект поднятия активной кнопки
  },
  activeDot: {
    position: "absolute",
    bottom: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#ed622b",
  },
});
