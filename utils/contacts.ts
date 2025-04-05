import { typeIdenf } from "./type";

export const CONTACTS = [
  { id: 1, name: "John Due", status: "Last online 2 hours ago", online: true },
  { id: 2, name: "Alice Smith", status: "Online", online: true },
  { id: 3, name: "Bob Johnson", status: "Typing...", online: true },
  {
    id: 4,
    name: "Charlie Brown",
    status: "Last seen yesterday",
    online: false,
  },
] as const;

export const PINNED_CONTACTS = [
  { id: 5, name: "Jane Doe", status: "Last online 4 hours ago", online: true },
  { id: 6, name: "David Johnson", status: "Away", online: false },
]

export type Contact = {
  id: number | string;
  name: string;
  status?: string;
  online?: boolean;
  notifications?: boolean;
  lastMessageData?: number;
};

interface ContactData {
  id?: unknown;
  name?: unknown;
  status?: unknown;
  online?: unknown;
  notifications?: unknown;
  lastMessageData?: unknown;
}

const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

/**
 * Validates and normalizes contact data
 * @param {any} contact - The contact data to validate
 * @returns {Contact} - Validated contact object
 */
export const validateContact = (contact: unknown): Contact => {
  // Проверка типа и защита от null/примитивов
  const safeContact = (typeof contact === 'object' && contact !== null) 
    ? contact as ContactData 
    : {};

    return {
      id:              typeIdenf (Number(safeContact.id), 'number', generateId()),
      name:            typeIdenf (safeContact.name, 'string', 'Unknown Contact'),
      status:          typeIdenf (safeContact.status, 'string', 'Last seen recently'),
      online:          typeIdenf (safeContact.online, 'boolean', false),
      notifications:   typeIdenf (safeContact.notifications, 'boolean', false),
      lastMessageData: typeIdenf (safeContact.lastMessageData, 'number', 0),
    };
};

/**
 * Logs contact press event
 * @param {Contact} contact - The contact that was pressed
 */
export const logContactPress = (contact: Contact) => {
  console.log(`Contact pressed: ${contact.name} (ID: ${contact.id})`);
  console.log(`Status: ${contact.status}`);
  console.log(`Online: ${contact.online ? "Yes" : "No"}`);
};

/**
 * Gets all contacts with validation
 * @returns {Contact[]} Array of validated contacts
 */
export const getValidatedContacts = (): Contact[] => {
  return CONTACTS.map((contact) => validateContact(contact));
};

export const getPinnedValidatedContacts = (): Contact[] => {
  return PINNED_CONTACTS.map((contact) => validateContact(contact));
};
