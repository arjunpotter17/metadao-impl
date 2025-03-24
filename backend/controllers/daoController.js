import { Connection, clusterApiUrl, Keypair, PublicKey } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';
import { AutocratClient } from '@metadaoproject/futarchy/v0.4';
import * as token from '@solana/spl-token';
import { prisma } from '../lib/prisma.js';

// Setup Solana connection
const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

// Create a keypair for the client (needed for read-only operations)
const dummyKeypair = Keypair.generate();

// Create an AnchorProvider with the connection and wallet
const provider = new anchor.AnchorProvider(
  connection,
  {
    publicKey: dummyKeypair.publicKey,
    signTransaction: async (tx) => tx,
    signAllTransactions: async (txs) => txs,
    payer: dummyKeypair,
  },
  { commitment: 'confirmed' }
);

// Initialize the autocrat program client
const autocratProgram = AutocratClient.createClient({ provider });

// Controller methods
const daoController = {
  /**
   * Get all DAOs
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getAllDaos: async (req, res) => {
    try {
      // Use the correct method to fetch all DAOs
      const daos = await autocratProgram.autocrat.account.dao.all();
      
      // Format the response
      const formattedDaos = daos.map(dao => ({
        id: dao.publicKey.toString(),
        treasury: dao.account.treasury.toString(),
        tokenMint: dao.account.tokenMint.toString(),
        usdcMint: dao.account.usdcMint.toString(),
        proposalCount: dao.account.proposalCount,
        passThresholdBps: dao.account.passThresholdBps,
        slotsPerProposal: dao.account.slotsPerProposal.toString(),
        minQuoteFutarchicLiquidity: dao.account.minQuoteFutarchicLiquidity.toString(),
        minBaseFutarchicLiquidity: dao.account.minBaseFutarchicLiquidity.toString()
      }));
      
      res.json({
        success: true,
        data: formattedDaos
      });
    } catch (error) {
      console.error('Error fetching DAOs:', error);
      res.status(500).json({ error: 'Failed to fetch DAOs' });
    }
  },

  /**
   * Get a single DAO by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getDaoById: async (req, res) => {
    try {
      const { id } = req.params;
      const dao = await prisma.dao.findUnique({
        where: { id },
      });
      if (!dao) {
        return res.status(404).json({ error: 'DAO not found' });
      }
      res.json(dao);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch DAO' });
    }
  },

  /**
   * Create a new DAO
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  createDao: async (req, res) => {
    try {
      console.log('Provider', provider.publicKey.toBase58());
      const { name, description } = req.body;

      if (!name || !description) {
        return res.status(400).json({ error: 'Name and description are required' });
      }

      // Get the payer from the request (you'll need to implement proper wallet integration)
      const payer = provider.wallet["payer"];
      if (!payer) {
        return res.status(400).json({ error: 'No payer found' });
      }

      // Create META token mint
      const metaMint = await token.createMint(
        connection,
        payer,
        payer.publicKey,
        payer.publicKey,
        9
      );

      // Create USDC mint
      const usdcMint = await token.createMint(
        connection,
        payer,
        payer.publicKey,
        payer.publicKey,
        6
      );

      // Create token accounts
      const metaAccount = await token.createAssociatedTokenAccount(
        connection,
        payer,
        metaMint,
        payer.publicKey
      );

      const usdcAccount = await token.createAssociatedTokenAccount(
        connection,
        payer,
        usdcMint,
        payer.publicKey
      );

      // Mint initial tokens
      await token.mintTo(
        connection,
        payer,
        metaMint,
        metaAccount,
        payer,
        1000n * 1_000_000_000n // 1000 META
      );

      await token.mintTo(
        connection,
        payer,
        usdcMint,
        usdcAccount,
        payer,
        200_000n * 1_000_000n // 200,000 USDC
      );

      // Initialize DAO parameters
      const tokenPriceUiAmount = 1.0;
      const minBaseFutarchicLiquidity = 5;
      const minQuoteFutarchicLiquidity = 5;
      const daoKeypair = Keypair.generate();

      // Create DAO on-chain
      const dao = await autocratProgram.initializeDao(
        metaMint,
        tokenPriceUiAmount,
        minBaseFutarchicLiquidity,
        minQuoteFutarchicLiquidity,
        usdcMint,
        daoKeypair,
      );

      // Store DAO in database
      const dbDao = await prisma.dao.create({
        data: {
          name,
          description,
          publicKey: dao.toString(),
        },
      });

      // Return both on-chain and database DAO information
      res.status(201).json({
        onChain: {
          dao: dao.toString(),
          daoKeypair: {
            publicKey: daoKeypair.publicKey.toString(),
          },
          metaMint: metaMint.toString(),
          usdcMint: usdcMint.toString(),
          metaAccount: metaAccount.toString(),
          usdcAccount: usdcAccount.toString(),
          tokenPriceUiAmount,
          minBaseFutarchicLiquidity,
          minQuoteFutarchicLiquidity,
        },
        database: dbDao,
      });
    } catch (error) {
      console.error('Error creating DAO:', error);
      if (error.code === 'P2002') {
        return res.status(400).json({ error: 'A DAO with this public key already exists' });
      }
      res.status(500).json({ error: 'Failed to create DAO', details: error.message });
    }
  },

  /**
   * Get all proposals for a specific DAO
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getDaoProposals: async (req, res) => {
    try {
      const { id } = req.params;
      // This is a placeholder - implement proposal fetching logic
      res.json([]);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch proposals' });
    }
  },

  /**
   * Get a specific proposal by index for a given DAO
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getProposalByIndex: async (req, res) => {
    try {
      const { id, index } = req.params;
      // This is a placeholder - implement proposal fetching logic
      res.json({});
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch proposal' });
    }
  }
};

export default daoController; 