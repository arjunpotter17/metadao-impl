import express from 'express';
import daoController from '../controllers/daoController.js';

const router = express.Router();

/**
 * @route   POST /api/daos/create
 * @desc    Create a new DAO
 * @access  Public
 */
router.post('/create', daoController.createDao);

/**
 * @route   GET /api/daos
 * @desc    Get all DAOs
 * @access  Public
 */
router.get('/', daoController.getAllDaos);

/**
 * @route   GET /api/daos/:id
 * @desc    Get a single DAO by ID
 * @access  Public
 */
router.get('/:id', daoController.getDaoById);

/**
 * @route   GET /api/daos/:id/proposals
 * @desc    Get all proposals for a specific DAO
 * @access  Public
 */
router.get('/:id/proposals', daoController.getDaoProposals);

/**
 * @route   GET /api/daos/:id/proposals/:index
 * @desc    Get a specific proposal by DAO ID and proposal index
 * @access  Public
 */
router.get('/:id/proposals/:index', daoController.getProposalByIndex);

export default router; 