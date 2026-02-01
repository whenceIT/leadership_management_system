const User = require('../models/User');
const bcrypt = require('bcryptjs');

/**
 * User Controller
 * Handles user-related API operations
 */
class UserController {
  constructor() {
    this.userModel = new User();
  }

  /**
   * Get all active users
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getActiveUsers(req, res) {
    try {
      const { page = 1, limit = 10, search = '', officeId = null } = req.query;
      const offset = (page - 1) * limit;

      const users = await this.userModel.getActiveUsers({
        limit: parseInt(limit),
        offset: parseInt(offset),
        search,
        officeId: officeId ? parseInt(officeId) : null,
      });

      const total = await this.userModel.countActive({ search, officeId: officeId ? parseInt(officeId) : null });
      const totalPages = Math.ceil(total / limit);

      res.json({
        success: true,
        data: users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages,
        },
      });
    } catch (error) {
      console.error('Error fetching active users:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch active users',
        error: error.message,
      });
    }
  }

  /**
   * Get all inactive users
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getInactiveUsers(req, res) {
    try {
      const { page = 1, limit = 10, search = '', officeId = null } = req.query;
      const offset = (page - 1) * limit;

      const users = await this.userModel.getInactiveUsers({
        limit: parseInt(limit),
        offset: parseInt(offset),
        search,
        officeId: officeId ? parseInt(officeId) : null,
      });

      const total = await this.userModel.countInactive({ search, officeId: officeId ? parseInt(officeId) : null });
      const totalPages = Math.ceil(total / limit);

      res.json({
        success: true,
        data: users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages,
        },
      });
    } catch (error) {
      console.error('Error fetching inactive users:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch inactive users',
        error: error.message,
      });
    }
  }

  /**
   * Get user by ID
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getUserById(req, res) {
    try {
      const { id } = req.params;
      const user = await this.userModel.findByIdWithRoles(parseInt(id));

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user',
        error: error.message,
      });
    }
  }

  /**
   * Create a new user
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async createUser(req, res) {
    try {
      const {
        first_name,
        last_name,
        email,
        password,
        phone,
        gender,
        address,
        office_id,
        role_id,
        status = 'Active',
        enable_google2fa = false,
        time_limit = false,
        from_time = null,
        to_time = null,
        access_days = [],
      } = req.body;

      // Validate required fields
      if (!first_name || !last_name || !email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields',
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const userData = {
        first_name,
        last_name,
        email,
        password: hashedPassword,
        phone,
        gender,
        address,
        office_id: office_id ? parseInt(office_id) : null,
        status,
        enable_google2fa: enable_google2fa ? 1 : 0,
        blocked: 0,
        time_limit: time_limit ? 1 : 0,
        from_time,
        to_time,
        access_days: access_days.length > 0 ? JSON.stringify(access_days) : null,
      };

      const userId = await this.userModel.create(userData);

      // Assign role if provided
      if (role_id) {
        await this.userModel.assignRole(userId, parseInt(role_id));
      }

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: { id: userId, ...userData },
      });
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create user',
        error: error.message,
      });
    }
  }

  /**
   * Update user
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const {
        first_name,
        last_name,
        email,
        phone,
        gender,
        address,
        office_id,
        role_id,
        status,
        enable_google2fa,
        time_limit,
        from_time,
        to_time,
        access_days,
      } = req.body;

      // Check if user exists
      const existingUser = await this.userModel.findById(parseInt(id));
      if (!existingUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      // Prepare update data
      const updateData = {};
      if (first_name !== undefined) updateData.first_name = first_name;
      if (last_name !== undefined) updateData.last_name = last_name;
      if (email !== undefined) updateData.email = email;
      if (phone !== undefined) updateData.phone = phone;
      if (gender !== undefined) updateData.gender = gender;
      if (address !== undefined) updateData.address = address;
      if (office_id !== undefined) updateData.office_id = office_id ? parseInt(office_id) : null;
      if (status !== undefined) updateData.status = status;
      if (enable_google2fa !== undefined) updateData.enable_google2fa = enable_google2fa ? 1 : 0;
      if (time_limit !== undefined) updateData.time_limit = time_limit ? 1 : 0;
      if (from_time !== undefined) updateData.from_time = from_time;
      if (to_time !== undefined) updateData.to_time = to_time;
      if (access_days !== undefined) {
        updateData.access_days = access_days.length > 0 ? JSON.stringify(access_days) : null;
      }

      // Update user
      await this.userModel.update(parseInt(id), updateData);

      // Update role if provided
      if (role_id !== undefined) {
        // Remove existing roles
        const db = require('../database/connection');
        await db.query('DELETE FROM role_users WHERE user_id = ?', [parseInt(id)]);
        
        // Assign new role
        await this.userModel.assignRole(parseInt(id), parseInt(role_id));
      }

      res.json({
        success: true,
        message: 'User updated successfully',
        data: { id: parseInt(id), ...updateData },
      });
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update user',
        error: error.message,
      });
    }
  }

  /**
   * Deactivate user
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async deactivateUser(req, res) {
    try {
      const { id } = req.params;

      const affected = await this.userModel.deactivate(parseInt(id));

      if (affected === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      res.json({
        success: true,
        message: 'User deactivated successfully',
      });
    } catch (error) {
      console.error('Error deactivating user:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to deactivate user',
        error: error.message,
      });
    }
  }

  /**
   * Reactivate user
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async reactivateUser(req, res) {
    try {
      const { id } = req.params;

      const affected = await this.userModel.reactivate(parseInt(id));

      if (affected === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      res.json({
        success: true,
        message: 'User reactivated successfully',
      });
    } catch (error) {
      console.error('Error reactivating user:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to reactivate user',
        error: error.message,
      });
    }
  }

  /**
   * Delete user
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async deleteUser(req, res) {
    try {
      const { id } = req.params;

      const affected = await this.userModel.delete(parseInt(id));

      if (affected === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      res.json({
        success: true,
        message: 'User deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete user',
        error: error.message,
      });
    }
  }

  /**
   * Get user roles
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getUserRoles(req, res) {
    try {
      const { id } = req.params;
      const roles = await this.userModel.getUserRoles(parseInt(id));

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
}

module.exports = UserController;
