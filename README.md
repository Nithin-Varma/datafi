# DataFi

A decentralized data finance platform built with Foundry smart contracts and Next.js frontend.

## Project Structure

```
datafi/
├── contracts/          # Foundry smart contracts
│   ├── src/           # Contract source files
│   ├── test/          # Contract tests
│   ├── script/         # Deployment scripts
│   └── foundry.toml    # Foundry configuration
└── web/               # Next.js frontend
    ├── src/           # Source code
    ├── public/        # Static assets
    └── package.json   # Dependencies
```

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- Foundry (for smart contracts)
- Git

### Smart Contracts (Foundry)

```bash
cd contracts

# Install dependencies
forge install

# Build contracts
forge build

# Run tests
forge test

# Deploy (example)
forge script script/Counter.s.sol:CounterScript --rpc-url <RPC_URL> --private-key <PRIVATE_KEY> --broadcast
```

### Frontend (Next.js)

```bash
cd web

# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

## Tech Stack

### Smart Contracts
- **Foundry**: Development framework
- **Solidity**: Smart contract language

### Frontend
- **Next.js 15**: React framework with App Router
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling
- **shadcn/ui**: UI components
- **Rainbow Kit**: Wallet connection
- **Wagmi**: Ethereum interaction
- **Viem**: Ethereum library

## Features

- 🔗 Wallet connection with Rainbow Kit
- 🎨 Modern UI with shadcn/ui components
- 📱 Responsive design with Tailwind CSS
- ⚡ TypeScript for type safety
- 🔧 Hot reloading for development

## Development

1. Clone the repository
2. Install dependencies in both `contracts/` and `web/` directories
3. Start the development servers
4. Connect your wallet to test the application

## License

MIT

