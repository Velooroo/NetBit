import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingBottom: 80,
    alignItems: "center",
  },
  scrollContent: {
    paddingBottom: 24,
    flexGrow: 1, // Для правильной работы ScrollView
    justifyContent: "center", // Вертикальное центрирование
  },
  chatContainer: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 24,
    marginBottom: -24,
    paddingTop: -24,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    alignSelf: "center",
  },
  contactContainer: {
    flex: 1,
  },
  buttonGrid: {
    flexWrap: "wrap",
    flexDirection: "row",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
  },
  buttonView: {
    borderRadius: 10,
    paddingVertical: 5,
    opacity: 0.5,
  },
  buttonTitle: {
    fontSize: 20,
    fontWeight: "200",
    textAlign: "center",
    opacity: 1,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 48,
    backgroundColor: "#e1e1e1",
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  statusIndicator: {
    width: 24,
    height: 24,
    borderRadius: 16,
    backgroundColor: "#ccc",
    position: "absolute",
    bottom: -2,
    right: -2,
    borderWidth: 2,
    borderColor: "white",
  },
  online: {
    backgroundColor: "#4CAF50",
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  contactStatus: {
    fontSize: 14,
    color: "#666",
  },
  // Tab styles
  tabIndicator: {
    position: "absolute",
    alignSelf: "center",
    opacity: 0.6,
    borderRadius: 10,
    height: 30,
    weight: 50,
    backgroundColor: "yellow",
  },
  activeTabTitle: {
    fontWeight: "bold",
    color: "#000",
  },
});
