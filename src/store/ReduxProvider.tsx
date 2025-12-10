import React, { ReactNode } from "react";
import { Provider } from "react-redux";
import { store as defaultStore } from "../store";
import type { EnhancedStore } from "@reduxjs/toolkit";

interface ReduxProviderProps {
  children: ReactNode;
  store?: EnhancedStore; // <-- add this line
}

const ReduxProvider: React.FC<ReduxProviderProps> = ({
  children,
  store = defaultStore, // <-- fallback to default store
}) => {
  return <Provider store={store}>{children}</Provider>;
};

export default ReduxProvider;
