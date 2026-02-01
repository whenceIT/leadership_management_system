const Office = require('../models/Office');

/**
 * Office Controller
 * Handles office-related API operations
 */
class OfficeController {
  constructor() {
    this.officeModel = new Office();
  }

  /**
   * Get all active offices
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getAllOffices(req, res) {
    try {
      const offices = await this.officeModel.getActiveOffices();

      res.json({
        success: true,
        data: offices,
      });
    } catch (error) {
      console.error('Error fetching offices:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch offices',
        error: error.message,
      });
    }
  }

  /**
   * Get office by ID
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getOfficeById(req, res) {
    try {
      const { id } = req.params;
      const office = await this.officeModel.findById(parseInt(id));

      if (!office) {
        return res.status(404).json({
          success: false,
          message: 'Office not found',
        });
      }

      res.json({
        success: true,
        data: office,
      });
    } catch (error) {
      console.error('Error fetching office:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch office',
        error: error.message,
      });
    }
  }
}

module.exports = OfficeController;
