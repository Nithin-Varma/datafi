"use client";

import { WalletConnect } from "@/components/wallet-connect";
import { UserRegistration } from "@/components/user-registration";
import { useUser } from "@/lib/hooks/useUser";
import { useAccount } from "wagmi";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Home() {
  const { isConnected } = useAccount();
  const { isUserCreated, isLoading, userCreated } = useUser();
  const [showSuccess, setShowSuccess] = useState(false);
  const router = useRouter();

  // Auto-redirect after user creation
  useEffect(() => {
    if (userCreated) {
      setShowSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    }
  }, [userCreated, router]);

  // Don't auto-redirect from home page - let user choose

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600 mx-auto mb-4"></div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Loading DataFi</h3>
          <p className="text-gray-600">Setting up your experience...</p>
        </div>
      </div>
    );
  }

  // Show success animation after user creation
  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center animate-bounce">
          <div className="text-6xl mb-6">🎉</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome to DataFi!</h2>
          <p className="text-gray-600 text-lg">Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  // Show user registration if connected but no user
  if (isConnected && !isUserCreated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-4 py-8">
          <header className="flex justify-between items-center mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">D</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900">DataFi</h1>
            </div>
            <WalletConnect />
          </header>
          
          <main className="max-w-2xl mx-auto">
            <UserRegistration />
          </main>
        </div>
      </div>
    );
  }

  // Show landing page with navigation for connected users
  if (isConnected && isUserCreated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 relative overflow-hidden">
        {/* Subtle background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-100/30 rounded-full blur-3xl"></div>
          <div className="absolute top-40 right-10 w-96 h-96 bg-indigo-100/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-cyan-100/30 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10">
          <div className="container mx-auto px-4 py-8">
            <header className="flex justify-between items-center mb-16">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-2xl">D</span>
                </div>
                <h1 className="text-4xl font-bold text-gray-900">DataFi</h1>
              </div>
              
              <div className="flex items-center space-x-4">
                <Link href="/dashboard" className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors">
                  Dashboard
                </Link>
                <Link href="/pools" className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors">
                  Pools
                </Link>
                <WalletConnect />
              </div>
            </header>
            
            <main className="max-w-6xl mx-auto">
              {/* Hero Section */}
              <div className="text-center mb-20">
                <div className="inline-block mb-8">
                  <span className="inline-block px-6 py-3 bg-blue-100 text-blue-800 rounded-full text-sm font-medium border border-blue-200">
                    🚀 Internet Verifiable Markets
                  </span>
                </div>
                
                <h2 className="text-6xl font-bold text-gray-900 mb-6 leading-tight">
                  Welcome to
                  <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    DataFi
                  </span>
                </h2>
                
                <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
                  Your decentralized data marketplace is ready. Start trading data assets with complete transparency and security.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Link href="/dashboard" className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    Go to Dashboard
                  </Link>
                  <Link href="/pools" className="px-8 py-4 bg-white text-gray-700 font-semibold rounded-xl border border-gray-200 hover:bg-gray-50 transition-all duration-300 shadow-sm">
                    Browse Pools
                  </Link>
                </div>
              </div>

              {/* Features Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
                <div className="group bg-white p-8 rounded-2xl border border-gray-100 hover:border-blue-200 transition-all duration-300 hover:scale-105 shadow-sm hover:shadow-lg">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl">📊</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Data Trading</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Trade data assets with full transparency and security. Every transaction is recorded on the blockchain.
                  </p>
                </div>
                
                <div className="group bg-white p-8 rounded-2xl border border-gray-100 hover:border-blue-200 transition-all duration-300 hover:scale-105 shadow-sm hover:shadow-lg">
                  <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl">🔒</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Smart Contracts</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Automated data agreements powered by blockchain technology. No intermediaries, just pure code.
                  </p>
                </div>
                
                <div className="group bg-white p-8 rounded-2xl border border-gray-100 hover:border-blue-200 transition-all duration-300 hover:scale-105 shadow-sm hover:shadow-lg">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl">🛡️</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Privacy Preserving</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Encrypted data storage with lighthouse integration. Your data, your control, your privacy.
                  </p>
                </div>
              </div>

              {/* Stats Section */}
              <div className="bg-white rounded-3xl p-12 border border-gray-100 shadow-sm">
                <div className="grid md:grid-cols-3 gap-8 text-center">
                  <div>
                    <div className="text-4xl font-bold text-gray-900 mb-2">100%</div>
                    <div className="text-gray-600">Decentralized</div>
                  </div>
                  <div>
                    <div className="text-4xl font-bold text-gray-900 mb-2">0</div>
                    <div className="text-gray-600">Platform Fees</div>
                  </div>
                  <div>
                    <div className="text-4xl font-bold text-gray-900 mb-2">∞</div>
                    <div className="text-gray-600">Possibilities</div>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }

  // Show beautiful landing page if not connected
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 relative overflow-hidden">
      {/* Subtle background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-100/30 rounded-full blur-3xl"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-indigo-100/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-cyan-100/30 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10">
        <div className="container mx-auto px-4 py-8">
          <header className="flex justify-between items-center mb-16">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-2xl">D</span>
              </div>
              <h1 className="text-4xl font-bold text-gray-900">DataFi</h1>
            </div>
            <WalletConnect />
          </header>
          
          <main className="max-w-6xl mx-auto">
            {/* Hero Section */}
            <div className="text-center mb-20">
              <div className="inline-block mb-8">
                <span className="inline-block px-6 py-3 bg-blue-100 text-blue-800 rounded-full text-sm font-medium border border-blue-200">
                  🚀 Internet Verifiable Markets
                </span>
              </div>
              
              <h2 className="text-6xl font-bold text-gray-900 mb-6 leading-tight">
                The Future of
                <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Data Finance
                </span>
              </h2>
              
              <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
                Trade data assets with complete transparency, security, and privacy. 
                Join the decentralized data marketplace revolution.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  Get Started
                </button>
                <button className="px-8 py-4 bg-white text-gray-700 font-semibold rounded-xl border border-gray-200 hover:bg-gray-50 transition-all duration-300 shadow-sm">
                  Learn More
                </button>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
              <div className="group bg-white p-8 rounded-2xl border border-gray-100 hover:border-blue-200 transition-all duration-300 hover:scale-105 shadow-sm hover:shadow-lg">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl">📊</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Data Trading</h3>
                <p className="text-gray-600 leading-relaxed">
                  Trade data assets with full transparency and security. Every transaction is recorded on the blockchain.
                </p>
              </div>
              
              <div className="group bg-white p-8 rounded-2xl border border-gray-100 hover:border-blue-200 transition-all duration-300 hover:scale-105 shadow-sm hover:shadow-lg">
                <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl">🔒</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Smart Contracts</h3>
                <p className="text-gray-600 leading-relaxed">
                  Automated data agreements powered by blockchain technology. No intermediaries, just pure code.
                </p>
              </div>
              
              <div className="group bg-white p-8 rounded-2xl border border-gray-100 hover:border-blue-200 transition-all duration-300 hover:scale-105 shadow-sm hover:shadow-lg">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl">🛡️</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Privacy Preserving</h3>
                <p className="text-gray-600 leading-relaxed">
                  Encrypted data storage with lighthouse integration. Your data, your control, your privacy.
                </p>
              </div>
            </div>

            {/* Stats Section */}
            <div className="bg-white rounded-3xl p-12 border border-gray-100 shadow-sm">
              <div className="grid md:grid-cols-3 gap-8 text-center">
                <div>
                  <div className="text-4xl font-bold text-gray-900 mb-2">100%</div>
                  <div className="text-gray-600">Decentralized</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-gray-900 mb-2">0</div>
                  <div className="text-gray-600">Platform Fees</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-gray-900 mb-2">∞</div>
                  <div className="text-gray-600">Possibilities</div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
