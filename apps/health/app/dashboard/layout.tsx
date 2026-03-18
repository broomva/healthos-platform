import Link from "next/link";

const navItems = [
  { href: "/dashboard", label: "Overview" },
  { href: "/", label: "Chat" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-dvh">
      {/* Sidebar */}
      <aside className="hidden w-56 shrink-0 flex-col border-r bg-muted/40 md:flex">
        <div className="flex h-14 items-center border-b px-4">
          <Link className="font-semibold text-lg" href="/dashboard">
            healthOS
          </Link>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3">
          {navItems.map((item) => (
            <Link
              className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex flex-1 flex-col overflow-y-auto">
        {/* Mobile header */}
        <header className="flex h-14 items-center gap-4 border-b px-4 md:hidden">
          <Link className="font-semibold" href="/dashboard">
            healthOS
          </Link>
          <nav className="ml-auto flex gap-3">
            {navItems.map((item) => (
              <Link
                className="text-sm text-muted-foreground hover:text-foreground"
                href={item.href}
                key={item.href}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </header>

        <div className="flex-1 p-4 md:p-6">{children}</div>
      </main>
    </div>
  );
}
