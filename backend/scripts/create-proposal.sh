#!/bin/bash

# Set up environment variables
export ANCHOR_PROVIDER_URL="https://api.devnet.solana.com"
export ANCHOR_WALLET="dao-keypair.json"

# Run the proposal creation script
npx tsx scripts/createProposal.js 