const Office = require('../models/Office');
const Role = require('../models/Role');
const Province = require('../models/Province');

/**
 * Dropdown Controller
 * Handles dropdown data requests (offices, roles, provinces)
 */
class DropdownController {
  constructor() {
    this.officeModel = new Office();
    this.roleModel = new Role();
    this.provinceModel = new Province();
  }

  /**
   * Get all active offices
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getOffices(req, res) {
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
   * Get all roles
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getRoles(req, res) {
    try {
      const roles = await this.roleModel.getAllWithUserCount();
      res.json({
        success: true,
        data: roles,
      });
    } catch (error) {
      console.error('Error fetching roles:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch roles',
        error: error.message,
      });
    }
  }

  /**
   * Get all provinces
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getProvinces(req, res) {
    try {
      const provinces = await this.provinceModel.getAll();
      res.json({
        success: true,
        data: provinces,
      });
    } catch (error) {
      console.error('Error fetching provinces:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch provinces',
        error: error.message,
      });
    }
  }

  /**
   * Get all dropdown data (offices, roles, provinces)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getAll(req, res) {
    try {
      const [offices, roles, provinces] = await Promise.all([
        this.officeModel.getActiveOffices(),
        this.roleModel.getAllWithUserCount(),
        this.provinceModel.getAll(),
      ]);

      res.json({
        success: true,
        data: {
          offices,
          roles,
          provinces,
        },
      });
    } catch (error) {
      console.error('Error fetching dropdown data:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch dropdown data',
        error: error.message,
      });
    }
  }
}

module.exports = DropdownController;
