# Futarchy Server

A simple Express server that interfaces with the MetaDAO futarchy SDK to provide real DAO data from the Solana blockchain.

## Setup

1. Install dependencies:
```bash
pnpm install
```

2. Start the server:
```bash
npm start
```

The server will start at http://localhost:3000.

## Creating a New DAO

This project includes a script to create a new DAO on the Solana devnet:

1. Make sure you have Solana CLI installed and configured with a funded wallet
2. Set your Solana CLI config to devnet:
```bash
solana config set --url devnet
```

3. Run the DAO creation script:
```bash
npm run create-dao
```

This script will:
- Create a new META token mint
- Create a new USDC token mint
- Mint 1000 META and 200,000 USDC to your wallet
- Initialize a new DAO with these tokens
- Print out the DAO address and other relevant information

After creating a DAO, you can view it using the API endpoints described below.

## Available Endpoints

- `GET /` - Basic server health check
- `GET /status` - Server status and SDK information
- `GET /api/daos` - Retrieve all DAOs from the Solana blockchain
- `GET /api/daos/:id` - Retrieve a specific DAO by its address
- `GET /api/daos/:id/proposals` - Retrieve all proposals for a specific DAO
- `GET /api/daos/:id/proposals/:index` - Retrieve a specific proposal by its index within a DAO

## Example Responses

### Get DAO by ID

```json
{
  "success": true,
  "data": {
    "id": "Et18g32j9wabWpzBXizrpTa7mdfMSnkowvaGVk7cBvgH",
    "treasury": "3Z6Z51UDz5p7mMAzqN8VEFBcVRA2JUTgbq68fCsgrQ7c",
    "tokenMint": "H3k1zm3V4FYf4Txe6LNZJw4s5LHg8Y6D4cvu83GPk6os",
    "usdcMint": "ABizbp4pXowKQJ1pWgPeWPYDfSKwg34A7Xy1fxTu7No9",
    "proposalCount": 0,
    "passThresholdBps": 300,
    "slotsPerProposal": "648000",
    "minQuoteFutarchicLiquidity": "100000000000",
    "minBaseFutarchicLiquidity": "0"
  }
}
```

### Get DAO Proposals

```json
{
  "success": true,
  "data": []
}
```

### Proposal Not Found Example

```json
{
  "success": false,
  "error": "Proposal not found",
  "message": "DAO reports 1 proposals, but none were found on-chain. There may be a discrepancy in how proposals are tracked."
}
```

## Current State

The server has successfully connected to the Solana devnet and retrieved DAO data through the MetaDAO futarchy SDK. Here are the current statistics:

- **Total DAOs Found**: 88
- **Total Proposals Reported**: 1
- **DAOs with Proposals**: 1
- **Average Pass Threshold**: 300 basis points (3%)
- **Min Pass Threshold**: 300 basis points (3%)
- **Max Pass Threshold**: 300 basis points (3%)

One DAO reports having a proposal count of 1, but when querying the proposals endpoint, no actual proposal data is returned. This indicates a discrepancy between how proposal counts are tracked in the DAO account versus how proposals are stored on-chain.

This is likely due to one of the following reasons:
1. The DAO's proposal count may be incremented even if the proposal creation transaction failed or was reverted
2. Proposals might be stored in a different way than expected by our SDK implementation
3. The proposals may have been created but later deleted (while the count remains incremented)
4. This could be an intentional design in the devnet for testing purposes

The server handles this gracefully by returning explanatory messages when proposals are not found.

It's worth noting that all DAOs currently use the same pass threshold (300 basis points or 3%), suggesting they might have been created with the same configuration or by the same entity.

## Technologies Used

- Express.js
- @metadaoproject/futarchy (v0.4.0-alpha.58)
- @solana/web3.js
- @coral-xyz/anchor
- @solana/spl-token

## Implementation Notes

The server uses the AutocratClient from the @metadaoproject/futarchy package to connect to the Solana blockchain and fetch DAO data. It connects to the Solana devnet by default.

The key methods used are:
```javascript
// Fetch all DAOs
const daos = await autocratProgram.autocrat.account.dao.all();

// Fetch proposals for a specific DAO
const proposals = await autocratProgram.autocrat.account.proposal.all([
  {
    memcmp: {
      offset: 8, // Skip discriminator
      bytes: daoPublicKey.toBase58()
    }
  }
]);

// Create a new DAO
const dao = await autocratProgram.initializeDao(
  metaMint,
  tokenPriceUiAmount,
  minBaseFutarchicLiquidity,
  minQuoteFutarchicLiquidity,
  usdcMint,
  daoKeypair
);
```

## Configuration

By default, this server connects to the Solana devnet. You can modify the connection configuration in `controllers/daoController.js` if you need to connect to mainnet or a local network. 