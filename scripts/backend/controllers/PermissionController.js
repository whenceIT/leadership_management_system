const Permission = require('../models/Permission');

/**
 * Permission Controller
 * Handles permission-related API requests
 */
class PermissionController {
  constructor() {
    this.permissionModel = new Permission();
  }

  /**
   * Get all permissions
   * @route   GET /api/permissions
   * @desc    Get all permissions
   * @access   Public
   */
  async getAllPermissions(req, res) {
    try {
      const permissions = await this.permissionModel.getAll();
      res.json({
        success: true,
        data: permissions,
      });
    } catch (error) {
      console.error('Error fetching permissions:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch permissions',
        error: error.message,
      });
    }
  }

  /**
   * Get all permissions grouped by category
   * @route   GET /api/permissions/grouped
   * @desc    Get all permissions grouped by category
   * @access   Public
   */
  async getAllPermissionsGrouped(req, res) {
    try {
      const grouped = await this.permissionModel.getAllGrouped();
      res.json({
        success: true,
        data: grouped,
      });
    } catch (error) {
      console.error('Error fetching grouped permissions:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch grouped permissions',
        error: error.message,
      });
    }
  }

  /**
   * Get permission by ID
   * @route   GET /api/permissions/:id
   * @desc    Get permission by ID
   * @access   Public
   */
  async getPermissionById(req, res) {
    try {
      const { id } = req.params;
      const permission = await this.permissionModel.findById(id);

      if (!permission) {
        return res.status(404).json({
          success: false,
          message: 'Permission not found',
        });
      }

      res.json({
        success: true,
        data: permission,
      });
    } catch (error) {
      console.error('Error fetching permission:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch permission',
        error: error.message,
      });
    }
  }
}

module.exports = PermissionController;
