# DataFi - Internet Verifiable Markets

> **A decentralized data marketplace built for ETH Global Delhi hackathon that enables privacy-preserving data trading with blockchain verification.**


## 🎯 Vision

DataFi revolutionizes how data is traded in competitive markets by creating a transparent, ethical, and privacy-preserving marketplace. Instead of data breaches or unethical data collection, we enable:

- **Transparent Data Trading**: Buyers create data pools with specific requirements and budgets
- **Privacy-Preserving Verification**: Sellers verify their data meets requirements using zero-knowledge proofs
- **Automated Smart Contracts**: Handle payments and data token distribution without intermediaries
- **Decentralized Storage**: Encrypted data storage with privacy guarantees via Lighthouse (IPFS)

## 🏗️ Architecture Overview

### Smart Contract Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   UserFactory   │    │   PoolFactory   │    │  ProofOfHuman   │
│                 │    │                 │    │                 │
│ • createUser()  │    │ • createPool()  │    │ • verifyAge()   │
│ • getUser()     │    │ • joinPool()    │    │ • verifyNation()│
│ • userExists()  │    │ • verifySeller()│    │ • ZK Proofs     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│      User       │    │      Pool       │    │   Self.xyz      │
│                 │    │                 │    │   Integration   │
│ • createPool()  │    │ • joinPool()    │    │                 │
│ • joinPool()    │    │ • submitProof() │    │ • Age Verif.    │
│ • submitProof() │    │ • purchaseData()│   │ • Nationality   │
│ • trackEarnings │    │ • verifySeller()│    │ • Custom Proofs │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Frontend Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js 15 + React 19                   │
├─────────────────────────────────────────────────────────────┤
│  Components Layer                                          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │UserDashboard│ │PoolCreation │ │PoolList     │           │
│  │             │ │             │ │             │           │
│  │• User Stats │ │• Pool Config│ │• Browse     │           │
│  │• Created    │ │• Requirements│ │• Join Pools │           │
│  │• Joined     │ │• Budget Set │ │• Filter     │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
├─────────────────────────────────────────────────────────────┤
│  Web3 Integration Layer                                    │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │RainbowKit   │ │Wagmi        │ │Viem         │           │
│  │             │ │             │ │             │           │
│  │• Wallet Conn│ │• Contract   │ │• Type Safety │           │
│  │• Multi-Wallet│ │• Hooks      │ │• Low Level  │           │
│  │• UI/UX      │ │• State Mgmt │ │• Utilities   │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
├─────────────────────────────────────────────────────────────┤
│  Storage & Privacy Layer                                   │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │Lighthouse   │ │Self.xyz     │ │IPFS         │           │
│  │             │ │             │ │             │           │
│  │• Encrypted  │ │• ZK Proofs   │ │• Decentralized│        │
│  │• Privacy    │ │• Age/ID     │ │• Immutable   │           │
│  │• Access Ctrl│ │• Verification│ │• Distributed│          │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Project Structure

```
datafi/
├── 📁 contracts/                    # Smart Contracts (Foundry)
│   ├── 📁 src/                      # Source contracts
│   │   ├── 📄 User.sol             # Individual user profiles
│   │   ├── 📄 UserFactory.sol      # User creation & management
│   │   ├── 📄 Pool.sol             # Data marketplace pools
│   │   ├── 📄 PoolFactory.sol      # Pool creation & management
│   │   └── 📄 ProofOfHuman.sol     # Self.xyz integration
│   ├── 📁 script/                  # Deployment scripts
│   │   ├── 📄 DeployDataFi.s.sol   # Main deployment
│   │   └── 📄 DeployProofOfHuman.s.sol
│   ├── 📁 test/                    # Test files
│   ├── 📁 lib/                     # Dependencies
│   │   ├── 📁 forge-std/           # Foundry standard library
│   │   ├── 📁 layerzero-v2/       # LayerZero integration
│   │   └── 📁 openzeppelin-contracts/
│   ├── 📁 out/                     # Compiled contracts
│   ├── 📁 cache/                   # Foundry cache
│   ├── 📁 broadcast/               # Deployment artifacts
│   └── 📄 foundry.toml            # Foundry configuration
│
├── 📁 web/                         # Frontend (Next.js)
│   ├── 📁 src/
│   │   ├── 📁 app/                 # Next.js App Router
│   │   │   ├── 📄 page.tsx         # Landing page
│   │   │   ├── 📄 dashboard/       # User dashboard
│   │   │   ├── 📄 pools/           # Pool management
│   │   │   └── 📄 globals.css      # Global styles
│   │   ├── 📁 components/          # React components
│   │   │   ├── 📄 user-dashboard.tsx
│   │   │   ├── 📄 pool-creation.tsx
│   │   │   ├── 📄 pool-list.tsx
│   │   │   ├── 📄 pool-card.tsx
│   │   │   ├── 📄 user-registration.tsx
│   │   │   ├── 📄 wallet-connect.tsx
│   │   │   ├── 📄 verification-modal.tsx
│   │   │   └── 📁 ui/              # Reusable UI components
│   │   └── 📁 lib/                 # Utilities & hooks
│   │       ├── 📄 hooks/            # Custom React hooks
│   │       ├── 📄 config.ts        # App configuration
│   │       └── 📄 utils.ts         # Helper functions
│   ├── 📄 package.json            # Dependencies
│   ├── 📄 next.config.ts           # Next.js config
│   ├── 📄 tailwind.config.js      # Tailwind CSS config
│   └── 📄 tsconfig.json           # TypeScript config
│
└── 📄 README.md                   # This file
```

