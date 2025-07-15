"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { StatusNotification } from "./StatusNotification";

interface User {
  id: number;
  name: string;
  email: string;
}

export const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);

    const getUser = async () => {
      try {
        const user = await fetch("http://localhost:3000/auth/me", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        setUser(await user.json());
      } catch (err) {
        console.error("Failed to fetch user:", err);
      }
    };

    if (token) {
      getUser();
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setUser(null);
    setSuccess("Logged out successfully");
    setIsMenuOpen(false);
    router.push("/auth/login");
  };

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Flavor</h2>
        <button
          className="sm:hidden text-gray-600 focus:outline-none"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={
                isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"
              }
            />
          </svg>
        </button>
        <nav
          className={`sm:flex sm:items-center ${
            isMenuOpen ? "block" : "hidden"
          } sm:block absolute sm:static top-16 left-0 w-full sm:w-auto bg-white sm:bg-transparent shadow-md sm:shadow-none z-40`}
        >
          <div className="flex flex-col sm:flex-row sm:space-x-4 p-4 sm:p-0">
            <Link
              href="/"
              className="text-gray-600 hover:text-blue-600 py-2 sm:py-0 text-sm sm:text-base"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/profile"
              className="text-gray-600 hover:text-blue-600 py-2 sm:py-0 text-sm sm:text-base"
              onClick={() => setIsMenuOpen(false)}
            >
              Profile
            </Link>
            {isLoggedIn && user ? (
              <div className="relative group">
                <span className="text-gray-600 hover:text-blue-600 py-2 sm:py-0 text-sm sm:text-base cursor-pointer">
                  {user.name}
                </span>
                <div className="absolute hidden group-hover:block sm:right-0 bg-white shadow-md rounded-md pt-2 z-50 w-32">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left text-gray-600 hover:text-blue-600 hover:bg-gray-100 py-2 px-4 text-sm"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-gray-600 hover:text-blue-600 py-2 sm:py-0 text-sm sm:text-base"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>

                <Link
                  href="/auth/register"
                  className="text-gray-600 hover:text-blue-600 py-2 sm:py-0 text-sm sm:text-base"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
      {success && (
        <StatusNotification
          message={success}
          type="success"
          onClose={() => setSuccess(null)}
        />
      )}
    </header>
  );
};
