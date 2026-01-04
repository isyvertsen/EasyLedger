import Link from "next/link";
import { Nav } from "./nav";

export function Sidebar() {
  return (
    <div className="flex h-full w-64 flex-col border-r bg-white">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <span className="text-lg font-bold">EL</span>
          </div>
          <span className="text-lg font-semibold">EasyLedger</span>
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <Nav />
      </div>
    </div>
  );
}
