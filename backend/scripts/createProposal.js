import * as token from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import { AutocratClient } from "@metadaoproject/futarchy/v0.4";
import BN from "bn.js";
import * as fs from 'fs';
import * as path from 'path';
import { printHeader, printSection, printSuccess, printError, printInfo, printWarning } from "./utils.js";

// Get the DAO ID from the most recent DAO creation
const findLatestDaoFile = () => {
  const files = fs.readdirSync(process.cwd())
    .filter(file => file.startsWith('dao-') && file.endsWith('.json'))
    .sort((a, b) => {
      const statsA = fs.statSync(path.join(process.cwd(), a));
      const statsB = fs.statSync(path.join(process.cwd(), b));
      return statsB.mtime.getTime() - statsA.mtime.getTime(); // Sort by most recent
    });
  
  if (files.length === 0) {
    throw new Error("No DAO JSON files found. Please create a DAO first.");
  }
  
  return files[0];
};

async function main() {
  try {
    printHeader("MetaDAO Futarchy Proposal Creator");
    
    // Load the DAO information from the file
    const daoFileName = findLatestDaoFile();
    printInfo(`Loading DAO from ${daoFileName}...`);
    const daoInfo = JSON.parse(fs.readFileSync(path.join(process.cwd(), daoFileName), 'utf8'));
    
    const daoId = daoInfo.dao;
    printSuccess(`Using DAO: ${daoId}`);
    
    // Set up the provider
    const provider = anchor.AnchorProvider.env();
    const payer = provider.wallet["payer"];
    printInfo(`Using wallet: ${payer.publicKey.toString()}`);
    
    // Create Autocrat client
    printInfo("Creating Autocrat client...");
    const autocratProgram = AutocratClient.createClient({ provider });
    
    // Get the DAO from the blockchain
    printInfo("Fetching DAO from blockchain...");
    const dao = new PublicKey(daoId);
    const storedDao = await autocratProgram.getDao(dao);
    
    printSuccess("DAO Details:");
    console.log(`DAO Address: ${daoId}`);
    console.log(`Token Mint: ${storedDao.tokenMint.toString()}`);
    console.log(`USDC Mint: ${storedDao.usdcMint.toString()}`);
    console.log(`Treasury: ${storedDao.treasury.toString()}`);
    console.log(`Min Base Futarchic Liquidity: ${storedDao.minBaseFutarchicLiquidity.toString()}`);
    console.log(`Min Quote Futarchic Liquidity: ${storedDao.minQuoteFutarchicLiquidity.toString()}`);
    
    // Get the associated token account for the token mint
    printSection("Creating Proposal");
    printInfo("Setting up the token account...");
    const myTokenAccount = token.getAssociatedTokenAddressSync(
      storedDao.tokenMint,
      payer.publicKey
    );
    
    // Create a mint instruction for the proposal (this is just an example)
    printInfo("Creating an example instruction for the proposal...");
    const mintAmount = 100 * (10 ** 9); // 100 tokens with 9 decimals
    
    const mintToIx = token.createMintToInstruction(
      storedDao.tokenMint,
      myTokenAccount,
      storedDao.treasury,
      mintAmount
    );
    
    const ix = {
      programId: mintToIx.programId,
      data: mintToIx.data,
      accounts: mintToIx.keys,
    };
    
    // Ensure we have the minimum required liquidity amounts
    // The error shows we need at least 100000000 for quote amount
    const minQuoteFutarchicLiquidity = storedDao.minQuoteFutarchicLiquidity;
    const requiredQuoteLiquidity = new BN(100000000); // The error message indicates this minimum
    
    // Use the max of the two values
    const actualQuoteLiquidity = minQuoteFutarchicLiquidity.gt(requiredQuoteLiquidity)
      ? minQuoteFutarchicLiquidity
      : requiredQuoteLiquidity;
    
    // Adjust base liquidity proportionally if needed
    const minBaseFutarchicLiquidity = storedDao.minBaseFutarchicLiquidity;
    
    // If we need to increase quote liquidity, also increase base liquidity proportionally
    let actualBaseLiquidity;
    if (actualQuoteLiquidity.gt(minQuoteFutarchicLiquidity) && !minQuoteFutarchicLiquidity.isZero()) {
      const baseToQuoteRatio = minBaseFutarchicLiquidity.toNumber() / minQuoteFutarchicLiquidity.toNumber();
      actualBaseLiquidity = new BN(Math.ceil(actualQuoteLiquidity.toNumber() * baseToQuoteRatio));
    } else {
      actualBaseLiquidity = minBaseFutarchicLiquidity;
    }
    
    printInfo(`Using adjusted base liquidity: ${actualBaseLiquidity.toString()}`);
    printInfo(`Using adjusted quote liquidity: ${actualQuoteLiquidity.toString()}`);
    
    // Create the proposal
    printInfo("Initializing proposal (this may take a moment)...");
    const proposalUrl = "https://example.com/proposal-description";
    
    const proposal = await autocratProgram.initializeProposal(
      dao,
      proposalUrl,
      ix,
      actualBaseLiquidity,
      actualQuoteLiquidity
    );
    
    printSuccess(`Proposal created successfully!`);
    printSuccess(`Proposal address: ${proposal.toString()}`);
    
    // Save the proposal information
    const proposalInfo = {
      proposalAddress: proposal.toString(),
      daoAddress: daoId,
      proposalUrl,
      createdAt: new Date().toISOString()
    };
    
    const proposalFilename = `proposal-${proposal.toString().slice(0, 8)}.json`;
    fs.writeFileSync(path.join(process.cwd(), proposalFilename), JSON.stringify(proposalInfo, null, 2));
    printSuccess(`Proposal information saved to ${proposalFilename}`);
    
    printSection("Next Steps");
    console.log("1. Check the proposal details through the API:");
    console.log(`   curl http://localhost:3000/api/daos/${daoId}/proposals | jq`);
    
  } catch (error) {
    printError("Failed to create proposal", error);
    process.exit(1);
  }
}

main().catch((error) => {
  printError("Unexpected error", error);
  process.exit(1);
}); 