# DataFi - Internet Verifiable Markets

A decentralized data marketplace built for ETH Global Delhi hackathon that enables privacy-preserving data trading with blockchain verification.

## 🚀 Concept

DataFi solves the problem of ethical data acquisition in competitive markets. Instead of data breaches or unethical data collection, we create a transparent marketplace where:

1. **Buyers** create data pools with specific requirements and budgets
2. **Sellers** verify their data meets the requirements and submit encrypted data
3. **Smart contracts** handle payments and data token distribution
4. **Lighthouse** stores encrypted data with privacy guarantees

## 🏗️ Architecture

### Smart Contracts

- **User.sol**: Individual user profiles and data selling history
- **UserFactory.sol**: Manages user creation and wallet-to-contract mapping
- **Pool.sol**: Data marketplace pools with proof requirements
- **PoolFactory.sol**: Pool creation and management
- **DataToken.sol**: Encrypted data ownership tokens

### Frontend

- **Next.js** with TypeScript
- **RainbowKit** for wallet connection
- **Tailwind CSS** for styling
- **Wagmi** for blockchain interactions

## 🛠️ Setup

### Prerequisites

- Node.js 18+
- Foundry
- pnpm

### Contract Deployment

1. Install dependencies:
```bash
cd contracts
forge install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Add your private key and RPC URLs
```

3. Deploy contracts:
```bash
forge script script/DeployDataFi.s.sol --rpc-url <RPC_URL> --broadcast --verify
```

### Frontend Setup

1. Install dependencies:
```bash
cd web
pnpm install
```

2. Update contract addresses in:
   - `src/lib/hooks/useUser.ts`
   - `src/components/pool-creation.tsx`
   - `src/components/pool-list.tsx`

3. Start development server:
```bash
pnpm dev
```

## 🎯 Features

### For Buyers
- Create data pools with specific requirements
- Set budgets and pricing per data point
- Define proof requirements (age, country, service usage)
- Purchase verified data with automatic payments

### For Sellers
- Join data pools as sellers
- Submit encrypted data to Lighthouse
- Earn tokens for verified data
- Track earnings and data sales history

### Privacy & Security
- Encrypted data storage on Lighthouse
- Zero-knowledge proof verification
- Smart contract automation
- Transparent pricing and payments

## 🔄 Workflow

1. **User Registration**: Connect wallet → Create user contract → Set up profile
2. **Pool Creation**: Define requirements → Set budget → Launch pool
3. **Data Submission**: Sellers join → Verify requirements → Submit encrypted data
4. **Data Verification**: Pool creator verifies submissions
5. **Data Purchase**: Buyers purchase → Automatic payments → Data token transfer
6. **Data Access**: Burn tokens → Reveal encrypted data

## 🚀 Getting Started

1. **Connect Wallet**: Use MetaMask or any Web3 wallet
2. **Create Account**: Register with basic profile information
3. **Create Pool**: Define your data requirements and budget
4. **Browse Pools**: Find pools to join as a seller
5. **Submit Data**: Upload encrypted data to Lighthouse
6. **Earn Tokens**: Get paid for verified data submissions

## 🏆 Hackathon Features

- **Privacy-Preserving**: All data encrypted before storage
- **Transparent**: All transactions on blockchain
- **Automated**: Smart contracts handle payments
- **Scalable**: Factory pattern for unlimited pools
- **User-Friendly**: Modern React frontend

## 🔧 Technical Stack

- **Blockchain**: Ethereum/Sepolia
- **Smart Contracts**: Solidity 0.8.13
- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Wallet**: RainbowKit, Wagmi
- **Storage**: Lighthouse (IPFS)
- **Testing**: Foundry

## 📝 License

MIT License - see LICENSE file for details

## 🤝 Contributing

This project was built for ETH Global Delhi hackathon. Feel free to fork and extend!

---

**Built with ❤️ for ETH Global Delhi 2024**