## 🔧 Smart Contracts

### Core Contracts

#### 1. **User.sol** - Individual User Management
```solidity
contract User {
    address public owner;
    address[] public createdPools;
    address[] public joinedPools;
    uint256 public totalSpent;
    uint256 public totalEarned;
    
    // Key functions:
    function createPool(...) external payable returns (address);
    function joinPool(address _poolAddress) external;
    function submitProof(...) external;
    function recordSpending(uint256 _amount) external;
    function recordEarning(uint256 _amount) external;
}
```

#### 2. **Pool.sol** - Data Marketplace Pools
```solidity
contract Pool {
    struct ProofRequirement {
        string name;
        string description;
        ProofType proofType;  // SELF_AGE, SELF_NATIONALITY, EMAIL, etc.
        bool isRequired;
    }
    
    // Key functions:
    function joinPool() external;
    function submitProof(string memory _proofName, bytes32 _proofHash) external;
    function submitSelfProof(...) external;  // Self.xyz integration
    function verifySeller(address _seller, bool _verified, bytes32 _proof) external;
    function purchaseData() external payable;
}
```

#### 3. **ProofOfHuman.sol** - Self.xyz Integration
```solidity
contract ProofOfHuman is SelfVerificationRoot {
    // Integrates with Self.xyz for:
    // - Age verification (>18 years)
    // - Nationality verification (Indian citizen)
    // - Custom proof requirements
    
    function customVerificationHook(...) internal override;
}
```

### Factory Contracts

#### **UserFactory.sol** - User Creation
- Creates individual User contracts for each wallet
- Maps wallet addresses to User contracts
- Tracks all users in the system

#### **PoolFactory.sol** - Pool Management
- Creates new data pools with specific requirements
- Manages pool lifecycle and interactions
- Handles pool discovery and joining

## 🎨 Frontend Features

### User Experience Flow

1. **🔗 Wallet Connection**
   - Multi-wallet support via RainbowKit
   - Seamless Web3 integration
   - User registration and profile creation

2. **📊 Dashboard**
   - User statistics (total spent/earned)
   - Created pools management
   - Joined pools tracking
   - Earnings history

3. **🏊 Pool Creation**
   - Define data requirements
   - Set proof requirements (age, nationality, custom)
   - Configure budget and pricing
   - Set deadlines

4. **🔍 Pool Discovery**
   - Browse available pools
   - Filter by requirements
   - Join pools as seller
   - Submit proof of requirements

5. **🔐 Verification Process**
   - Self.xyz integration for age/nationality
   - Email verification for service usage
   - Custom proof submissions
   - Zero-knowledge proof verification

6. **💰 Data Trading**
   - Automated payments via smart contracts
   - Data token distribution
   - Encrypted data storage on Lighthouse
   - Privacy-preserving data access

## 🛠️ Technology Stack

### Blockchain & Smart Contracts
- **Solidity 0.8.28** - Smart contract development
- **Foundry** - Development framework
- **OpenZeppelin** - Security libraries
- **Self.xyz** - Zero-knowledge identity verification
- **LayerZero** - Cross-chain communication

### Frontend & Web3
- **Next.js 15** - React framework with App Router
- **React 19** - Latest React features
- **TypeScript 5** - Type safety
- **Tailwind CSS 4** - Utility-first styling
- **RainbowKit** - Wallet connection UI
- **Wagmi** - React hooks for Ethereum
- **Viem** - TypeScript interface for Ethereum

### Storage & Privacy
- **Lighthouse** - Decentralized file storage
- **IPFS** - Distributed file system
- **Self.xyz** - Privacy-preserving identity verification

