import { Outlet } from "react-router-dom";
import { AppHeader } from "./AppHeader";

export function RootLayout() {
  return (
    <>
      <AppHeader />
      <Outlet />
    </>
  );
}
