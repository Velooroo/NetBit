export const CONTACTS = [
  { id: 1, name: "John Doe", status: "Last online 2 hours ago", online: true },
  { id: 2, name: "Alice Smith", status: "Online", online: true },
  { id: 3, name: "Bob Johnson", status: "Typing...", online: true },
  {
    id: 4,
    name: "Charlie Brown",
    status: "Last seen yesterday",
    online: false,
  },
] as const;

export const BUTTONS_OPTIONS = {
  EDIT: "Ред.",
  CHATS: "Чаты",
  SEARCH: "Поиск",
} as const;

export const BUTTONS_ORDER = ["EDIT", "CHATS", "SEARCH"] as const;
