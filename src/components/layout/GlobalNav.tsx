"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as Icons from "lucide-react";
import { Settings, Zap, Home } from "lucide-react";
import clsx from "clsx";

export function GlobalNav() {
  const objects = useQuery(api.objects.list);
  const pathname = usePathname();

  return (
    <nav className="bg-sf-nav text-white h-12 flex items-center px-4 shadow-md">
      <Link href="/" className="flex items-center gap-2 mr-6">
        <Zap className="h-6 w-6 text-sf-blue-light" />
        <span className="font-bold text-base tracking-tight">IgorForce</span>
      </Link>

      <div className="flex items-center gap-1 flex-1">
        <NavLink href="/" active={pathname === "/"}>
          <Home className="h-4 w-4" />
          <span>Home</span>
        </NavLink>

        {objects?.map((obj) => {
          const Icon = (Icons as any)[obj.icon] || Icons.Box;
          const href = `/objects/${obj.name}`;
          const isActive = pathname.startsWith(href);
          return (
            <NavLink key={obj._id} href={href} active={isActive}>
              <Icon className="h-4 w-4" />
              <span>{obj.pluralLabel}</span>
            </NavLink>
          );
        })}
      </div>

      <Link
        href="/setup"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors"
      >
        <Settings className="h-4 w-4" />
        <span>Setup</span>
      </Link>
    </nav>
  );
}

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={clsx(
        "flex items-center gap-1.5 px-3 py-1.5 rounded text-sm transition-colors",
        active
          ? "bg-white/15 text-white font-medium"
          : "text-white/80 hover:text-white hover:bg-white/10"
      )}
    >
      {children}
    </Link>
  );
}
