import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Store, LayoutGrid, ClipboardList } from "lucide-react";

const Navbar = () => {
  const location = useLocation();

  const links = [
    { href: "/", label: "PDV", icon: Store },
    { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
    { href: "/catalog", label: "Catálogo", icon: ClipboardList },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b border-orange-100 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex-1 flex items-center justify-center sm:justify-start">
            <div className="flex space-x-4">
              {links.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={cn(
                      "inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      location.pathname === link.href
                        ? "bg-orange-100 text-orange-600"
                        : "text-gray-600 hover:bg-orange-50 hover:text-orange-600",
                    )}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
