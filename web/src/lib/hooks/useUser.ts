"use client";

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useState, useEffect } from "react";
import { CONTRACT_ADDRESSES, USER_FACTORY_ABI, USER_ABI } from "../config";


export function useUser() {
  const { address, isConnected } = useAccount();
  const [userContract, setUserContract] = useState<string | null>(null);
  const [isUserCreated, setIsUserCreated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check if user exists
  const { data: userExists } = useReadContract({
    address: CONTRACT_ADDRESSES.USER_FACTORY as `0x${string}`,
    abi: USER_FACTORY_ABI,
    functionName: "userExists",
    args: address ? [address] : undefined,
    query: {
      enabled: isConnected && !!address,
    },
  });

  // Get user contract address
  const { data: userContractAddress } = useReadContract({
    address: CONTRACT_ADDRESSES.USER_FACTORY as `0x${string}`,
    abi: USER_FACTORY_ABI,
    functionName: "getUser",
    args: address ? [address] : undefined,
    query: {
      enabled: isConnected && !!address && !!userExists,
    },
  });

  // Get user stats
  const { data: totalSpent } = useReadContract({
    address: userContractAddress as `0x${string}`,
    abi: USER_ABI,
    functionName: "getTotalSpent",
    query: {
      enabled: !!userContractAddress,
    },
  });

  const { data: totalEarned } = useReadContract({
    address: userContractAddress as `0x${string}`,
    abi: USER_ABI,
    functionName: "getTotalEarned",
    query: {
      enabled: !!userContractAddress,
    },
  });

  const { data: createdPoolsCount } = useReadContract({
    address: userContractAddress as `0x${string}`,
    abi: USER_ABI,
    functionName: "getCreatedPoolsCount",
    query: {
      enabled: !!userContractAddress,
    },
  });

  const { data: joinedPoolsCount } = useReadContract({
    address: userContractAddress as `0x${string}`,
    abi: USER_ABI,
    functionName: "getJoinedPoolsCount",
    query: {
      enabled: !!userContractAddress,
    },
  });

  useEffect(() => {
    console.log("User hook debug:", { userExists, userContractAddress, address });
    if (userExists && userContractAddress) {
      setUserContract(userContractAddress);
      setIsUserCreated(true);
    } else {
      setUserContract(null);
      setIsUserCreated(false);
    }
  }, [userExists, userContractAddress, address]);

  const createUser = useWriteContract();
  const { isLoading: isCreatingUser, isSuccess: userCreated } = useWaitForTransactionReceipt({
    hash: createUser.data,
  });

  // Refresh data when user is created
  useEffect(() => {
    if (userCreated) {
      console.log("User created, refreshing data...");
      // Add a small delay to prevent rapid re-renders
      setTimeout(() => {
        // The data will be refetched automatically by the hooks
      }, 1000);
    }
  }, [userCreated]);

  const createUserAccount = async () => {
    if (!address) return;
    
    setIsLoading(true);
    try {
      await createUser.writeContract({
        address: CONTRACT_ADDRESSES.USER_FACTORY as `0x${string}`,
        abi: USER_FACTORY_ABI,
        functionName: "createUser",
        args: [],
        value: BigInt(0), // No fee
      });
    } catch (error) {
      console.error("Error creating user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    address,
    isConnected,
    userContract,
    isUserCreated,
    isLoading: isLoading || isCreatingUser,
    totalSpent,
    totalEarned,
    createdPoolsCount,
    joinedPoolsCount,
    createUserAccount,
    userCreated,
    // Add user addresses for display
    userEOA: address,
    userContractAddress: userContract,
  };
}
