"use client";

import { WalletConnect } from "@/components/wallet-connect";
import { UserRegistration } from "@/components/user-registration";
import { UserDashboard } from "@/components/user-dashboard";
import { useUser } from "@/lib/hooks/useUser";
import { useAccount } from "wagmi";

export default function Home() {
  const { isConnected } = useAccount();
  const { isUserCreated, isLoading } = useUser();

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  // Show user dashboard if connected and user exists
  if (isConnected && isUserCreated) {
    return <UserDashboard />;
  }

  // Show user registration if connected but no user
  if (isConnected && !isUserCreated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8">
          <header className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              DataFi
            </h1>
            <WalletConnect />
          </header>
          
          <main className="max-w-2xl mx-auto">
            <UserRegistration />
          </main>
        </div>
      </div>
    );
  }

  // Show landing page if not connected
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            DataFi
          </h1>
          <WalletConnect />
        </header>
        
        <main className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Internet Verifiable Markets
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Connect your wallet to access the future of data-driven finance
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                Data Trading
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Trade data assets with full transparency and security
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                Smart Contracts
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Automated data agreements powered by blockchain
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                Privacy Preserving
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Encrypted data storage with lighthouse integration
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
