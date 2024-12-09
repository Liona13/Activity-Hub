'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from 'next/navigation';

const Navbar = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const isLoading = status === 'loading';

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/');
  };

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  return (
    <nav className="w-full border-b">
      <div className="flex items-center justify-between max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16">
        <div className="flex items-center space-x-8">
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-primary">ActivityHub</span>
          </Link>

          <div className="hidden md:flex items-center space-x-4">
            <Link 
              href="/activities"
              className={`text-sm ${
                isActive('/activities')
                  ? 'text-primary font-medium'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Browse Activities
            </Link>
            {session && (
              <Link 
                href="/activities/create"
                className={`text-sm ${
                  isActive('/activities/create')
                    ? 'text-primary font-medium'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Create Activity
              </Link>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {isLoading ? (
            <span className="text-sm text-gray-500">Loading...</span>
          ) : session ? (
            <>
              <div className="hidden md:flex items-center gap-4">
                <Button variant="ghost" asChild>
                  <Link 
                    href="/profile"
                    className={isActive('/profile') ? 'bg-accent' : ''}
                  >
                    Profile
                  </Link>
                </Button>
                <Button variant="outline" onClick={handleSignOut}>
                  Sign out
                </Button>
              </div>

              {/* Mobile menu button for authenticated users */}
              <div className="md:hidden">
                <Button variant="outline" asChild>
                  <Link href="/profile">Menu</Link>
                </Button>
              </div>
            </>
          ) : (
            <>
              <Button asChild>
                <Link href="/auth/signin">Sign in</Link>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Mobile menu for authenticated users */}
      <div className="md:hidden border-t">
        {session && (
          <div className="px-4 py-3 space-y-2">
            <Link 
              href="/activities"
              className={`block py-2 text-sm ${
                isActive('/activities')
                  ? 'text-primary font-medium'
                  : 'text-gray-600'
              }`}
            >
              Browse Activities
            </Link>
            <Link 
              href="/activities/create"
              className={`block py-2 text-sm ${
                isActive('/activities/create')
                  ? 'text-primary font-medium'
                  : 'text-gray-600'
              }`}
            >
              Create Activity
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 