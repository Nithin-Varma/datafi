"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useUser } from "@/lib/hooks/useUser";

export function UserRegistration() {
  const { createUserAccount, isLoading } = useUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createUserAccount();
  };

  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-lg">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <span className="text-3xl">👤</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Join DataFi
          </h2>
          <p className="text-gray-600">
            Create your account and start trading data
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="text-center py-8">
            <p className="text-gray-600 mb-6">
              Click the button below to create your DataFi account. No personal information required!
            </p>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/20 border-t-white"></div>
                <span>Creating Account...</span>
              </div>
            ) : (
              "Create Account"
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm">
            ✨ Free to create • 🔒 Secure • 🚀 Instant
          </p>
        </div>
      </div>
    </div>
  );
}
