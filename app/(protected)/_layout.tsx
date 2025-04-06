import {
  View,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  Animated,
} from "react-native";
import { Tabs } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRef } from "react";

export default function ProtectedLayout() {
  return (
    <View style={styles.container}>
      <Tabs
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{ headerShown: false }}
      >
        <Tabs.Screen name="index" />
        <Tabs.Screen name="options" />
      </Tabs>
    </View>
  );
}

const iconNameForRoute = (routeName) => {
  switch (routeName) {
    case "index":
      return "message-processing";
    case "options":
      return "account-cog";
    default:
      return "";
  }
};

const CustomTabBar = ({ state, navigation }) => {
  const { width } = useWindowDimensions();
  const animations = useRef(
    state.routes.map(() => new Animated.Value(1)),
  ).current;

  const handlePress = (index, route) => {
    Animated.sequence([
      Animated.spring(animations[index], {
        toValue: 0.9,
        useNativeDriver: true,
      }),
      Animated.spring(animations[index], {
        toValue: 1,
        useNativeDriver: true,
      }),
    ]).start();
    navigation.navigate(route);
  };

  return (
    <View style={[styles.tabBarContainer, { width }]}>
      <View style={styles.tabBarBackground} />

      <View style={styles.tabBarContent}>
        {state.routes.map((route, index) => {
          const isActive = state.index === index;
          return (
            <TouchableOpacity
              key={route.key}
              onPress={() => handlePress(index, route.name)}
              style={styles.tabButton}
              activeOpacity={0.7}
            >
              <Animated.View
                style={{ transform: [{ scale: animations[index] }] }}
              >
                <MaterialCommunityIcons
                  name={iconNameForRoute(route.name)}
                  size={isActive ? 30 : 26}
                  color={isActive ? "#FFFFFF" : "#9E6E4C"}
                />
              </Animated.View>
              {isActive && (
                <View style={styles.activeLine}>
                  <View style={styles.activeLineInner} />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F9F9",
  },
  tabBarContainer: {
    position: "absolute",
    bottom: 0,
    height: 80,
    flexDirection: "row",
    borderTopWidth: 0,
    elevation: 0,
  },
  tabBarBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#FFB17A",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  tabBarContent: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingBottom: 8,
  },
  tabButton: {
    alignItems: "center",
    padding: 12,
    borderRadius: 16,
    position: "relative",
  },
  activeLine: {
    position: "absolute",
    bottom: 4,
    height: 3,
    width: "60%",
    backgroundColor: "#FF6B6B20",
    borderRadius: 2,
  },
  activeLineInner: {
    height: "100%",
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 2,
  },
});

