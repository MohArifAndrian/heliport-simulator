"use client";

import { usePathname } from "next/navigation";
import DosenHeader from "@/components/DosenHeader";
import DosenSidebar from "@/components/DosenSidebar";
import { PortalSessionProvider } from "@/components/PortalSessionProvider";

export default function DosenShell({ children }) {
  const pathname = usePathname();

  if (pathname === "/dosen/login") {
    return children;
  }

  return (
    <PortalSessionProvider>
      <div className="min-h-screen bg-[#f0f4f8]">
        <DosenHeader />
        <div className="mx-auto max-w-[1400px] px-4 py-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:gap-6">
            <DosenSidebar />
            <div className="min-w-0 flex-1">{children}</div>
          </div>
        </div>
      </div>
    </PortalSessionProvider>
  );
}
