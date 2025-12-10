// app/auth/_layout.tsx
import { Slot } from "expo-router";

export default function AuthLayout() {
  return <Slot />; // allows nested screens like auth/login
}