## 🚀 Getting Started

### Prerequisites

- **Node.js 18+**
- **Foundry** (for smart contracts)
- **pnpm** (for frontend dependencies)
- **MetaMask** or compatible Web3 wallet

### 1. Smart Contract Setup

```bash
# Navigate to contracts directory
cd contracts

# Install dependencies
forge install

# Set up environment variables
cp .env.example .env
# Add your private key and RPC URLs

# Compile contracts
forge build

# Run tests
forge test

# Deploy to testnet
forge script script/DeployDataFi.s.sol --rpc-url <RPC_URL> --broadcast --verify
```

### 2. Frontend Setup

```bash
# Navigate to web directory
cd web

# Install dependencies
pnpm install

# Update contract addresses in:
# - src/lib/hooks/useUser.ts
# - src/components/pool-creation.tsx
# - src/components/pool-list.tsx

# Start development server
pnpm dev
```

### 3. Environment Configuration

Create `.env.local` in the web directory:
```env
NEXT_PUBLIC_POOL_FACTORY_ADDRESS=0x...
NEXT_PUBLIC_USER_FACTORY_ADDRESS=0x...
NEXT_PUBLIC_PROOF_OF_HUMAN_ADDRESS=0x...
NEXT_PUBLIC_LIGHTHOUSE_API_KEY=your_lighthouse_key
```

## 🔄 Workflow

### For Data Buyers
1. **Connect Wallet** → Create user profile
2. **Create Pool** → Define requirements and budget
3. **Wait for Sellers** → Sellers join and submit proofs
4. **Verify Sellers** → Review and approve submissions
5. **Purchase Data** → Automated payments to verified sellers
6. **Access Data** → Retrieve encrypted data from Lighthouse

### For Data Sellers
1. **Connect Wallet** → Create user profile
2. **Browse Pools** → Find pools matching your data
3. **Join Pool** → Submit application to pool
4. **Submit Proofs** → Verify age, nationality, or custom requirements
5. **Get Verified** → Pool creator verifies your submissions
6. **Earn Tokens** → Receive payments for verified data

## 🔒 Privacy & Security Features

### Zero-Knowledge Proofs
- **Self.xyz Integration**: Age and nationality verification without revealing personal data
- **Custom Proofs**: Support for email verification, service usage, etc.
- **Privacy-Preserving**: Only proof validity is verified, not raw data

### Encrypted Storage
- **Lighthouse Integration**: All data encrypted before storage
- **IPFS Backend**: Decentralized and distributed storage
- **Access Control**: Smart contract-based data access permissions

### Smart Contract Security
- **Access Controls**: Role-based permissions
- **Reentrancy Protection**: Secure payment handling
- **Input Validation**: Comprehensive parameter checking
- **Event Logging**: Transparent transaction history

## 🎯 Key Features

### ✅ For Buyers
- Create data pools with specific requirements
- Set budgets and pricing per data point
- Define proof requirements (age, country, service usage)
- Purchase verified data with automatic payments
- Track spending and data acquisition

### ✅ For Sellers
- Join data pools as sellers
- Submit encrypted data to Lighthouse
- Earn tokens for verified data
- Track earnings and data sales history
- Privacy-preserving verification

### ✅ Privacy & Security
- Encrypted data storage on Lighthouse
- Zero-knowledge proof verification
- Smart contract automation
- Transparent pricing and payments
- No platform fees

## 🏆 Hackathon Achievements

- **🏗️ Complete Architecture**: Full-stack decentralized application
- **🔐 Privacy-First**: Zero-knowledge proof integration
- **⚡ Modern Tech Stack**: Latest React, Next.js, and Web3 tools
- **🎨 Beautiful UI**: Modern, responsive design with Tailwind CSS
- **🔧 Production Ready**: Comprehensive error handling and validation
- **📱 Mobile Friendly**: Responsive design for all devices

## 🤝 Contributing

This project was built for ETH Global Delhi hackathon. Feel free to fork and extend!

### Development Guidelines
- Follow Solidity best practices
- Use TypeScript for type safety
- Write comprehensive tests
- Document all functions and components
- Follow the existing code style

## 📝 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- **ETH Global Delhi** for the hackathon platform
- **Self.xyz** for zero-knowledge identity verification
- **Lighthouse** for decentralized storage
- **OpenZeppelin** for security libraries
- **RainbowKit** for wallet integration

---

**Built with ❤️ for ETH Global Delhi 2025**

*Revolutionizing data markets through blockchain technology, privacy preservation, and decentralized infrastructure.*