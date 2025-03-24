import express from 'express';
// Import routes
import daoRoutes from './routes/daoRoutes.js';

const app = express();
const port = 3002;

// Middleware for JSON parsing
app.use(express.json());

// Mount routes
app.use('/api/daos', daoRoutes);

app.get('/', (req, res) => {
  res.json({ 
    message: 'Futarchy Server is running!',
    documentation: {
      endpoints: {
        daos: '/api/daos',
        dao: '/api/daos/:id',
        daoProposals: '/api/daos/:id/proposals',
        daoProposal: '/api/daos/:id/proposals/:index',
        status: '/status'
      },
      createDao: {
        description: 'Create a new DAO using the TypeScript script',
        command: 'npm run create-dao',
        requirements: 'Solana CLI with a funded wallet configured for devnet'
      }
    },
    version: '1.1.0'
  });
});

// Health status endpoint
app.get('/status', (req, res) => {
  // Check server status
  const status = {
    server: 'online',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    sdk: {
      package: '@metadaoproject/futarchy',
      version: '0.4.0-alpha.58',
      status: 'operational',
      note: 'Using AutocratClient with autocrat.account.dao.all() method to fetch DAOs'
    },
    features: {
      viewDaos: true,
      viewProposals: true,
      createDao: true
    }
  };
  
  res.json(status);
});

app.listen(port, () => {
  console.log(`Futarchy server listening at http://localhost:${port}`);
}); 