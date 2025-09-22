import { View, Text, StyleSheet } from "react-native";
import { useDimensions } from "@/hooks/useDimensions";

const ContactItem = () => {
  const { wp, hp } = useDimensions();

  return (
    <View style={[styles.container, isLast && styles.lastItem]}>
      <View style={styles.avatar}>
        <View style={[styles.status, contact.online && styles.online]} />
      </View>

      <View style={styles.info}>
        <Text style={styles.name}>{contact.name}</Text>
        <Text style={styles.status}>{contact.status}</Text>
      </View>
    </View>
  );
};

export default ContactItem;
