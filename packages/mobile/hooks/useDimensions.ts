import { useContext } from "react";
import { DimensionsContext } from "@/context/DimensionContext";

export const useDimensions = () => {
  const { width, height, scale, fontScale } = useContext(DimensionsContext);
  // Функции для расчета процентов от экрана
  const wp = (percentage: number) => width * (percentage / 100);
  const hp = (percentage: number) => height * (percentage / 100);

  return {
    width,
    height,
    wp,
    hp,
    scale,
    fontScale,
  };
};
