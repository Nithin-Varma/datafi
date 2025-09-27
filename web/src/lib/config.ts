// Contract addresses for Base Sepolia - Update these with your deployed contract addresses
export const CONTRACT_ADDRESSES = {
  USER_FACTORY: "0x26B0A220B6de85551f03f3FD846b51F7DE0512f7", // Update with your Base Sepolia address
  POOL_FACTORY: "0x28657e1A4D6d691eb36572dc78658031f37A6aF1", // Update with your Base Sepolia address
} as const;

// WalletConnect Project ID - Get from https://cloud.walletconnect.com/
export const WALLETCONNECT_PROJECT_ID = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "your_walletconnect_project_id";

// Network configuration for Base Sepolia
export const CHAIN_CONFIG = {
  chainId: 84532,
  rpcUrl: process.env.NEXT_PUBLIC_RPC_URL || "https://sepolia.base.org",
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
      {"name": "_proofRequirements", "type": "tuple[]", "components": [
        {"name": "name", "type": "string"},
        {"name": "description", "type": "string"},
        {"name": "proofType", "type": "uint8"},
        {"name": "isRequired", "type": "bool"}
      ]},
      {"name": "_pricePerData", "type": "uint256"},
      {"name": "_totalBudget", "type": "uint256"},
      {"name": "_deadline", "type": "uint256"},
      {"name": "_owner", "type": "address"}
    ],
    "name": "createPool",
    "outputs": [{"name": "", "type": "address"}],
    "stateMutability": "payable",
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
      {"name": "_proofRequirements", "type": "tuple[]", "components": [
        {"name": "name", "type": "string"},
        {"name": "description", "type": "string"},
        {"name": "proofType", "type": "uint8"},
        {"name": "isRequired", "type": "bool"}
      ]},
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
  },
  {
    "inputs": [
      {"name": "_poolAddress", "type": "address"},
      {"name": "_proofName", "type": "string"},
      {"name": "_proofHash", "type": "bytes32"}
    ],
    "name": "submitProof",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "_poolAddress", "type": "address"},
      {"name": "_proofName", "type": "string"},
      {"name": "_selfProofHash", "type": "bytes32"}
    ],
    "name": "submitSelfProof",
    "outputs": [],
    "stateMutability": "nonpayable",
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
          {"name": "proofRequirements", "type": "tuple[]", "components": [
            {"name": "name", "type": "string"},
            {"name": "description", "type": "string"},
            {"name": "proofType", "type": "uint8"},
            {"name": "isRequired", "type": "bool"}
          ]},
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
  },
  {
    "inputs": [
      {"name": "_seller", "type": "address"},
      {"name": "_verified", "type": "bool"}
    ],
    "name": "verifySeller",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "_encryptedData", "type": "string"}],
    "name": "submitData",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "_proofName", "type": "string"},
      {"name": "_proofHash", "type": "bytes32"}
    ],
    "name": "submitProof",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "_proofName", "type": "string"},
      {"name": "_selfProofHash", "type": "bytes32"}
    ],
    "name": "submitSelfProof",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getProofRequirements",
    "outputs": [
      {
        "components": [
          {"name": "name", "type": "string"},
          {"name": "description", "type": "string"},
          {"name": "proofType", "type": "uint8"},
          {"name": "isRequired", "type": "bool"}
        ],
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getJoinedSellers",
    "outputs": [{"name": "", "type": "address[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getJoinedSellersCount",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getVerifiedSellers",
    "outputs": [{"name": "", "type": "address[]"}],
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
    "inputs": [{"name": "_user", "type": "address"}],
    "name": "hasUserJoined",
    "outputs": [{"name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "_user", "type": "address"}, {"name": "_proofName", "type": "string"}],
    "name": "getUserProofStatus",
    "outputs": [{"name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const;
