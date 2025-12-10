// src/utils/WebSocketManager.ts

import { io, Socket } from "socket.io-client";
import * as SecureStore from "expo-secure-store";

let regularSocket: Socket | null = null;
let authSocket: Socket | null = null;

/**
 * ✅ Connect WebSocket for Transactions
 */
export const connectTransactionWebSocket = async (url: string) => {
  if (!regularSocket) {
    const token = await SecureStore.getItemAsync("auth-token"); // Optional: attach token manually

    regularSocket = io(url, {
      transports: ["websocket"], // React Native requires this
      reconnection: true,
      reconnectionAttempts: 10,
      extraHeaders: token ? { Authorization: `Bearer ${token}` } : {},
    });

    regularSocket.on("connect", () => {
      console.log("✅ Transaction socket connected:", regularSocket?.id);
    });

    regularSocket.on("disconnect", (reason: any) => {
      console.log("⚠️ Transaction socket disconnected:", reason);
    });

    regularSocket.on("connect_error", (err: any) => {
      console.error("❌ Transaction socket error:", err.message);
    });
  }

  return regularSocket;
};

/**
 * ✅ Disconnect Transaction WebSocket
 */
export const disconnectTransactionWebSocket = () => {
  if (regularSocket) {
    regularSocket.disconnect();
    regularSocket = null;
    console.log("🔌 Transaction socket disconnected manually");
  }
};

/**
 * ✅ Connect WebSocket for Authentication Events
 */
export const connectAuthWebSocket = async (url: string) => {
  if (!authSocket) {
    const token = await SecureStore.getItemAsync("auth-token");

    authSocket = io(url, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 10,
      extraHeaders: token ? { Authorization: `Bearer ${token}` } : {},
    });

    authSocket.on("connect", () => {
      console.log("✅ Auth socket connected:", authSocket?.id);
    });

    authSocket.on("disconnect", (reason: any) => {
      console.log("⚠️ Auth socket disconnected:", reason);
    });

    authSocket.on("connect_error", (err: any) => {
      console.error("❌ Auth socket error:", err.message);
    });
  }

  return authSocket;
};

/**
 * ✅ Disconnect Auth WebSocket
 */
export const disconnectAuthWebSocket = () => {
  if (authSocket) {
    authSocket.disconnect();
    authSocket = null;
    console.log("🔌 Auth socket disconnected manually");
  }
};
