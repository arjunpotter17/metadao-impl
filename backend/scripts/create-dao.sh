#!/bin/bash

# Set up environment variables
export ANCHOR_PROVIDER_URL="https://api.devnet.solana.com"
export ANCHOR_WALLET="dao-keypair.json"

# Run the DAO creation script
npx tsx scripts/createV04DAO.ts 