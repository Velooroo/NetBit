import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
    alignItems: "center",
  },
  chatContainer: {
    flex: 1,
    backgroundColor: "transparent",
    borderRadius: 24,
    elevation: 3,
    alignSelf: "center",
  },
  headerContainer: {
    backgroundColor: "#FFE3CF",
  },
  contactContainer: {
    flex: 1,
    backgroundColor: "white",
  },
  rightContainer: {
    marginLeft: "auto",
    alignItems: "flex-end",
    marginRight: 16,
    flexDirection: "row",
  },
  muteIcon: {
    marginRight: 8,
  },
  timeText: {
    fontSize: 12,
    color: "#666",
  },
  scrollContent: {
    paddingBottom: 24,
    flexGrow: 1, // Для правильной работы ScrollView
    justifyContent: "center",
  },
  buttonGrid: {
    flexWrap: "wrap",
    width: "auto",
    flexDirection: "row",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
  },
  buttonView: {
    borderRadius: 10,
    paddingVertical: 5,
  },
  buttonTitle: {
    fontSize: 20,
    textAlign: "center",
    color: "#333333",
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  contactPinItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: "#FFE3CF",
  },
  lineItem: {
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    alignSelf: "center",
  },
  lineItemPin: {
    borderBottomWidth: 1,
    borderBottomColor: "#9E6E4C",
    alignSelf: "center",
  },
  lineBackground: {
    backgroundColor: "#FFE3CF",
    flex: 1,
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
    color: "#333333",
  },
  contactStatus: {
    fontSize: 14,
    color: "#666",
  },
  // Tab styles
  tabIndicator: {
    position: "absolute",
    alignSelf: "center",
    borderRadius: 8,
    height: 30,
    backgroundColor: "#FFFDED",
  },
  activeTabTitle: {
    fontWeight: "bold",
    color: "#000",
  },
});
