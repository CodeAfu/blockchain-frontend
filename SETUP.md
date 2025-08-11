# MediaVault – Project Setup Guide

This guide explains how to set up and run the MediaVault project from scratch after retrieving it from Git.

## 1. Prerequisites

Before starting, ensure you have the following installed:

- **Node.js** (v20.x recommended) – [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn** / **pnpm** (optional)
- **Git** – [Download here](https://git-scm.com/)
- **PostgreSQL** (or access to a managed instance such as Neon, Supabase, or RDS)
- **MetaMask** or a compatible Web3 wallet (for interacting with smart contracts)

> **Note:** The project uses TypeScript, Prisma ORM, wagmi + viem for Web3, and may require IPFS or S3 credentials for media storage.

## 2. Clone the Repository

```bash
git clone <your-repo-url> MediaVault
cd MediaVault
```

## 3. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

## 4. Environment Variables (CHANGE)

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

## 5. Database Setup

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

## 6. Smart Contract Setup

### 6.1. Prerequisites

- [Node.js](https://nodejs.org/) and npm installed.
- [Hardhat](https://hardhat.org/) installed globally or locally in the blockchain project directory.
- An Ethereum wallet private key with funds on your chosen testnet (e.g., Sepolia).
- An [Alchemy](https://www.alchemy.com/) (or equivalent) RPC URL for your target network.

---

### 6.2. Environment Variables

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

### 6.3. Deployment

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

## 7. Running the Development Server

```bash
npm run dev
```

The app will be available at:

```bash
http://localhost:3000
```

## 8. Additional Commands

```bash
# Check Prisma Studio (Database GUI)
npx prisma studio

# Lint Code
npm run lint

# Format Code
npm run format
```
