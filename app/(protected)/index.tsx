import { View, ScrollView, SafeAreaView, Text } from "react-native";
import { useDimensions } from "@/hooks/useDimensions";
import { styles } from "@/app/(protected)/styles/index";
type Contact = {
  id: number | string;
  name: string;
  status?: string;
  online?: boolean;
};

// Валидация вынесена в отдельную утилиту
const validateContact = (contact: any): Contact => ({
  id: contact?.id ?? Date.now() + Math.random(),
  name: typeof contact?.name === "string" ? contact.name : "Unknown Contact",
  status: contact?.status || "Last seen recently",
  online: Boolean(contact?.online),
});

const contacts: Contact[] = [
  { id: 1, name: "John Doe", status: "Last online 2 hours ago", online: true },
  { id: 2, name: "Alice Smith", status: "Online", online: true },
  { id: 3, name: "Bob Johnson", status: "Typing...", online: true },
  {
    id: 4,
    name: "Charlie Brown",
    status: "Last seen yesterday",
    online: false,
  },
];

export default function ContactsScreen() {
  const { wp, hp } = useDimensions();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingVertical: hp(1) },
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
          <View
            style={[
              styles.infoGrid,
              {
                width: wp(100),
                paddingHorizontal: wp(6),
                paddingVertical: hp(2),
              },
            ]}
          >
            <Text style={[styles.infoTitle, { marginLeft: wp(2) }]}>Ред.</Text>
            <Text style={styles.infoTitle}>Чаты</Text>
            <Text style={[styles.infoTitle, { marginRight: wp(-24) }]}>
              Пск.
            </Text>
          </View>
          <View style={styles.contactContainer}>
            {contacts.map((contact, index) => {
              const validated = validateContact(contact);
              return (
                <View
                  key={String(validated.id)}
                  style={[
                    styles.contactItem,
                    index === contacts.length - 1 && styles.lastItem,
                  ]}
                >
                  <View style={styles.avatar}>
                    <View
                      style={[
                        styles.statusIndicator,
                        validated.online && styles.online,
                      ]}
                    />
                  </View>
                  <View style={styles.contactInfo}>
                    <Text style={styles.contactName}>{validated.name}</Text>
                    <Text style={styles.contactStatus}>{validated.status}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
