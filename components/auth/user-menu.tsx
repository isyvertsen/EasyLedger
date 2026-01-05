import { auth } from "~/lib/auth";
import { SignOutButton } from "./sign-out-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { User } from "lucide-react";

export async function UserMenu() {
  const session = await auth();
  if (!session?.user) return null;

  const initials =
    session.user.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={session.user.image || undefined} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">{session.user.name}</p>
            <p className="text-xs text-muted-foreground">
              {session.user.email}
            </p>
            {session.user.role === "ADMIN" && (
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                Admin
              </span>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <a href="/innstillinger">
            <User className="mr-2 h-4 w-4" />
            Innstillinger
          </a>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <SignOutButton />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
