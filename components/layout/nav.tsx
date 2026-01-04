"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "~/lib/utils";
import {
  LayoutDashboard,
  Users,
  Truck,
  FileText,
  Receipt,
  FolderOpen,
  Settings,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Kunder", href: "/kunder", icon: Users },
  { name: "Leverandører", href: "/leverandorer", icon: Truck },
  { name: "Fakturaer", href: "/fakturaer", icon: FileText },
  { name: "Utgifter", href: "/utgifter", icon: Receipt },
  { name: "Kategorier", href: "/kategorier", icon: FolderOpen },
  { name: "Innstillinger", href: "/innstillinger", icon: Settings },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {navigation.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <item.icon className="h-5 w-5" />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}
