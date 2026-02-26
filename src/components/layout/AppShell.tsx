"use client";

import { GlobalNav } from "./GlobalNav";
import { ToastProvider } from "@/components/ui/Toast";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <div className="min-h-screen flex flex-col">
        <GlobalNav />
        <main className="flex-1">{children}</main>
      </div>
    </ToastProvider>
  );
}
