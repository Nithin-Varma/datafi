// Contract addresses - Update these with your deployed contract addresses
export const CONTRACT_ADDRESSES = {
  USER_FACTORY: "0x073D631FE0DfEE026215F4b2063574Ab9f9962Cf",
  POOL_FACTORY: "0x7CE696069e7081A7C1D4a0a7e5050A336dFC545b",
} as const;

// WalletConnect Project ID - Get from https://cloud.walletconnect.com/
export const WALLETCONNECT_PROJECT_ID = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "your_walletconnect_project_id";

// Network configuration
export const CHAIN_CONFIG = {
  chainId: 11155111, // Sepolia testnet
  rpcUrl: process.env.NEXT_PUBLIC_RPC_URL || "https://sepolia.infura.io/v3/your_project_id",
} as const;

// Contract ABIs (simplified for demo)
export const USER_FACTORY_ABI = [
  {
    "inputs": [{"name": "_wallet", "type": "address"}],
    "name": "getUserContract",
    "outputs": [{"name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "_wallet", "type": "address"}],
    "name": "userExists",
    "outputs": [{"name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "_name", "type": "string"},
      {"name": "_email", "type": "string"},
      {"name": "_age", "type": "uint256"},
      {"name": "_country", "type": "string"}
    ],
    "name": "createUser",
    "outputs": [{"name": "", "type": "address"}],
    "stateMutability": "payable",
    "type": "function"
  }
] as const;

export const POOL_FACTORY_ABI = [
  {
    "inputs": [
      {"name": "_name", "type": "string"},
      {"name": "_description", "type": "string"},
      {"name": "_dataType", "type": "string"},
      {"name": "_pricePerData", "type": "uint256"},
      {"name": "_totalBudget", "type": "uint256"},
      {"name": "_deadline", "type": "uint256"}
    ],
    "name": "createPool",
    "outputs": [{"name": "", "type": "address"}],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllPools",
    "outputs": [{"name": "", "type": "address[]"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

export const USER_ABI = [
  {
    "inputs": [],
    "name": "getUserProfile",
    "outputs": [
      {
        "components": [
          {"name": "name", "type": "string"},
          {"name": "email", "type": "string"},
          {"name": "age", "type": "uint256"},
          {"name": "country", "type": "string"},
          {"name": "isVerified", "type": "bool"},
          {"name": "createdAt", "type": "uint256"},
          {"name": "lastActiveAt", "type": "uint256"}
        ],
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalEarnings",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

export const POOL_ABI = [
  {
    "inputs": [],
    "name": "getPoolInfo",
    "outputs": [
      {
        "components": [
          {"name": "name", "type": "string"},
          {"name": "description", "type": "string"},
          {"name": "dataType", "type": "string"},
          {"name": "pricePerData", "type": "uint256"},
          {"name": "totalBudget", "type": "uint256"},
          {"name": "remainingBudget", "type": "uint256"},
          {"name": "creator", "type": "address"},
          {"name": "isActive", "type": "bool"},
          {"name": "createdAt", "type": "uint256"},
          {"name": "deadline", "type": "uint256"}
        ],
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getVerifiedSellersCount",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getSellers",
    "outputs": [{"name": "", "type": "address[]"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const;
