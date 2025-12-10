import React, { createContext, useContext, useEffect, useState } from "react";
import { useRole } from "./RoleProvider";
import { connectTransactionWebSocket, disconnectTransactionWebSocket } from "../apputils/gateway/gateway-manager";

/**
 * ✅ Context for WebSocket connection
 */
const WebSocketContext = createContext<any>(null);

export const useWebSocket = () => useContext(WebSocketContext);

const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentSocket, setCurrentSocket] = useState<any>(null);
  const userData: any = useRole();

  useEffect(() => {
    let socket: any = null;

    const connectSocket = async () => {
      if (
        userData &&
        userData.user &&
        (userData.user.role === "partner" || userData.user.role === "admin")
      ) {
        const userRole = userData.user.role;
        let url = "";

        if (userRole === "partner") {
          url = process.env.EXPO_PUBLIC_WEBSOCKET_TRANSACTION_PARTNER || "";
        } else if (userRole === "admin") {
          url = process.env.EXPO_PUBLIC_WEBSOCKET_TRANSACTION_ADMIN || "";
        }

        if (!url) {
          console.warn("⚠️ WebSocket URL not defined for role:", userRole);
          return;
        }

        console.log("🔗 Connecting to WebSocket:", url);
        socket = await connectTransactionWebSocket(url);
        setCurrentSocket(socket);

        socket.on("connect", () => {
          console.log("✅ WebSocket connected:", socket.id);
        });

        socket.on("disconnect", (reason: string) => {
          console.log("🔌 WebSocket disconnected:", reason);
        });

        socket.on("connect_error", (err: any) => {
          console.error("❌ WebSocket connection error:", err.message);
        });
      }
    };

    connectSocket();

    return () => {
      disconnectTransactionWebSocket();
      setCurrentSocket(null);
    };
  }, [userData]);

  return (
    <WebSocketContext.Provider value={currentSocket}>
      {children}
    </WebSocketContext.Provider>
  );
};

export default WebSocketProvider;
