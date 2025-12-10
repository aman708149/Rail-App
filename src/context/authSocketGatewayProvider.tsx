import React, { createContext, useContext, useEffect, useState } from "react";
import { useRole } from "./RoleProvider";
import { connectAuthWebSocket, disconnectAuthWebSocket } from "../apputils/gateway/gateway-manager";

// Create a context to hold the WebSocket connection
const AuthWebSocketContext = createContext<any>(null);

export const useAuthWebSocket = () => useContext(AuthWebSocketContext);

const AuthWebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentAuthSocket, setCurrentAuthSocket] = useState<any>(null);
  const userData: any = useRole();

  useEffect(() => {
    // ✅ Establish WebSocket connection for partner/admin
    if (userData?.user && (userData.user.role === "partner" || userData.user.role === "admin")) {
      const userRole = userData.user.role;
      let url = "";

      if (userRole === "partner") {
        url = process.env.EXPO_PUBLIC_WEBSOCKET_AUTH_PARTNER || "";
      } else if (userRole === "admin") {
        url = process.env.EXPO_PUBLIC_WEBSOCKET_AUTH_ADMIN || "";
      }

      if (!url) {
        console.warn("⚠️ WebSocket URL missing for role:", userRole);
        return;
      }

      const socket = connectAuthWebSocket(url);
      setCurrentAuthSocket(socket);

      return () => {
        disconnectAuthWebSocket();
      };
    }
  }, [userData]);

  return (
    <AuthWebSocketContext.Provider value={currentAuthSocket}>
      {children}
    </AuthWebSocketContext.Provider>
  );
};

export default AuthWebSocketProvider;
