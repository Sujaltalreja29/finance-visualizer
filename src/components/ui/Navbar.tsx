import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { 
  Navbar, 
  NavbarBrand, 
  NavbarContent, 
  NavbarItem, 
  NavbarMenuToggle, 
  NavbarMenu, 
  NavbarMenuItem 
} from "@nextui-org/react";
import { ChevronDown, LayoutDashboard, PlusCircle, ListOrdered, PieChart } from "lucide-react";

// Modern Logo Component
const FinanceLogo = () => (
  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-teal-500 text-white">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path 
        d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13.41 18.09V20H10.74V18.07C9.03 17.71 7.58 16.61 7.47 14.67H9.43C9.53 15.72 10.25 16.54 12.08 16.54C14.04 16.54 14.48 15.56 14.48 14.95C14.48 14.12 14.04 13.34 11.81 12.81C9.33 12.21 7.63 11.19 7.63 9.14C7.63 7.42 9.02 6.2 10.74 5.87V4H13.41V5.89C15.99 6.35 16.53 8.14 16.6 9.08H14.63C14.56 8.3 14.06 7.54 12.08 7.54C10.28 7.54 9.68 8.41 9.68 9.08C9.68 9.91 10.39 10.44 12.36 10.94C14.32 11.44 16.53 12.34 16.53 14.93C16.53 16.47 15.4 17.69 13.41 18.09Z" 
        fill="currentColor"
      />
    </svg>
  </div>
);

export default function AppBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  
  const menuItems = [
    { 
      label: "Dashboard", 
      href: '/dashboard', 
      icon: <LayoutDashboard className="w-4 h-4 mr-2" /> 
    },
    { 
      label: "Add Transaction", 
      href: '/add-transaction', 
      icon: <PlusCircle className="w-4 h-4 mr-2" /> 
    },
    { 
      label: "Transactions", 
      href: '/transactions', 
      icon: <ListOrdered className="w-4 h-4 mr-2" /> 
    },
    { 
      label: "Budgets", 
      href: '/budgets', 
      icon: <PieChart className="w-4 h-4 mr-2" /> 
    },
  ];

  // Check if a route is active
  interface MenuItem {
    label: string;
    href: string;
    icon: Element;
  }

  const isActive = (path: string): boolean => pathname === path;

  return (
    <Navbar 
      onMenuOpenChange={setIsMenuOpen} 
      className="py-3 bg-white border-b border-gray-100 shadow-sm backdrop-blur-md bg-white/90 sticky top-0 z-40"
      maxWidth="xl"
      position="sticky"
    >
      <NavbarMenuToggle
        aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        className="sm:hidden text-gray-700"
      />
      
      <NavbarBrand>
        <Link
          href={"/"}
          className="flex items-center gap-3 hover:opacity-90 transition-opacity"
        >
          <FinanceLogo />
          <div>
            <p className="font-bold text-gray-800 text-xl">Finance Visualizer</p>
            <p className="text-xs text-gray-500 -mt-1 hidden sm:block">Personal Finance Tracker</p>
          </div>
        </Link>
      </NavbarBrand>

      <NavbarContent className="hidden sm:flex gap-1" justify="center">
        {menuItems.map((item) => (
          <NavbarItem key={item.href}>
            <Link
              href={item.href}
              className={`px-4 py-2 rounded-lg flex items-center text-sm transition-all duration-200 ${
                isActive(item.href)
                  ? "text-green-600 bg-green-50 font-medium"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <span className={`hidden md:block ${isActive(item.href) ? "opacity-100" : "opacity-70"}`}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          </NavbarItem>
        ))}
      </NavbarContent>  
      <NavbarMenu className="pt-6 pb-10 px-4 bg-white/95 backdrop-blur-md">
        {menuItems.map((item, index) => (
          <NavbarMenuItem key={`${item.label}-${index}`} className="my-1">
            <Link
              href={item.href}
              className={`w-full px-4 py-3 rounded-lg flex items-center ${
                isActive(item.href)
                  ? "text-green-600 bg-green-50 font-medium"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </Link>
          </NavbarMenuItem>
        ))}
      </NavbarMenu>
    </Navbar>
  );
}