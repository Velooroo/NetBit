import { typeIdenf } from "./type";

export const HISTORY = [
  { id: 1 },
  { id: 2 },
  { id: 3 },
  { id: 4 },
  { id: 5 },
  { id: 6 },
  { id: 7 },
] as const;

export type History = {
  id: number | string;
};

interface HistoryData {
  id?: unknown;
}

export const validateHistory = (history: unknown): History => {
  const safeHistory =
    typeof history === "object" && history !== null
      ? (history as HistoryData)
      : {};
  return {
    id: typeIdenf(Number(safeHistory.id), "number", "???"),
  };
};

export const getHistories = (): History[] => {
  return HISTORY.map((history) => validateHistory(history));
};
