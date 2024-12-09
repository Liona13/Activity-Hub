'use client';

import { useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import Link from 'next/link';

const errorMessages: { [key: string]: (provider?: string) => string } = {
  Configuration: () => "There is a problem with the server configuration.",
  AccessDenied: () => "You do not have permission to sign in.",
  Verification: () => "The verification token has expired or has already been used.",
  OAuthSignin: () => "Error in constructing an authorization URL.",
  OAuthCallback: () => "Error in handling the response from an OAuth provider.",
  OAuthCreateAccount: () => "Could not create OAuth provider user in the database.",
  EmailCreateAccount: () => "Could not create email provider user in the database.",
  Callback: () => "Error in the OAuth callback handler route.",
  OAuthAccountNotLinked: (provider) => 
    `This email is already registered with ${provider || 'another'} account. Please sign in with ${provider || 'that provider'} instead.`,
  EmailExists: () => 
    "This email is already registered. Please sign in with the provider you used during registration.",
  NoEmail: () => "The authentication provider did not provide an email address. Please try a different provider or contact support.",
  default: () => "An error occurred during authentication. Please try again.",
};

export default function AuthError() {
  const searchParams = useSearchParams();
  const errorCode = searchParams.get('error');
  const providerName = searchParams.get('provider');
  
  const getErrorMessage = () => {
    if (!errorCode) return errorMessages.default();
    const messageFunc = errorMessages[errorCode] || errorMessages.default;
    return messageFunc(providerName || undefined);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Authentication Error
          </h2>
          <div className="mt-4 p-4 rounded-md bg-red-50">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  {getErrorMessage()}
                </h3>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col space-y-4">
          <Button asChild>
            <Link href="/auth/signin">
              Return to Sign In
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">
              Return Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
} 