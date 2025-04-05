import { CONTACTS } from "../constants/contacts/button";

type Contact = {
  id: number | string;
  name: string;
  status?: string;
  online?: boolean;
};

/**
 * Validates and normalizes contact data
 * @param {any} contact - The contact data to validate
 * @returns {Contact} - Validated contact object
 */
export const validateContact = (contact: unknown): Contact => ({
  id: (contact as any)?.id ?? Date.now() + Math.random(),
  name:
    typeof (contact as any)?.name === "string"
      ? (contact as any).name
      : "Unknown Contact",
  status: (contact as any)?.status || "Last seen recently",
  online: Boolean((contact as any)?.online),
});

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
