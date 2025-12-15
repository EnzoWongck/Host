// app/_layout.tsx   ← 這是 expo-router 的真正入口！

import React from "react";

import { AuthProvider } from "@/src/context/AuthContext";

import RootNavigation from "@/src/navigation/RootNavigation";



export default function RootLayout() {

  return (

    <AuthProvider>

      <RootNavigation />

    </AuthProvider>

  );

}
