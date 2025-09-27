"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useUser } from "@/lib/hooks/useUser";
import { PoolCreation } from "./pool-creation";
import { PoolList } from "./pool-list";

export function UserDashboard() {
  const { userProfile, totalEarnings, address } = useUser();
  const [activeTab, setActiveTab] = useState<"profile" | "create" | "pools">("profile");

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white/20 border-t-white mx-auto mb-6"></div>
          <h3 className="text-2xl font-bold text-white mb-2">Loading Dashboard</h3>
          <p className="text-white/70">Setting up your experience...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header with Stats */}
        <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 mb-8 border border-white/20 shadow-2xl">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl">
                <span className="text-2xl">👋</span>
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">
                  Welcome back, {userProfile.name}!
                </h1>
                <p className="text-white/70 text-lg">
                  {userProfile.country} • {userProfile.age} years old
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1">
                  {totalEarnings ? `${Number(totalEarnings) / 1e18}` : "0"}
                </div>
                <div className="text-white/70 text-sm">ETH Earned</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1">0</div>
                <div className="text-white/70 text-sm">Pools Created</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1">0</div>
                <div className="text-white/70 text-sm">Data Sold</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1">100%</div>
                <div className="text-white/70 text-sm">Success Rate</div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl mb-8 border border-white/20 shadow-xl">
          <div className="flex">
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex-1 px-6 py-4 font-semibold text-sm rounded-2xl m-2 transition-all duration-300 ${
                activeTab === "profile"
                  ? "bg-white/20 text-white shadow-lg"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              }`}
            >
              👤 Profile
            </button>
            <button
              onClick={() => setActiveTab("create")}
              className={`flex-1 px-6 py-4 font-semibold text-sm rounded-2xl m-2 transition-all duration-300 ${
                activeTab === "create"
                  ? "bg-white/20 text-white shadow-lg"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              }`}
            >
              ➕ Create Pool
            </button>
            <button
              onClick={() => setActiveTab("pools")}
              className={`flex-1 px-6 py-4 font-semibold text-sm rounded-2xl m-2 transition-all duration-300 ${
                activeTab === "pools"
                  ? "bg-white/20 text-white shadow-lg"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              }`}
            >
              🔍 Browse Pools
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-2xl">
          {activeTab === "profile" && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">Your Profile</h2>
                <p className="text-white/70">Manage your account information</p>
              </div>
              
              <div className="grid lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-white/10">
                    <h3 className="text-xl font-semibold text-white mb-4">Personal Information</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-white/70 mb-2">Name</label>
                        <p className="text-lg text-white font-medium">{userProfile.name}</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-white/70 mb-2">Email</label>
                        <p className="text-lg text-white font-medium">{userProfile.email}</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-white/70 mb-2">Age</label>
                        <p className="text-lg text-white font-medium">{userProfile.age} years</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-white/70 mb-2">Country</label>
                        <p className="text-lg text-white font-medium">{userProfile.country}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-white/10">
                    <h3 className="text-xl font-semibold text-white mb-4">Account Status</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-white/70 mb-2">Verification Status</label>
                        <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                          userProfile.isVerified
                            ? "bg-green-500/20 text-green-300 border border-green-500/30"
                            : "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
                        }`}>
                          {userProfile.isVerified ? "✅ Verified" : "⏳ Pending Verification"}
                        </span>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-white/70 mb-2">Member Since</label>
                        <p className="text-lg text-white font-medium">
                          {new Date(Number(userProfile.createdAt) * 1000).toLocaleDateString()}
                        </p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-white/70 mb-2">Wallet Address</label>
                        <p className="text-sm text-white/60 font-mono bg-white/5 px-3 py-2 rounded-lg">
                          {address}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "create" && <PoolCreation />}
          {activeTab === "pools" && <PoolList />}
        </div>
      </div>
    </div>
  );
}
