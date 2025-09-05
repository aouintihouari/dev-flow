"use client";

import {
  ThemeProviderProps,
  ThemeProvider as NextThemesProvider,
} from "next-themes";

import Navbar from "@/components/navigation/navbar";

export default function ThemeProvider({
  children,
  ...props
}: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
      <Navbar />
      {children}
    </NextThemesProvider>
  );
}
