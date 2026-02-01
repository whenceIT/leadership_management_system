const Client = require('../models/Client');

/**
 * Client Controller
 * Handles client-related API operations
 */
class ClientController {
  constructor() {
    this.clientModel = new Client();
  }

  /**
   * Get all clients
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getAllClients(req, res) {
    try {
      const { page = 1, limit = 10, search = '', clientType = null, status = null, officeId = null } = req.query;
      const offset = (page - 1) * limit;

      const clients = await this.clientModel.getClientsWithUsers({
        limit: parseInt(limit),
        offset: parseInt(offset),
        search,
        clientType,
        status,
        officeId: officeId ? parseInt(officeId) : null,
      });

      const total = await this.clientModel.countClients({
        search,
        clientType,
        status,
        officeId: officeId ? parseInt(officeId) : null,
      });
      const totalPages = Math.ceil(total / limit);

      res.json({
        success: true,
        data: clients,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages,
        },
      });
    } catch (error) {
      console.error('Error fetching clients:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch clients',
        error: error.message,
      });
    }
  }

  /**
   * Get client users (clients with user accounts)
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getClientUsers(req, res) {
    try {
      const { page = 1, limit = 10, search = '', clientType = null, status = null } = req.query;
      const offset = (page - 1) * limit;

      const clientUsers = await this.clientModel.getClientUsers({
        limit: parseInt(limit),
        offset: parseInt(offset),
        search,
        clientType,
        status,
      });

      const total = await this.clientModel.countClientUsers({ search, clientType, status });
      const totalPages = Math.ceil(total / limit);

      res.json({
        success: true,
        data: clientUsers,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages,
        },
      });
    } catch (error) {
      console.error('Error fetching client users:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch client users',
        error: error.message,
      });
    }
  }

  /**
   * Get client by ID
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getClientById(req, res) {
    try {
      const { id } = req.params;
      const client = await this.clientModel.findByIdWithUser(parseInt(id));

      if (!client) {
        return res.status(404).json({
          success: false,
          message: 'Client not found',
        });
      }

      res.json({
        success: true,
        data: client,
      });
    } catch (error) {
      console.error('Error fetching client:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch client',
        error: error.message,
      });
    }
  }

  /**
   * Link user to client
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async linkUserToClient(req, res) {
    try {
      const { clientId, userId, createdBy } = req.body;

      if (!clientId || !userId || !createdBy) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: clientId, userId, createdBy',
        });
      }

      const linkId = await this.clientModel.linkUser(parseInt(clientId), parseInt(userId), parseInt(createdBy));

      res.status(201).json({
        success: true,
        message: 'User linked to client successfully',
        data: { id: linkId, clientId, userId },
      });
    } catch (error) {
      console.error('Error linking user to client:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to link user to client',
        error: error.message,
      });
    }
  }

  /**
   * Unlink user from client
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async unlinkUserFromClient(req, res) {
    try {
      const { clientId, userId } = req.body;

      if (!clientId || !userId) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: clientId, userId',
        });
      }

      const affected = await this.clientModel.unlinkUser(parseInt(clientId), parseInt(userId));

      if (affected === 0) {
        return res.status(404).json({
          success: false,
          message: 'Client user link not found',
        });
      }

      res.json({
        success: true,
        message: 'User unlinked from client successfully',
      });
    } catch (error) {
      console.error('Error unlinking user from client:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to unlink user from client',
        error: error.message,
      });
    }
  }
}

module.exports = ClientController;
