# Blockchain Development Assignment

## Setup Guide

This guide explains how to set up and run the MediaVault project from scratch after retrieving it from Git.

### 1. Prerequisites

Before starting, ensure you have the following installed:

- **Node.js** (v20.x recommended) – [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn** / **pnpm** (optional)
- **Git** – [Download here](https://git-scm.com/)
- **PostgreSQL** (or access to a managed instance such as Neon, Supabase, or RDS)
- **MetaMask** or a compatible Web3 wallet (for interacting with smart contracts)

> **Note:** The project uses TypeScript, Prisma ORM, wagmi + viem for Web3, and may require IPFS or S3 credentials for media storage.

### 2. Clone the Repository

```bash
git clone <your-repo-url> MediaVault
cd MediaVault
```

### 3. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 4. Environment Variables (CHANGE)

Create a .env file in the root of the project:

```bash
# bash
cp .env
# cmd/ps
cd . > .env
```

Then edit .env with your credentials:

| Variable                               | Description                                                     |
| -------------------------------------- | --------------------------------------------------------------- |
| `NODE_ENV`                             | Environment mode (`development`, `production`, or `test`).      |
| `NEXT_PUBLIC_PROJECT_ID`               | Public project ID (e.g., WalletConnect or app identifier).      |
| `NEXT_PUBLIC_SEPOLIA_CONTRACT_ADDRESS` | Deployed NFT smart contract address on Sepolia network.         |
| `NEXT_PUBLIC_WEB_URI`                  | Public web application base URL (used in callbacks, redirects). |
| `CRYPTO_ENCRYPTION_KEY`                | Secret key used for encrypting/decrypting sensitive data.       |
| `PINATA_API_KEY`                       | Pinata API key for IPFS uploads.                                |
| `PINATA_API_SECRET`                    | Pinata API secret for IPFS uploads.                             |
| `PINATA_JWT`                           | Pinata JSON Web Token for authentication.                       |
| `PINATA_GROUP_ID`                      | Pinata group ID to organize uploaded files.                     |
| `NEXT_PUBLIC_GATEWAY_URL`              | IPFS gateway base URL for retrieving uploaded content.          |
| `DATABASE_URL`                         | PostgreSQL connection string for Prisma.                        |

### 5. Database Setup

Run the Prisma migrations to set up the database schema:

```bash
npx prisma migrate deploy
# or if setting up for development:
npx prisma migrate dev
```

Generate the Prisma client:

```bash
npx prisma generate
```

### 6. Smart Contract Setup

#### 6.1. Prerequisites

- [Node.js](https://nodejs.org/) and npm installed.
- [Hardhat](https://hardhat.org/) installed globally or locally in the blockchain project directory.
- An Ethereum wallet private key with funds on your chosen testnet (e.g., Sepolia).
- An [Alchemy](https://www.alchemy.com/) (or equivalent) RPC URL for your target network.

---

#### 6.2. Environment Variables

In your blockchain project’s `.env` file, define:

```env
ALCHEMY_API_KEY=your_alchemy_api_key
ALCHEMY_URI=https://eth-sepolia.g.alchemy.com/v2/your_api_key
PRIVATE_KEY=your_wallet_private_key
```

These variables are used by Hardhat for deployment.

Your frontend will also require:

```env
NEXT_PUBLIC_SEPOLIA_CONTRACT_ADDRESS=deployed_contract_address
```

---

#### 6.3. Deployment

1. Compile the contract:

   ```bash
   npx hardhat compile
   ```

2. Deploy to Sepolia (or another network):

   ```bash
   npx hardhat run scripts/deploy-sepolia.js --network sepolia
   ```

3. Note the deployed address printed in the console.

4. (Optional) Save address for frontend use
   If using deploy.js, the address will be written to:

```bash
blockchain-frontend/src/contracts/contract-address.json
```

### 7. Running the Development Server

```bash
npm run dev
```

The app will be available at: http://localhost:3000

### 8. Additional Commands

```bash
# Check Prisma Studio (Database GUI)
npx prisma studio

# Lint Code
npm run lint

# Format Code
npm run format
```

## Tasks

- Create page to upload media files (audio, video, & image files) - Rion 🔨
- Create React component that tracks wallet information (MetaMask) - Jaedon ✅
- Mint NFT with uploaded media files - Hou Jin 🔨
- Do research and adjust smart contract implementation to work as NFT (mint, ownership, etc) - Jaedon 🔨
- Create page to browse user media -

## Git Workflow

```bash
# 1. Start on up-to-date main
git checkout main
git pull origin main

# 2. Create a new branch for your feature
git checkout -b feature/login-form

# 3. Work locally, stage, and commit
git add .
git commit -m "Implement login form UI"

# 4. Push the feature branch
git push -u origin feature/login-form

# 5. Open a Pull Request (on GitHub)
#    - Describe changes
#    - Link issues if any (#42)
#    - Assign reviewers

# 6. Address feedback, commit more if needed
git commit -m "Apply feedback: improved error handling"
git push

# 7. Once approved, PR is merged by owner
#    (Optionally squash and merge)

# 8. Sync with main after merge
git checkout main
git pull origin main
```

## Useful Terminal Commands

```bash
# Create postgres docker container (not required)
docker run --name local-mediavault-db -e POSTGRES_USER=localuser -e POSTGRES_PASSWORD=localpass -e POSTGRES_DB=localdb -p 5432:5432 -d postgres

# Generate prisma schema (Get rid of typescript errors)
npx prisma generate

## Database schema modelling
# Use to push new changes early in development
npx prisma db push
# OR
# Prisma migrate once db is defined properly
npx prisma migrate dev --name <name-of-migration>

# View database via prisma UI
npx prisma studio

```

## Important Hooks

- `useAppKitContext()`: **Wallet Context Provider** - Provides control over the wallet
- `useMediaContract()`: **Media Contract Context Provider** - Provides access to smart contract functions (WIP)

## IPFS

You may interact with the IPFS server using next.js server actions located here in this project: [./src/actions/pinata.ts](./src/actions/pinata.ts). Use the SDK to build your own functions if necessary

Materials: [Docs](https://docs.pinata.cloud/quickstart), [SDK Guideline](https://docs.pinata.cloud/sdk/getting-started)

## Run with Smart Contract

1. Open new VSCode and open smart_contract project **OR** cd o smart_contract project via terminal

2. In smart contract project, execute these:

```bash
# Open 2 Terminals
# In Terminal 1 (do not close this terminal):
npm run node

# In Terminal 2:
npm run deploy
```

3. Use **Reown AppKit** [hooks](https://docs.reown.com/appkit/next/core/hooks#hooks)/[components](https://docs.reown.com/appkit/next/core/components) to build components that interact with wallet ✅

4. Use **Wagmi** [actions](https://wagmi.sh/core/api/actions) to build components that interact with smart contract

## Features

### Smart Contract

1. Write Functions
   - `listForSale()` - List NFT for sale
   - `unlistFromSale()` - Remove from marketplace
   - `buyNFT()` - Purchase NFT with automatic royalty distribution
   - `mintNFT()` - Now accepts minting fee and initial sale price

2. Read Functions
   - `useSaleInfo()` - Get complete marketplace data for an NFT
   - `useMintingFee()` - Get current platform minting fee
   - `usePlatformRoyalty()` - Get platform royalty percentage

3. Event Watchers
   - `useWatchMediaListed()` - Track when NFTs are listed
   - `useWatchMediaSold()` - Track marketplace sales

4. Helper Functions
   - `convertPercentToBasisPoints()` - Convert frontend % to contract basis points
   - `convertBasisPointsToPercent()` - Convert basis points back to %

## Libraries Used

- shadcn (Use --legacy-peer-deps for installing shadcn components)
- zod
- zustand (avoid redux pls)
- prisma
- @tanstack/react-query

## Tech Stack

- Backend: Next.js Server Actions(?)
- Database: Postgres (Neon)

## Prettier Guide

1. Install the Prettier extension in VSCode
2. Open VS Code Command Palette (Ctrl+Shift+P)
3. Type "settings" and select "Preferences: Open User Settings (JSON)"
4. Add these settings to your settings.json:

```json
{
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[json]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

## Additional VSCode JSON Settings:

General Settings

```json
{
  "editor.tabSize": 2,
  "editor.formatOneSave": true
}
```

For Prisma file formatting

```json
{
  "[prisma]": {
    "editor.defaultFormatter": "Prisma.prisma"
  }
}
```
