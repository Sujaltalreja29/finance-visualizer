import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Link, NavbarMenuToggle, NavbarMenu, NavbarMenuItem } from "@nextui-org/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

const AcmeLogo = () => (
  <svg fill="none" height="36" viewBox="0 0 32 32" width="36">
    <path
      clipRule="evenodd"
      d="M17.6482 10.1305L15.8785 7.02583L7.02979 22.5499H10.5278L17.6482 10.1305ZM19.8798 14.0457L18.11 17.1983L19.394 19.4511H16.8453L15.1056 22.5499H24.7272L19.8798 14.0457Z"
      fill="currentColor"
      fillRule="evenodd"
    />
  </svg>
);

export default function AppBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  
  // Updated menu items without auth-related options
  const menuItems = [
    { label: "Dashboard", href: '/dashboard' },
    { label: "Add Transaction", href: '/add-transaction' },
    { label: "Transactions", href: '/transactions' },
    { label: "Budgets", href: '/budgets' },
  ];

  return (
    <Navbar onMenuOpenChange={setIsMenuOpen} className="py-4 bg-white border-b border-gray-200 shadow-sm">
      <NavbarMenuToggle
        aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        className="sm:hidden"
      />
      <NavbarBrand>
        <Link
          href={"/"}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <AcmeLogo />
          <p className="font-bold text-inherit text-2xl">Finance Visualizer</p>
        </Link>
      </NavbarBrand>

      <NavbarContent className="hidden sm:flex gap-7" justify="center">
        {[
          { path: "/dashboard", label: "Dashboard" },
          { path: "/add-transaction", label: "Add Transaction" },
          { path: "/transactions", label: "Transactions" },
          { path: "/budgets", label: "Budgets" },
        ].map((item) => (
          <NavbarItem key={item.path}>
            <Link
              href={item.path}
              className="text-gray-600 hover:text-green-500 transition-colors duration-200 font-medium"
            >
              {item.label}
            </Link>
          </NavbarItem>
        ))}
      </NavbarContent>
      
      <NavbarMenu className="py-10">
        {menuItems.map((item, index) => (
          <NavbarMenuItem key={`${item.label}-${index}`}>
            <Link
              className="w-full"
              color={index === 2 ? "primary" : "foreground"}
              href={item.href}
              size="lg"
            >
              {item.label}
            </Link>
          </NavbarMenuItem>
        ))}
      </NavbarMenu>
    </Navbar>
  );
}