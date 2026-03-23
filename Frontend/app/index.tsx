/**
 * Index - Entry point
 * Redirects to the animated splash screen on first load
 */

import { Redirect } from "expo-router";

export default function Index() {
  return <Redirect href="/splash" />;
}
