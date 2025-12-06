// ==============================================================
// LoadingContext.jsx — FIXED VERSION
// ==============================================================
import { createContext, useContext, useState } from "react";

const LoadingContext = createContext();

export const LoadingProvider = ({ children }) => {
  // MUST start as false, NOT true
  const [globalLoading, setGlobalLoading] = useState(false);

  return (
    <LoadingContext.Provider value={{ globalLoading, setGlobalLoading }}>
      {children}
    </LoadingContext.Provider>
  );
};

export const useGlobalLoading = () => useContext(LoadingContext);
