// src/context/AuthDialogContext.tsx
import { createContext, useContext, useState, ReactNode } from "react";

type DialogType = "login" | "signup" | "reset" | null;

interface AuthDialogContextValue {
  openDialog: (type: DialogType) => void;
  closeDialog: () => void;
  activeDialog: DialogType;
}

const AuthDialogContext = createContext<AuthDialogContextValue | undefined>(undefined);

export function AuthDialogProvider({ children }: { children: ReactNode }) {
  const [activeDialog, setActiveDialog] = useState<DialogType>(null);

  const openDialog = (type: DialogType) => setActiveDialog(type);
  const closeDialog = () => setActiveDialog(null);

  return (
    <AuthDialogContext.Provider value={{ openDialog, closeDialog, activeDialog }}>
      {children}
    </AuthDialogContext.Provider>
  );
}

export const useAuthDialog = () => {
  const ctx = useContext(AuthDialogContext);
  if (!ctx) throw new Error("useAuthDialog must be used inside AuthDialogProvider");
  return ctx;
};