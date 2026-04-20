import React, { createContext, useContext, useState, useCallback } from 'react';

interface SidebarCtx {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

const Ctx = createContext<SidebarCtx | null>(null);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((v) => !v), []);
  return <Ctx.Provider value={{ isOpen, open, close, toggle }}>{children}</Ctx.Provider>;
}

export function useSidebar() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useSidebar must be inside SidebarProvider');
  return v;
}
