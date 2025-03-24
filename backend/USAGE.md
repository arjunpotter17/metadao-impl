# MetaDAO Futarchy SDK Usage Guide

This guide provides instructions on how to use the Futarchy SDK integration to view existing DAOs and create new ones.

## Prerequisites

1. Node.js (v16 or higher)
2. Solana CLI tools
3. A Solana wallet with some SOL for transaction fees (on devnet)

## Setup

1. Clone the repository and install dependencies:

```bash
git clone <repository-url>
cd matadao
npm install
```

2. Configure your Solana CLI for devnet:

```bash
solana config set --url devnet
```

3. Make sure your wallet is funded with devnet SOL:

```bash
solana balance
```

If needed, get some devnet SOL:

```bash
solana airdrop 2
```

## Viewing DAOs

1. Start the server:

```bash
npm start
```

2. Use curl or a browser to access the API endpoints:

```bash
# Get all DAOs
curl http://localhost:3000/api/daos | jq

# Get a specific DAO by ID
curl http://localhost:3000/api/daos/Hv7b7Kw2Xy7fGZZ8qWiciwfivay2hARmY7qC9HH4qWuS | jq

# Get server status
curl http://localhost:3000/status | jq
```

## Creating a New DAO

The project includes a TypeScript script that makes it easy to create a new DAO with all necessary tokens and accounts:

```bash
npm run create-dao
```

This script will:

1. Create a new META token mint (9 decimals)
2. Create a new USDC token mint (6 decimals)
3. Create associated token accounts for your wallet
4. Mint 1000 META and 200,000 USDC to your wallet
5. Initialize a new DAO with these token mints
6. Save all the information about your DAO to a JSON file

After running the script, you'll see output with all the relevant addresses and next steps.

## DAO Information

The script saves important DAO information to a JSON file (named `dao-XXXXXXXX.json` where XXXXXXXX is the first 8 characters of your DAO address). This file contains:

- DAO address
- DAO keypair (public and secret keys)
- Token mint addresses (META and USDC)
- Token account addresses
- DAO parameters
- Creation timestamp and network endpoint

Keep this file secure as it contains your DAO's keypair.

## Viewing Your New DAO

After creating a DAO, you can view it using the API:

```bash
# Replace YOUR_DAO_ADDRESS with your actual DAO address
curl http://localhost:3000/api/daos/YOUR_DAO_ADDRESS | jq
```

## Troubleshooting

- **Connection Issues**: Make sure your Solana CLI is configured for devnet with `solana config get`
- **Transaction Failures**: Ensure you have enough SOL in your wallet for transaction fees
- **DAO Not Found**: After creating a DAO, it may take a few seconds to become visible in the API
- **Script Errors**: Make sure you have the latest dependencies installed with `npm install`

## Advanced Usage

For more advanced operations like creating proposals or voting, you'll need to use the Futarchy SDK directly. Refer to the [MetaDAO Futarchy SDK documentation](https://github.com/metaDAOproject/futarchy-sdk) for more details.

## Development

To modify the DAO creation script or add more functionality:

1. Edit the `scripts/createV04DAO.ts` file
2. Use the utility functions in `scripts/utils.ts` for consistent formatting
3. Run the script with `npm run create-dao`
4. Check the server responses to ensure your changes work as expected 