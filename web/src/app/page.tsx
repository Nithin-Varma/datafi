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
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();

  // Initialize component
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialized(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Auto-redirect after user creation
  useEffect(() => {
    console.log("Redirect check:", { userCreated, isInitialized, isUserCreated });
    if (userCreated && isInitialized) {
      console.log("User created, showing success and redirecting...");
      setShowSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    }
  }, [userCreated, router, isInitialized]);

  // Remove automatic redirect - let users stay on landing page

  // Show loading state
  if (isLoading || !isInitialized) {
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
          <p className="text-gray-600 text-lg mb-6">Redirecting to your dashboard...</p>
          <Link 
            href="/dashboard" 
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Go to Dashboard
          </Link>
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
                    🌐 Decentralized Identity & Data Marketplace
                  </span>
                </div>
                
                <h2 className="text-6xl font-bold text-gray-900 mb-6 leading-tight">
                  Welcome to
                  <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    DataFi
                  </span>
                </h2>
                
                <p className="text-xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
                  The first decentralized marketplace for verified personal data. Monetize your identity verification while maintaining complete privacy through zero-knowledge proofs and encrypted storage.
                </p>

                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 max-w-4xl mx-auto mb-12">
                  <div className="grid md:grid-cols-2 gap-6 text-left">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mt-1">
                        <span className="text-white text-sm font-bold">✓</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Self Protocol Integration</h4>
                        <p className="text-gray-600 text-sm">Verify age, nationality, and identity using Self's privacy-preserving technology</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mt-1">
                        <span className="text-white text-sm font-bold">✓</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">ZK-Email Verification</h4>
                        <p className="text-gray-600 text-sm">Prove email ownership and subscriptions without revealing sensitive data</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mt-1">
                        <span className="text-white text-sm font-bold">✓</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Lighthouse Encryption</h4>
                        <p className="text-gray-600 text-sm">Military-grade encryption ensures your data remains private and secure</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center mt-1">
                        <span className="text-white text-sm font-bold">✓</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Base Blockchain</h4>
                        <p className="text-gray-600 text-sm">Low-cost, fast transactions on Coinbase's Layer 2 solution</p>
                      </div>
                    </div>
                  </div>
                </div>

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
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Identity Verification Markets</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Create data pools for specific verification requirements. Sellers provide verified identity data, buyers access aggregated insights while preserving individual privacy.
                  </p>
                </div>
                
                <div className="group bg-white p-8 rounded-2xl border border-gray-100 hover:border-blue-200 transition-all duration-300 hover:scale-105 shadow-sm hover:shadow-lg">
                  <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl">🔒</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Zero-Knowledge Proofs</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Prove claims about your identity without revealing sensitive information. Age verification, nationality checks, and email ownership without data exposure.
                  </p>
                </div>
                
                <div className="group bg-white p-8 rounded-2xl border border-gray-100 hover:border-blue-200 transition-all duration-300 hover:scale-105 shadow-sm hover:shadow-lg">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl">🛡️</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Encrypted Data Storage</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Your verification data is encrypted using Lighthouse's decentralized storage. Only you control access, ensuring complete privacy and data sovereignty.
                  </p>
                </div>
              </div>

              {/* How It Works Section */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl p-12 border border-blue-100 shadow-sm mb-20">
                <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">How DataFi Works</h3>
                <div className="grid md:grid-cols-3 gap-8">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-white text-2xl font-bold">1</span>
                    </div>
                    <h4 className="text-xl font-semibold text-gray-900 mb-3">Create or Join Pools</h4>
                    <p className="text-gray-600">Buyers create data pools with specific verification requirements. Sellers join pools that match their available verifications.</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-white text-2xl font-bold">2</span>
                    </div>
                    <h4 className="text-xl font-semibold text-gray-900 mb-3">Verify & Submit</h4>
                    <p className="text-gray-600">Complete verification using Self Protocol or ZK-Email. Your data is encrypted and stored securely on Lighthouse.</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-white text-2xl font-bold">3</span>
                    </div>
                    <h4 className="text-xl font-semibold text-gray-900 mb-3">Get Paid</h4>
                    <p className="text-gray-600">Receive automatic payments once verification is complete. Buyers get access to aggregated, privacy-preserving insights.</p>
                  </div>
                </div>
              </div>

              {/* Stats Section */}
              <div className="bg-white rounded-3xl p-12 border border-gray-100 shadow-sm">
                <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">Built on Cutting-Edge Technology</h3>
                <div className="grid md:grid-cols-4 gap-8 text-center">
                  <div>
                    <div className="text-3xl font-bold text-blue-600 mb-2">Base L2</div>
                    <div className="text-gray-600 text-sm">Fast & Low-Cost Transactions</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-green-600 mb-2">Self Protocol</div>
                    <div className="text-gray-600 text-sm">Privacy-Preserving Identity</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-purple-600 mb-2">ZK-Email</div>
                    <div className="text-gray-600 text-sm">Email Verification Proofs</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-orange-600 mb-2">Lighthouse</div>
                    <div className="text-gray-600 text-sm">Encrypted Storage</div>
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
                  🌐 Decentralized Identity & Data Marketplace
                </span>
              </div>

              <h2 className="text-6xl font-bold text-gray-900 mb-6 leading-tight">
                The Future of
                <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Data Finance
                </span>
              </h2>

              <p className="text-xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
                The first decentralized marketplace for verified personal data. Monetize your identity verification while maintaining complete privacy through zero-knowledge proofs and encrypted storage.
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 max-w-4xl mx-auto mb-12">
                <div className="grid md:grid-cols-2 gap-6 text-left">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mt-1">
                      <span className="text-white text-sm font-bold">✓</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Self Protocol Integration</h4>
                      <p className="text-gray-600 text-sm">Verify age, nationality, and identity using Self's privacy-preserving technology</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mt-1">
                      <span className="text-white text-sm font-bold">✓</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">ZK-Email Verification</h4>
                      <p className="text-gray-600 text-sm">Prove email ownership and subscriptions without revealing sensitive data</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mt-1">
                      <span className="text-white text-sm font-bold">✓</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Lighthouse Encryption</h4>
                      <p className="text-gray-600 text-sm">Military-grade encryption ensures your data remains private and secure</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center mt-1">
                      <span className="text-white text-sm font-bold">✓</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Base Blockchain</h4>
                      <p className="text-gray-600 text-sm">Low-cost, fast transactions on Coinbase's Layer 2 solution</p>
                    </div>
                  </div>
                </div>
              </div>

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
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Identity Verification Markets</h3>
                <p className="text-gray-600 leading-relaxed">
                  Create data pools for specific verification requirements. Sellers provide verified identity data, buyers access aggregated insights while preserving individual privacy.
                </p>
              </div>
              
              <div className="group bg-white p-8 rounded-2xl border border-gray-100 hover:border-blue-200 transition-all duration-300 hover:scale-105 shadow-sm hover:shadow-lg">
                <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl">🔒</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Zero-Knowledge Proofs</h3>
                <p className="text-gray-600 leading-relaxed">
                  Prove claims about your identity without revealing sensitive information. Age verification, nationality checks, and email ownership without data exposure.
                </p>
              </div>
              
              <div className="group bg-white p-8 rounded-2xl border border-gray-100 hover:border-blue-200 transition-all duration-300 hover:scale-105 shadow-sm hover:shadow-lg">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl">🛡️</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Encrypted Data Storage</h3>
                <p className="text-gray-600 leading-relaxed">
                  Your verification data is encrypted using Lighthouse's decentralized storage. Only you control access, ensuring complete privacy and data sovereignty.
                </p>
              </div>
            </div>

            {/* How It Works Section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl p-12 border border-blue-100 shadow-sm mb-20">
              <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">How DataFi Works</h3>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white text-2xl font-bold">1</span>
                  </div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-3">Create or Join Pools</h4>
                  <p className="text-gray-600">Buyers create data pools with specific verification requirements. Sellers join pools that match their available verifications.</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white text-2xl font-bold">2</span>
                  </div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-3">Verify & Submit</h4>
                  <p className="text-gray-600">Complete verification using Self Protocol or ZK-Email. Your data is encrypted and stored securely on Lighthouse.</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white text-2xl font-bold">3</span>
                  </div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-3">Get Paid</h4>
                  <p className="text-gray-600">Receive automatic payments once verification is complete. Buyers get access to aggregated, privacy-preserving insights.</p>
                </div>
              </div>
            </div>

            {/* Stats Section */}
            <div className="bg-white rounded-3xl p-12 border border-gray-100 shadow-sm">
              <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">Built on Cutting-Edge Technology</h3>
              <div className="grid md:grid-cols-4 gap-8 text-center">
                <div>
                  <div className="text-3xl font-bold text-blue-600 mb-2">Base L2</div>
                  <div className="text-gray-600 text-sm">Fast & Low-Cost Transactions</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-600 mb-2">Self Protocol</div>
                  <div className="text-gray-600 text-sm">Privacy-Preserving Identity</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-purple-600 mb-2">ZK-Email</div>
                  <div className="text-gray-600 text-sm">Email Verification Proofs</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-orange-600 mb-2">Lighthouse</div>
                  <div className="text-gray-600 text-sm">Encrypted Storage</div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
