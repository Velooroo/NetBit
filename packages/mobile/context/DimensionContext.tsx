import React from "react";
import { useWindowDimensions } from "react-native";

export const DimensionsContext = React.createContext();

export const DimensionsProvider = ({ children }) => {
  const dimensions = useWindowDimensions();
  return (
    <DimensionsContext.Provider value={dimensions}>
      {children}
    </DimensionsContext.Provider>
  );
};
