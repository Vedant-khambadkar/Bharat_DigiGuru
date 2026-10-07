import React, { createContext, useContext } from "react";

export interface HomeScrollContextValue {
  scrollProgressRef: React.RefObject<number>;
}

export const HomeScrollContext = createContext<HomeScrollContextValue>({
  scrollProgressRef: { current: 0 },
});

export const useHomeScrollProgress = (): React.RefObject<number> => {
  const ctx = useContext(HomeScrollContext);
  return ctx.scrollProgressRef;
};
