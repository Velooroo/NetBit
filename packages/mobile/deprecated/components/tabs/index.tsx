import { Path, Svg } from "react-native-svg";
import { BlurView } from "expo-blur";
import { Tabs } from "expo-router";
import { Pressable, View, StyleSheet, useWindowDimensions } from "react-native";

const CustomTabBar = ({ state, navigation }) => {
  const { width } = useWindowDimensions();
  const tabWidth = width / state.routes.length;

  return (
    <View style={[styles.tabBarContainer, { width }]}>
      {/* SVG маска для вырезания фигуры */}
      <Svg
        width={width}
        height={70}
        style={styles.svg}
        viewBox={`0 0 ${width} 70`}
      >
        <Path
          fill="white"
          d={`
            M 0,0
            H ${width}
            V 70
            H ${width - 50}
            Q ${width - 25} 45 ${width - 50} 20
            H 50
            Q 25 45 0 70
            Z
          `}
        />
      </Svg>

      {/* Контент таббара с размытием */}
      <BlurView intensity={30} style={styles.blurContainer}>
        {state.routes.map((route, index) => {
          const isActive = state.index === index;

          return (
            <Pressable
              key={route.key}
              onPress={() => navigation.navigate(route.name)}
              style={[styles.tabButton, { width: tabWidth }]}
            >
              {/* Ваши иконки и текст */}
              <Text style={[styles.tabText, isActive && styles.activeText]}>
                {route.name}
              </Text>
            </Pressable>
          );
        })}
      </BlurView>
    </View>
  );
};

// Использование в Layout
export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="settings" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
  },
  svg: {
    position: "absolute",
    bottom: 0,
  },
  blurContainer: {
    flex: 1,
    flexDirection: "row",
    overflow: "hidden",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  tabButton: {
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
  },
  tabText: {
    fontSize: 12,
    color: "gray",
  },
  activeText: {
    color: "white",
    fontWeight: "bold",
  },
});
