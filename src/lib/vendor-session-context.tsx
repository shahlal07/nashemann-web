"use client";

import { createContext, useContext } from "react";
import { useVendorSession, type VendorSessionState } from "@/lib/vendor-session";

type VendorSessionContextValue = {
  state: VendorSessionState;
  refresh: () => void;
};

const VendorSessionContext = createContext<VendorSessionContextValue | null>(null);

export function VendorSessionProvider({ children }: { children: React.ReactNode }) {
  const { state, refresh } = useVendorSession();
  return <VendorSessionContext.Provider value={{ state, refresh }}>{children}</VendorSessionContext.Provider>;
}

export function useVendorSessionContext() {
  const ctx = useContext(VendorSessionContext);
  if (!ctx) throw new Error("useVendorSessionContext must be used within VendorSessionProvider");
  return ctx;
}
