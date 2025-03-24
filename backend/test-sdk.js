import { Connection, clusterApiUrl, PublicKey } from '@solana/web3.js';
import { FutarchyRPCClient, AUTOCRAT_VERSIONS } from '@metadaoproject/futarchy-sdk';
import { AnchorProvider } from '@coral-xyz/anchor';

async function testSdk() {
  try {
    console.log('Initializing Solana connection...');
    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
    
    console.log('Creating AnchorProvider...');
    const provider = new AnchorProvider(
      connection,
      {
        publicKey: PublicKey.default,
        signAllTransactions: async (txs) => txs,
        signTransaction: async (tx) => tx,
      },
      { commitment: 'confirmed' }
    );
    
    console.log('Creating Futarchy Client...');
    const programVersion = AUTOCRAT_VERSIONS[0];
    console.log('Program version:', programVersion);
    
    const futarchyClient = FutarchyRPCClient.make(programVersion, provider);
    
    console.log('Attempting to fetch DAOs...');
    try {
      const daos = await futarchyClient.daos.fetchAllDaos();
      console.log('Success! DAOs:', daos);
    } catch (error) {
      console.error('Error fetching DAOs:', error);
    }
    
    console.log('SDK test completed');
  } catch (error) {
    console.error('Error in SDK test:', error);
  }
}

// Run the test
testSdk().then(() => {
  console.log('Test complete');
}).catch((error) => {
  console.error('Fatal error:', error);
}); 