// Contract addresses - Update these with your deployed contract addresses
export const CONTRACT_ADDRESSES = {
  USER_FACTORY: "0x2c80D5845BC9Cee02Bf3eA82cD1A0Ec1e5FF3dbd",
  POOL_FACTORY: "0x04B9aea3a6Df96B36756ef23FaFd7123F788770d",
} as const;

// WalletConnect Project ID - Get from https://cloud.walletconnect.com/
export const WALLETCONNECT_PROJECT_ID = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "your_walletconnect_project_id";

// Network configuration
export const CHAIN_CONFIG = {
  chainId: 11155111,
  rpcUrl: process.env.NEXT_PUBLIC_RPC_URL || "https://sepolia.infura.io/v3/your_project_id",
} as const;

// Contract ABIs for new simplified contracts
export const USER_FACTORY_ABI = [
  {
    "inputs": [{"name": "_wallet", "type": "address"}],
    "name": "getUser",
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
    "inputs": [],
    "name": "createUser",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllUsers",
    "outputs": [{"name": "", "type": "address[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTotalUsers",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
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
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "_poolAddress", "type": "address"}],
    "name": "joinPool",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllPools",
    "outputs": [{"name": "", "type": "address[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "_creator", "type": "address"}],
    "name": "getCreatorPools",
    "outputs": [{"name": "", "type": "address[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTotalPools",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getActivePools",
    "outputs": [{"name": "", "type": "address[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "_dataType", "type": "string"}],
    "name": "getPoolsByDataType",
    "outputs": [{"name": "", "type": "address[]"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

export const USER_ABI = [
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
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "_poolAddress", "type": "address"}],
    "name": "joinPool",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getCreatedPools",
    "outputs": [{"name": "", "type": "address[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getJoinedPools",
    "outputs": [{"name": "", "type": "address[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getCreatedPoolsCount",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getJoinedPoolsCount",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTotalSpent",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTotalEarned",
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
    "name": "getSellersCount",
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
  },
  {
    "inputs": [],
    "name": "joinPool",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "purchaseData",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  }
] as const;
