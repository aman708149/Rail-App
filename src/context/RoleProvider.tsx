// // src/context/RoleContext.tsx
// import React, {
//   createContext,
//   useContext,
//   useEffect,
//   useState,
//   ReactNode,
// } from "react";
// import { GetuserRoleService } from "@/src/service/contextservice";

// export interface User {
//   id: string;
//   role: "admin" | "partner" | "agent";
//   ownerID: string;
//   userID: string;
//   refID: string;
//   currentDateISO: string;
// }

// interface RoleContextType {
//   user: (User & { currentDateISO: string }) | null;
//   setUser: React.Dispatch<
//     React.SetStateAction<(User & { currentDateISO: string }) | null>
//   >;
//   themeModeGlobal: string;
//   setThemeModeGlobal: React.Dispatch<React.SetStateAction<string>>;
// }

// const RoleContext = createContext<RoleContextType | undefined>(undefined);

// interface RoleProviderProps {
//   currentDateISO: string;
//   children: ReactNode;
// }

// export function RoleProvider({ currentDateISO, children }: RoleProviderProps) {
//   const [user, setUser] = useState<(User & { currentDateISO: string }) | null>(
//     null
//   );
//   const [themeModeGlobal, setThemeModeGlobal] = useState("dark");

//   useEffect(() => {
//     const fetchUserData = async () => {
//       try {
//         const response = await GetuserRoleService();
//         console.log("🎯 Role API data:", response.data);
//         setUser({ ...response.data, currentDateISO });
//       } catch (err) {
//         console.error("Failed to fetch user data:", err);
//       }
//     };
//     fetchUserData();
//   }, [currentDateISO]);

//   return (
//     <RoleContext.Provider
//       value={{ user, setUser, themeModeGlobal, setThemeModeGlobal }}
//     >
//       {children}
//     </RoleContext.Provider>
//   );
// }

// export function useRole() {
//   const context = useContext(RoleContext);
//   console.log("context is", context);
//   if (!context)
//     throw new Error("useRole must be used within a RoleProvider");
//   return context;
// }


// src/components/context/RoleProvider.tsx

// src/components/context/RoleProvider.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { GetuserRoleService } from "@/src/service/contextservice";

export interface User {
  id?: string;
  role: "admin" | "partner" | "agent";
  ownerID: string;
  userID: string;
  refID: string;
  email: string;
  status: string;
  userFullName: string;
}

interface RoleContextType {
  user: (User & { currentDateISO: string }) | null;
  setUser: React.Dispatch<React.SetStateAction<(User & { currentDateISO: string }) | null>>;
  themeModeGlobal: string;
  setThemeModeGlobal: React.Dispatch<React.SetStateAction<string>>;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

interface RoleProviderProps {
  currentDateISO: string;
  children: ReactNode;
}

export function RoleProvider({ currentDateISO, children }: RoleProviderProps) {
  const [user, setUser] = useState<(User & { currentDateISO: string }) | null>(null);
  const [themeModeGlobal, setThemeModeGlobal] = useState("dark");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await GetuserRoleService(); // ✅ plain user object

        // ✅ Flatten it here — don't wrap inside `user: {}`
        setUser({
          ...response, // flatten the user fields
          currentDateISO,
        });

        console.log("✅ Stored in context (flattened):", {
          ...response,
          currentDateISO,
        });
      } catch (err) {
        console.error("❌ Failed to fetch user data:", err);
      }
    };

    fetchUserData();
  }, [currentDateISO]);

  return (
    <RoleContext.Provider value={{ user, setUser, themeModeGlobal, setThemeModeGlobal }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) throw new Error("useRole must be used within a RoleProvider");
  return context;
}
