"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { ThemeContextType } from "@/lib/admin/types"; // adjust import path if needed

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true); 
  // 👆 DEFAULT = DARK MODE

  useEffect(() => {
    // Check saved preference
    const saved = localStorage.getItem("admin-theme");

    if (saved === "light") {
      setIsDarkMode(false);
    } else {
      setIsDarkMode(true); // default dark
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;

    if (isDarkMode) {
      root.classList.add("dark");
      localStorage.setItem("admin-theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("admin-theme", "light");
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
};
