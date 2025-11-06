import { Link, NavLink, useLocation } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import ConnectMetamask from "@/components/wallet/ConnectMetamask";
import ThemeToggle from "@/components/ui/ThemeToggle";

export default function Header() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const nav = [
    { to: "/", label: "Home" },
    { to: "/my-campaigns", label: "My Campaigns" },
    { to: "/my-contributions", label: "Mis aportes" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-tr from-emerald-500 to-teal-400 text-white font-bold">SF</span>
          <span className="text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-500">SparkFund</span>
        </Link>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <button
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-label="Toggle menu"
            className="inline-flex items-center justify-center p-2 rounded-md hover:bg-muted/10"
          >
            <span className="sr-only">Toggle menu</span>
            {open ? <span className="text-2xl leading-none">×</span> : <span className="text-2xl leading-none">☰</span>}
          </button>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          {nav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              className={({ isActive }) =>
                cn(
                  "text-sm font-medium text-muted-foreground hover:text-foreground transition-colors",
                  (isActive || location.pathname === n.to) && "text-foreground",
                )
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          <ConnectMetamask />
          <Link to="/create">
            <Button className="bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-sm">
              Start a campaign
            </Button>
          </Link>
        </div>
      </div>

      {/* Mobile menu panel */}
      {open && (
        <div className="md:hidden border-t bg-background/95">
          <div className="container flex flex-col gap-3 py-3">
            <nav className="flex flex-col gap-2">
              {nav.map((n) => (
                <NavLink
                  key={n.to}
                  to={n.to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2",
                      (isActive || location.pathname === n.to) && "text-foreground",
                    )
                  }
                >
                  {n.label}
                </NavLink>
              ))}
            </nav>

            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3 pt-2">
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <ConnectMetamask />
              </div>
              <div className="pt-2 sm:pt-0">
                <Link to="/create">
                  <Button className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-sm">
                    Start a campaign
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
