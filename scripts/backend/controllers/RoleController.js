const Role = require('../models/Role');

/**
 * Role Controller
 * Handles role-related API operations
 */
class RoleController {
  constructor() {
    this.roleModel = new Role();
  }

  /**
   * Get all roles
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getAllRoles(req, res) {
    try {
      const { page = 1, limit = 10, search = '' } = req.query;
      const offset = (page - 1) * limit;

      const roles = await this.roleModel.getAllWithUserCount({
        limit: parseInt(limit),
        offset: parseInt(offset),
        search,
      });

      const total = await this.roleModel.countRoles({ search });
      const totalPages = Math.ceil(total / limit);

      res.json({
        success: true,
        data: roles,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages,
        },
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
   * Get role by ID
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getRoleById(req, res) {
    try {
      const { id } = req.params;
      const role = await this.roleModel.findByIdWithUsers(parseInt(id));

      if (!role) {
        return res.status(404).json({
          success: false,
          message: 'Role not found',
        });
      }

      res.json({
        success: true,
        data: role,
      });
    } catch (error) {
      console.error('Error fetching role:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch role',
        error: error.message,
      });
    }
  }

  /**
   * Create a new role
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async createRole(req, res) {
    try {
      const {
        name,
        slug,
        time_limit = false,
        from_time = null,
        to_time = null,
        access_days = [],
        permissions = [],
      } = req.body;

      // Validate required fields
      if (!name || !slug) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: name, slug',
        });
      }

      // Create role
      const roleData = {
        name,
        slug,
        time_limit: time_limit ? 1 : 0,
        from_time,
        to_time,
        access_days: access_days.length > 0 ? JSON.stringify(access_days) : null,
        permissions: permissions.length > 0 ? JSON.stringify(permissions) : null,
      };

      const roleId = await this.roleModel.create(roleData);

      res.status(201).json({
        success: true,
        message: 'Role created successfully',
        data: { id: roleId, ...roleData },
      });
    } catch (error) {
      console.error('Error creating role:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create role',
        error: error.message,
      });
    }
  }

  /**
   * Update role
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async updateRole(req, res) {
    try {
      const { id } = req.params;
      const {
        name,
        slug,
        time_limit,
        from_time,
        to_time,
        access_days,
        permissions,
      } = req.body;

      // Check if role exists
      const existingRole = await this.roleModel.findById(parseInt(id));
      if (!existingRole) {
        return res.status(404).json({
          success: false,
          message: 'Role not found',
        });
      }

      // Prepare update data
      const updateData = {};
      if (name !== undefined) updateData.name = name;
      if (slug !== undefined) updateData.slug = slug;
      if (time_limit !== undefined) updateData.time_limit = time_limit ? 1 : 0;
      if (from_time !== undefined) updateData.from_time = from_time;
      if (to_time !== undefined) updateData.to_time = to_time;
      if (access_days !== undefined) {
        updateData.access_days = access_days.length > 0 ? JSON.stringify(access_days) : null;
      }
      if (permissions !== undefined) {
        updateData.permissions = permissions.length > 0 ? JSON.stringify(permissions) : null;
      }

      // Update role
      await this.roleModel.update(parseInt(id), updateData);

      res.json({
        success: true,
        message: 'Role updated successfully',
        data: { id: parseInt(id), ...updateData },
      });
    } catch (error) {
      console.error('Error updating role:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update role',
        error: error.message,
      });
    }
  }

  /**
   * Delete role
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async deleteRole(req, res) {
    try {
      const { id } = req.params;

      // Check if role has users
      const roleWithUsers = await this.roleModel.findByIdWithUsers(parseInt(id));
      if (roleWithUsers && roleWithUsers.users && roleWithUsers.users.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete role with assigned users',
        });
      }

      const affected = await this.roleModel.delete(parseInt(id));

      if (affected === 0) {
        return res.status(404).json({
          success: false,
          message: 'Role not found',
        });
      }

      res.json({
        success: true,
        message: 'Role deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting role:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete role',
        error: error.message,
      });
    }
  }

  /**
   * Get role permissions
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getRolePermissions(req, res) {
    try {
      const { id } = req.params;
      const permissions = await this.roleModel.getPermissions(parseInt(id));

      res.json({
        success: true,
        data: permissions,
      });
    } catch (error) {
      console.error('Error fetching role permissions:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch role permissions',
        error: error.message,
      });
    }
  }

  /**
   * Update role permissions
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async updateRolePermissions(req, res) {
    try {
      const { id } = req.params;
      const { permissions } = req.body;

      if (!permissions || !Array.isArray(permissions)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid permissions format',
        });
      }

      // Check if role exists
      const existingRole = await this.roleModel.findById(parseInt(id));
      if (!existingRole) {
        return res.status(404).json({
          success: false,
          message: 'Role not found',
        });
      }

      // Update permissions
      await this.roleModel.updatePermissions(parseInt(id), JSON.stringify(permissions));

      res.json({
        success: true,
        message: 'Role permissions updated successfully',
      });
    } catch (error) {
      console.error('Error updating role permissions:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update role permissions',
        error: error.message,
      });
    }
  }

  /**
   * Assign role to user
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async assignRoleToUser(req, res) {
    try {
      const { userId, roleId } = req.body;

      if (!userId || !roleId) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: userId, roleId',
        });
      }

      const assignmentId = await this.roleModel.assignToUser(parseInt(userId), parseInt(roleId));

      res.status(201).json({
        success: true,
        message: 'Role assigned to user successfully',
        data: { id: assignmentId, userId, roleId },
      });
    } catch (error) {
      console.error('Error assigning role to user:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to assign role to user',
        error: error.message,
      });
    }
  }

  /**
   * Remove role from user
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async removeRoleFromUser(req, res) {
    try {
      const { userId, roleId } = req.body;

      if (!userId || !roleId) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: userId, roleId',
        });
      }

      const affected = await this.roleModel.removeFromUser(parseInt(userId), parseInt(roleId));

      if (affected === 0) {
        return res.status(404).json({
          success: false,
          message: 'Role assignment not found',
        });
      }

      res.json({
        success: true,
        message: 'Role removed from user successfully',
      });
    } catch (error) {
      console.error('Error removing role from user:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to remove role from user',
        error: error.message,
      });
    }
  }
}

module.exports = RoleController;
