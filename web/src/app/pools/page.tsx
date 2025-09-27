"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { PoolCreation } from "@/components/pool-creation";
import { PoolList } from "@/components/pool-list";

export default function Pools() {
  const { isConnected } = useAccount();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"create" | "browse">("browse");

  // Redirect if not connected
  useEffect(() => {
    if (!isConnected) {
      router.push('/');
    }
  }, [isConnected, router]);

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Connect Wallet</h2>
          <p className="text-gray-600 mb-6">You need to connect your wallet to access pools.</p>
          <Link href="/" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">D</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">DataFi</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link href="/" className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors">
              Home
            </Link>
            <Link href="/dashboard" className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors">
              Dashboard
            </Link>
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-sm font-semibold text-gray-600">U</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl mb-8 border border-gray-100 shadow-sm">
          <div className="flex">
            <button
              onClick={() => setActiveTab("browse")}
              className={`flex-1 px-6 py-4 font-semibold text-sm rounded-xl m-2 transition-all duration-300 ${
                activeTab === "browse"
                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              🔍 Browse All Pools
            </button>
            <button
              onClick={() => setActiveTab("create")}
              className={`flex-1 px-6 py-4 font-semibold text-sm rounded-xl m-2 transition-all duration-300 ${
                activeTab === "create"
                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              ➕ Create New Pool
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
          {activeTab === "create" && <PoolCreation />}
          {activeTab === "browse" && <PoolList />}
        </div>
      </div>
    </div>
  );
}
