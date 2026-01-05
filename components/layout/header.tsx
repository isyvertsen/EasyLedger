import { UserMenu } from "~/components/auth/user-menu";

export function Header() {
  return (
    <header className="border-b bg-white">
      <div className="flex h-16 items-center px-6">
        <div className="ml-auto flex items-center space-x-4">
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
