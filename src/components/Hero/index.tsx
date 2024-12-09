'use client';

import React from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Button } from "@/components/ui/button";

const Hero = () => {
  const { data: session } = useSession();

  return (
    <div className="relative isolate px-6 pt-14 lg:px-8">
      <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Discover and Join Amazing Activities
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Connect with people who share your interests. Join activities, create events, and make memories together.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            {session ? (
              <>
                <Button size="lg" asChild>
                  <Link href="/activities/create">Create Activity</Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/activities">
                    Browse Activities <span aria-hidden="true">→</span>
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <Button size="lg" asChild>
                  <Link href="/auth/signin">Get Started</Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/activities">
                    Browse Activities <span aria-hidden="true">→</span>
                  </Link>
                </Button>
              </>
            )}
          </div>
          {!session && (
            <p className="mt-6 text-sm text-gray-500">
              Already have an account?{' '}
              <Link href="/auth/signin" className="font-semibold text-primary hover:text-primary/90">
                Sign in
              </Link>
            </p>
          )}
        </div>
      </div>

      {/* Background elements */}
      <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]">
        <div
          className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
          }}
        />
      </div>
    </div>
  );
};

export default Hero; 