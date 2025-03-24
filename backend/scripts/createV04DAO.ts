import * as anchor from "@coral-xyz/anchor";
import { Keypair, PublicKey, Connection, clusterApiUrl } from "@solana/web3.js";
import { AutocratClient } from "@metadaoproject/futarchy/v0.4";
import * as token from "@solana/spl-token";
import { printHeader, printSection, printSuccess, printError, printInfo, printWarning } from "./utils.js";
import fs from 'fs';
import path from 'path';

async function main() {
  try {
    printHeader("MetaDAO Futarchy DAO Creator");
    printInfo("This script will create a new DAO on the Solana devnet");
    
    // Check if Solana is set to devnet
    const provider = anchor.AnchorProvider.env();
    const endpoint = provider.connection.rpcEndpoint;
    
    if (!endpoint.includes('devnet')) {
      printWarning("You appear to be connected to " + endpoint);
      printWarning("This script is designed to work with Solana devnet.");
      printInfo("To set your Solana config to devnet, run: solana config set --url devnet");
      printInfo("Continuing anyway, but be careful...");
    }
    
    printSection("Creating Token Mints");
    
    const payer = provider.wallet["payer"];
    if(!payer) {
      printError("No payer found");
      process.exit(1);
    }
    printInfo(`Using wallet: ${payer.publicKey.toString()}`);
    
    // Create META token mint
    printInfo("Creating META token mint...");
    const metaMint = await token.createMint(
      provider.connection,
      payer,
      payer.publicKey, // mint authority
      payer.publicKey, // freeze authority
      9 // 9 decimals like in tests
    );
    printSuccess(`Created META mint: ${metaMint.toString()}`);

    // Create USDC mint
    printInfo("Creating USDC token mint...");
    const usdcMint = await token.createMint(
      provider.connection,
      payer,
      payer.publicKey,
      payer.publicKey,
      6 // 6 decimals for USDC
    );
    printSuccess(`Created USDC mint: ${usdcMint.toString()}`);

    printSection("Creating Token Accounts");
    
    // Create token accounts for the payer
    printInfo("Creating META token account...");
    const metaAccount = await token.createAssociatedTokenAccount(
      provider.connection,
      payer,
      metaMint,
      payer.publicKey
    );
    printSuccess(`Created META account: ${metaAccount.toString()}`);

    printInfo("Creating USDC token account...");
    const usdcAccount = await token.createAssociatedTokenAccount(
      provider.connection,
      payer,
      usdcMint,
      payer.publicKey
    );
    printSuccess(`Created USDC account: ${usdcAccount.toString()}`);

    printSection("Minting Initial Tokens");
    
    // Mint initial tokens to the payer
    printInfo("Minting META tokens...");
    await token.mintTo(
      provider.connection,
      payer,
      metaMint,
      metaAccount,
      payer,
      1000n * 1_000_000_000n // 1000 META with 9 decimals
    );
    printSuccess("Minted 1000 META tokens to your wallet");

    printInfo("Minting USDC tokens...");
    await token.mintTo(
      provider.connection,
      payer,
      usdcMint,
      usdcAccount,
      payer,
      200_000n * 1_000_000n // 200,000 USDC with 6 decimals (like in tests)
    );
    printSuccess("Minted 200,000 USDC tokens to your wallet");

    printSection("Initializing DAO");
    
    // Initialize the DAO
    printInfo("Setting up DAO parameters...");
    const tokenPriceUiAmount = 1.0; // Initial token price in USDC
    const minBaseFutarchicLiquidity = 5; // Lower minimum requirement (5 META)
    const minQuoteFutarchicLiquidity = 5; // Lower minimum requirement (5 USDC)
    const daoKeypair = Keypair.generate();
    
    printInfo("Creating Autocrat client...");
    const autocratProgram = AutocratClient.createClient({ provider });

    printInfo("Initializing DAO on-chain (this may take a moment)...");
    const dao = await autocratProgram.initializeDao(
      metaMint,
      tokenPriceUiAmount,
      minBaseFutarchicLiquidity,
      minQuoteFutarchicLiquidity,
      usdcMint,
      daoKeypair
    );

    printSuccess(`DAO created successfully!`);
    printSuccess(`DAO address: ${dao.toString()}`);
    
    // Save DAO info to a file
    const daoInfo = {
      dao: dao.toString(),
      daoKeypair: {
        publicKey: daoKeypair.publicKey.toString(),
        secretKey: Array.from(daoKeypair.secretKey)
      },
      metaMint: metaMint.toString(),
      usdcMint: usdcMint.toString(),
      metaAccount: metaAccount.toString(),
      usdcAccount: usdcAccount.toString(),
      tokenPriceUiAmount,
      minBaseFutarchicLiquidity,
      minQuoteFutarchicLiquidity,
      createdAt: new Date().toISOString(),
      endpoint
    };
    
    const filename = `dao-${dao.toString().slice(0, 8)}.json`;
    fs.writeFileSync(path.join(process.cwd(), filename), JSON.stringify(daoInfo, null, 2));
    printSuccess(`DAO information saved to ${filename}`);

    printSection("DAO Details");
    console.log(`DAO Address:                 ${dao.toString()}`);
    console.log(`DAO Keypair Public Key:      ${daoKeypair.publicKey.toString()}`);
    console.log(`META Token Mint:             ${metaMint.toString()}`);
    console.log(`USDC Token Mint:             ${usdcMint.toString()}`);
    console.log(`Initial Token Price:         ${tokenPriceUiAmount} USDC`);
    console.log(`Min Base Futarchic Liquidity: ${minBaseFutarchicLiquidity} META`);
    console.log(`Min Quote Futarchic Liquidity: ${minQuoteFutarchicLiquidity} USDC`);
    
    printSection("Next Steps");
    console.log("1. Start the futarchy server if not already running:");
    console.log("   npm start");
    console.log("");
    console.log("2. Verify your DAO was created by querying the API:");
    console.log(`   curl http://localhost:3000/api/daos/${dao.toString()} | jq`);
    
  } catch (error) {
    printError("Failed to create DAO", error);
    process.exit(1);
  }
}

main().catch((error) => {
  printError("Unexpected error", error);
  process.exit(1);
}); 