const RoleUser = require('../models/RoleUser');

/**
 * RoleUser Controller
 * Handles role-user assignment API operations
 */
class RoleUserController {
  constructor() {
    this.roleUserModel = new RoleUser();
  }

  /**
   * Get all role-user assignments
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getAll(req, res) {
    try {
      const { page = 1, limit = 10, search = '' } = req.query;
      const offset = (page - 1) * limit;

      const roleUsers = await this.roleUserModel.getAll();

      // Filter by search if provided
      let filteredRoleUsers = roleUsers;
      if (search) {
        const searchLower = search.toLowerCase();
        filteredRoleUsers = roleUsers.filter(ru => 
          ru.role_name && ru.role_name.toLowerCase().includes(searchLower) ||
          ru.email && ru.email.toLowerCase().includes(searchLower) ||
          ru.first_name && ru.first_name.toLowerCase().includes(searchLower) ||
          ru.last_name && ru.last_name.toLowerCase().includes(searchLower)
        );
      }

      // Pagination
      const paginatedRoleUsers = filteredRoleUsers.slice(offset, offset + parseInt(limit));
      const total = filteredRoleUsers.length;
      const totalPages = Math.ceil(total / limit);

      res.json({
        success: true,
        data: paginatedRoleUsers,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages,
        },
      });
    } catch (error) {
      console.error('Error fetching role-users:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch role-user assignments',
        error: error.message,
      });
    }
  }

  /**
   * Get role-user assignment by ID
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getById(req, res) {
    try {
      const { id } = req.params;
      const roleUser = await this.roleUserModel.findById(parseInt(id));

      if (!roleUser) {
        return res.status(404).json({
          success: false,
          message: 'Role-user assignment not found',
        });
      }

      res.json({
        success: true,
        data: roleUser,
      });
    } catch (error) {
      console.error('Error fetching role-user:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch role-user assignment',
        error: error.message,
      });
    }
  }

  /**
   * Get roles assigned to a specific user
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getRolesByUserId(req, res) {
    try {
      const { userId } = req.params;
      const roles = await this.roleUserModel.getRolesByUserId(parseInt(userId));

      res.json({
        success: true,
        data: roles,
      });
    } catch (error) {
      console.error('Error fetching user roles:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user roles',
        error: error.message,
      });
    }
  }

  /**
   * Get users assigned to a specific role
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getUsersByRoleId(req, res) {
    try {
      const { roleId } = req.params;
      const users = await this.roleUserModel.getUsersByRoleId(parseInt(roleId));

      res.json({
        success: true,
        data: users,
      });
    } catch (error) {
      console.error('Error fetching role users:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch role users',
        error: error.message,
      });
    }
  }

  /**
   * Create a new role-user assignment
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async create(req, res) {
    try {
      const { user_id, role_id } = req.body;

      // Validate required fields
      if (!user_id || !role_id) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: user_id, role_id',
        });
      }

      // Check if assignment already exists
      const existing = await this.roleUserModel.hasRole(parseInt(user_id), parseInt(role_id));
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'User already has this role',
        });
      }

      const assignmentId = await this.roleUserModel.create({
        user_id: parseInt(user_id),
        role_id: parseInt(role_id),
      });

      res.status(201).json({
        success: true,
        message: 'Role assigned to user successfully',
        data: { id: assignmentId, user_id, role_id },
      });
    } catch (error) {
      console.error('Error creating role-user assignment:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to assign role to user',
        error: error.message,
      });
    }
  }

  /**
   * Update a role-user assignment
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async update(req, res) {
    try {
      const { id } = req.params;
      const { user_id, role_id } = req.body;

      // Check if assignment exists
      const existing = await this.roleUserModel.findById(parseInt(id));
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Role-user assignment not found',
        });
      }

      // Prepare update data - only include fields that are provided
      const updateData = {};
      if (user_id !== undefined && user_id !== null) updateData.user_id = parseInt(user_id);
      if (role_id !== undefined && role_id !== null) updateData.role_id = parseInt(role_id);

      // Update assignment
      await this.roleUserModel.update(parseInt(id), updateData);

      res.json({
        success: true,
        message: 'Role-user assignment updated successfully',
        data: { id: parseInt(id), ...updateData },
      });
    } catch (error) {
      console.error('Error updating role-user assignment:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update role-user assignment',
        error: error.message,
      });
    }
  }

  /**
   * Delete a role-user assignment
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async delete(req, res) {
    try {
      const { id } = req.params;

      const affected = await this.roleUserModel.delete(parseInt(id));

      if (affected === 0) {
        return res.status(404).json({
          success: false,
          message: 'Role-user assignment not found',
        });
      }

      res.json({
        success: true,
        message: 'Role-user assignment deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting role-user assignment:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete role-user assignment',
        error: error.message,
      });
    }
  }

  /**
   * Delete all role assignments for a user
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async deleteByUserId(req, res) {
    try {
      const { userId } = req.params;

      const affected = await this.roleUserModel.deleteByUserId(parseInt(userId));

      res.json({
        success: true,
        message: `Deleted ${affected} role assignments for user`,
      });
    } catch (error) {
      console.error('Error deleting user roles:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete user roles',
        error: error.message,
      });
    }
  }

  /**
   * Delete all user assignments for a role
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async deleteByRoleId(req, res) {
    try {
      const { roleId } = req.params;

      const affected = await this.roleUserModel.deleteByRoleId(parseInt(roleId));

      res.json({
        success: true,
        message: `Deleted ${affected} user assignments for role`,
      });
    } catch (error) {
      console.error('Error deleting role users:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete role users',
        error: error.message,
      });
    }
  }
}

module.exports = RoleUserController;
