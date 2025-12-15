import React from "react";

import { View, ActivityIndicator, Text } from "react-native";

import { useAuth } from "@/context/AuthContext";

import Welcome from "@/pages/Welcome";

import Dashboard from "@/pages/Dashboard";



export default function RootNavigation() {

  const { user, loading } = useAuth();



  if (loading) {

    return (

      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>

        <ActivityIndicator size="large" color="#c53030" />

        <Text style={{ marginTop: 16, fontSize: 18 }}>Loading...</Text>

      </View>

    );

  }



  return user ? <Dashboard /> : <Welcome />;

}
