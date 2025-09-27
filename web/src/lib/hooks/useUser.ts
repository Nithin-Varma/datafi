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
    functionName: "getUserContract",
    args: address ? [address] : undefined,
    query: {
      enabled: isConnected && !!address && !!userExists,
    },
  });

  // Get user profile
  const { data: userProfile } = useReadContract({
    address: userContractAddress as `0x${string}`,
    abi: USER_ABI,
    functionName: "getUserProfile",
    query: {
      enabled: !!userContractAddress,
    },
  });

  // Get total earnings
  const { data: totalEarnings } = useReadContract({
    address: userContractAddress as `0x${string}`,
    abi: USER_ABI,
    functionName: "totalEarnings",
    query: {
      enabled: !!userContractAddress,
    },
  });

  useEffect(() => {
    if (userExists && userContractAddress) {
      setUserContract(userContractAddress);
      setIsUserCreated(true);
    } else {
      setUserContract(null);
      setIsUserCreated(false);
    }
  }, [userExists, userContractAddress]);

  const createUser = useWriteContract();
  const { isLoading: isCreatingUser, isSuccess: userCreated } = useWaitForTransactionReceipt({
    hash: createUser.data?.hash,
  });

  const createUserAccount = async (name: string, email: string, age: number, country: string) => {
    if (!address) return;
    
    setIsLoading(true);
    try {
      await createUser.writeContract({
        address: CONTRACT_ADDRESSES.USER_FACTORY as `0x${string}`,
        abi: USER_FACTORY_ABI,
        functionName: "createUser",
        args: [name, email, age, country],
        value: 0n, // No fee
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
    userProfile,
    totalEarnings,
    createUserAccount,
    userCreated,
  };
}
