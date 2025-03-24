import { Connection, clusterApiUrl, Keypair } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';
import { AutocratClient } from '@metadaoproject/futarchy/v0.4';

async function testAutocrat() {
  try {
    console.log('Initializing Solana connection...');
    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
    
    // Create a dummy keypair for read-only operations
    const dummyKeypair = Keypair.generate();
    console.log('Created dummy keypair:', dummyKeypair.publicKey.toString());
    
    console.log('Creating AnchorProvider...');
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
    
    console.log('Creating AutocratClient...');
    const autocratProgram = AutocratClient.createClient({ provider });
    
    // Inspect the autocrat program structure
    console.log('Autocrat program structure:');
    console.log('- Properties of autocratProgram:', Object.keys(autocratProgram));
    
    if (autocratProgram.autocrat) {
      console.log('- Properties of autocratProgram.autocrat:', Object.keys(autocratProgram.autocrat));
      
      if (autocratProgram.autocrat.account) {
        console.log('- Properties of autocratProgram.autocrat.account:', Object.keys(autocratProgram.autocrat.account));
      }
    }
    
    if (autocratProgram.program) {
      console.log('- Properties of autocratProgram.program:', Object.keys(autocratProgram.program));
      
      if (autocratProgram.program.account) {
        console.log('- Properties of autocratProgram.program.account:', Object.keys(autocratProgram.program.account));
      }
    }
    
    // Now we know the correct method from the inspection
    console.log('\nAttempting to fetch DAOs using the correct method:');
    
    try {
      console.log('Using autocratProgram.autocrat.account.dao.all()');
      const daos = await autocratProgram.autocrat.account.dao.all();
      console.log('Success! Found', daos.length, 'DAOs');
      
      if (daos.length > 0) {
        // Display first DAO as an example
        console.log('Example DAO:', {
          publicKey: daos[0].publicKey.toString(),
          account: {
            // Format any nested data for better readability
            ...daos[0].account
          }
        });
      }
    } catch (error) {
      console.error('Error fetching DAOs:', error);
    }
    
    console.log('Autocrat client test completed');
  } catch (error) {
    console.error('Error in Autocrat client test:', error);
  }
}

// Run the test
testAutocrat().then(() => {
  console.log('Test complete');
}).catch((error) => {
  console.error('Fatal error:', error);
}); 