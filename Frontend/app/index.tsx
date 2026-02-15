/**
 * Index - Redirects to Welcome screen
 * Entry point that handles initial navigation
 */

import { Redirect } from "expo-router";
import { useAuth } from "@/context/AuthContext";

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();

  // While loading, don't redirect yet
  if (isLoading) {
    return null;
  }

  // If authenticated, go to tabs; otherwise, go to welcome
  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/welcome" />;
}
