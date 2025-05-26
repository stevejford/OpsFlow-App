"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignInButton, SignOutButton, UserButton, useAuth } from "@clerk/nextjs";

const Navigation = () => {
  const { isSignedIn } = useAuth();
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/" },
    { name: "Employees", href: "/employees" },
    { name: "Tasks", href: "/tasks" },
  ];

  return (
    <header className="bg-blue-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-medium">
              OpsFlow
            </Link>
            {isSignedIn && (
              <nav className="hidden md:ml-8 md:flex md:space-x-6">
                {navItems.map((item) => {
                  const isActive = 
                    (item.href === "/" && pathname === "/") || 
                    (item.href !== "/" && pathname?.startsWith(item.href));
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-blue-700 text-white"
                          : "text-blue-100 hover:text-white hover:bg-blue-700"
                      }`}
                    >
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            )}
          </div>
          <div className="flex items-center">
            {isSignedIn ? (
              <div className="flex items-center gap-4">
                <Link 
                  href="/credentials/create" 
                  className="bg-blue-500 hover:bg-blue-400 px-4 py-2 rounded text-sm font-medium transition-colors shadow-md"
                >
                  <span className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add New
                  </span>
                </Link>
                <UserButton 
                  afterSignOutUrl="/" 
                  appearance={{
                    elements: {
                      userButtonAvatarBox: "w-8 h-8"
                    }
                  }}
                />
              </div>
            ) : (
              <SignInButton mode="modal">
                <button className="bg-blue-500 hover:bg-blue-400 px-4 py-2 rounded text-sm font-medium transition-colors shadow-md">
                  Sign In
                </button>
              </SignInButton>
            )}
          </div>
        </div>
      </div>
      
      {/* Mobile menu, show/hide based on menu state */}
      {isSignedIn && (
        <div className="md:hidden bg-blue-700">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => {
              const isActive = 
                (item.href === "/" && pathname === "/") || 
                (item.href !== "/" && pathname?.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block px-3 py-2 rounded text-base font-medium ${
                    isActive
                      ? "bg-blue-800 text-white"
                      : "text-blue-100 hover:text-white hover:bg-blue-800"
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navigation;
