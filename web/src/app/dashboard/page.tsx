"use client";

import { useUser } from "@/lib/hooks/useUser";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

export default function Dashboard() {
  const { isConnected } = useAccount();
  const { userProfile, totalEarnings, isLoading } = useUser();
  const router = useRouter();

  // Redirect if not connected or no user
  useEffect(() => {
    if (!isConnected) {
      router.push('/');
    }
  }, [isConnected, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600 mx-auto mb-4"></div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Loading Dashboard</h3>
          <p className="text-gray-600">Setting up your experience...</p>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">User Not Found</h2>
          <p className="text-gray-600 mb-6">Please create your account first.</p>
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
            <Link href="/pools" className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors">
              Pools
            </Link>
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-sm font-semibold text-gray-600">
                {userProfile.name.charAt(0)}
              </span>
            </div>
          </div>
        </div>

        {/* Welcome Section */}
        <div className="bg-white rounded-2xl p-8 mb-8 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome back, {userProfile.name}!
              </h2>
              <p className="text-gray-600 text-lg">
                {userProfile.country} • {userProfile.age} years old
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-green-600 mb-1">
                {totalEarnings ? `${Number(totalEarnings) / 1e18}` : "0"} ETH
              </div>
              <div className="text-gray-600">Total Earnings</div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <div className="text-2xl font-bold text-gray-900 mb-1">0</div>
            <div className="text-gray-600">Pools Created</div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <div className="text-2xl font-bold text-gray-900 mb-1">0</div>
            <div className="text-gray-600">Pools Joined</div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <div className="text-2xl font-bold text-gray-900 mb-1">0</div>
            <div className="text-gray-600">Data Sold</div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <div className="text-2xl font-bold text-gray-900 mb-1">100%</div>
            <div className="text-gray-600">Success Rate</div>
          </div>
        </div>

        {/* My Pools Section */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Created Pools */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">My Created Pools</h3>
              <Link href="/pools" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                View All
              </Link>
            </div>
            <div className="text-center py-8">
              <div className="text-4xl mb-4">📊</div>
              <p className="text-gray-600 mb-4">You haven't created any pools yet</p>
              <Link href="/pools" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                Create Pool
              </Link>
            </div>
          </div>

          {/* Joined Pools */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">My Joined Pools</h3>
              <Link href="/pools" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                Browse Pools
              </Link>
            </div>
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🤝</div>
              <p className="text-gray-600 mb-4">You haven't joined any pools yet</p>
              <Link href="/pools" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                Browse Pools
              </Link>
            </div>
          </div>
        </div>

        {/* Profile Section */}
        <div className="bg-white rounded-2xl p-6 mt-8 border border-gray-100 shadow-sm">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Profile Information</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <p className="text-gray-900 font-medium">{userProfile.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <p className="text-gray-900 font-medium">{userProfile.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
              <p className="text-gray-900 font-medium">{userProfile.age} years</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
              <p className="text-gray-900 font-medium">{userProfile.country}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Verification Status</label>
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                userProfile.isVerified
                  ? "bg-green-100 text-green-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}>
                {userProfile.isVerified ? "✅ Verified" : "⏳ Pending"}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Member Since</label>
              <p className="text-gray-900 font-medium">
                {new Date(Number(userProfile.createdAt) * 1000).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
