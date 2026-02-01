const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
const RoleController = require('../controllers/RoleController');
const ClientController = require('../controllers/ClientController');
const OfficeController = require('../controllers/OfficeController');
const DropdownController = require('../controllers/DropdownController');
const RoleUserController = require('../controllers/RoleUserController');

// Initialize controllers
const userController = new UserController();
const roleController = new RoleController();
const clientController = new ClientController();
const officeController = new OfficeController();
const dropdownController = new DropdownController();
const roleUserController = new RoleUserController();

// ==================== USER ROUTES ====================

/**
 * @route   GET /api/users
 * @desc    Get all active users with pagination
 * @access   Public (add authentication middleware as needed)
 */
router.get('/users', (req, res) => userController.getActiveUsers(req, res));

/**
 * @route   GET /api/users/inactive
 * @desc    Get all inactive users with pagination
 * @access   Public
 */
router.get('/users/inactive', (req, res) => userController.getInactiveUsers(req, res));

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access   Public
 */
router.get('/users/:id', (req, res) => userController.getUserById(req, res));

/**
 * @route   POST /api/users
 * @desc    Create a new user
 * @access   Public
 */
router.post('/users', (req, res) => userController.createUser(req, res));

/**
 * @route   PUT /api/users/:id
 * @desc    Update user
 * @access   Public
 */
router.put('/users/:id', (req, res) => userController.updateUser(req, res));

/**
 * @route   POST /api/users/:id/deactivate
 * @desc    Deactivate a user
 * @access   Public
 */
router.post('/users/:id/deactivate', (req, res) => userController.deactivateUser(req, res));

/**
 * @route   POST /api/users/:id/reactivate
 * @desc    Reactivate a user
 * @access   Public
 */
router.post('/users/:id/reactivate', (req, res) => userController.reactivateUser(req, res));

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete a user
 * @access   Public
 */
router.delete('/users/:id', (req, res) => userController.deleteUser(req, res));

/**
 * @route   GET /api/users/:id/roles
 * @desc    Get user roles
 * @access   Public
 */
router.get('/users/:id/roles', (req, res) => userController.getUserRoles(req, res));

// ==================== ROLE ROUTES ====================

/**
 * @route   GET /api/roles
 * @desc    Get all roles with pagination
 * @access   Public
 */
router.get('/roles', (req, res) => roleController.getAllRoles(req, res));

/**
 * @route   GET /api/roles/:id
 * @desc    Get role by ID
 * @access   Public
 */
router.get('/roles/:id', (req, res) => roleController.getRoleById(req, res));

/**
 * @route   POST /api/roles
 * @desc    Create a new role
 * @access   Public
 */
router.post('/roles', (req, res) => roleController.createRole(req, res));

/**
 * @route   PUT /api/roles/:id
 * @desc    Update role
 * @access   Public
 */
router.put('/roles/:id', (req, res) => roleController.updateRole(req, res));

/**
 * @route   DELETE /api/roles/:id
 * @desc    Delete role
 * @access   Public
 */
router.delete('/roles/:id', (req, res) => roleController.deleteRole(req, res));

/**
 * @route   GET /api/roles/:id/permissions
 * @desc    Get role permissions
 * @access   Public
 */
router.get('/roles/:id/permissions', (req, res) => roleController.getRolePermissions(req, res));

/**
 * @route   PUT /api/roles/:id/permissions
 * @desc    Update role permissions
 * @access   Public
 */
router.put('/roles/:id/permissions', (req, res) => roleController.updateRolePermissions(req, res));

/**
 * @route   POST /api/roles/assign
 * @desc    Assign role to user
 * @access   Public
 */
router.post('/roles/assign', (req, res) => roleController.assignRoleToUser(req, res));

/**
 * @route   POST /api/roles/remove
 * @desc    Remove role from user
 * @access   Public
 */
router.post('/roles/remove', (req, res) => roleController.removeRoleFromUser(req, res));

// ==================== ROLE USER ROUTES ====================

/**
 * @route   GET /api/role-users
 * @desc    Get all role-user assignments
 * @access   Public
 */
router.get('/role-users', (req, res) => roleUserController.getAll(req, res));

/**
 * @route   GET /api/role-users/:id
 * @desc    Get role-user assignment by ID
 * @access   Public
 */
router.get('/role-users/:id', (req, res) => roleUserController.getById(req, res));

/**
 * @route   GET /api/role-users/user/:userId
 * @desc    Get roles assigned to a user
 * @access   Public
 */
router.get('/role-users/user/:userId', (req, res) => roleUserController.getRolesByUserId(req, res));

/**
 * @route   GET /api/role-users/role/:roleId
 * @desc    Get users assigned to a role
 * @access   Public
 */
router.get('/role-users/role/:roleId', (req, res) => roleUserController.getUsersByRoleId(req, res));

/**
 * @route   POST /api/role-users
 * @desc    Create a new role-user assignment
 * @access   Public
 */
router.post('/role-users', (req, res) => roleUserController.create(req, res));

/**
 * @route   PUT /api/role-users/:id
 * @desc    Update a role-user assignment
 * @access   Public
 */
router.put('/role-users/:id', (req, res) => roleUserController.update(req, res));

/**
 * @route   DELETE /api/role-users/:id
 * @desc    Delete a role-user assignment
 * @access   Public
 */
router.delete('/role-users/:id', (req, res) => roleUserController.delete(req, res));

/**
 * @route   DELETE /api/role-users/user/:userId
 * @desc    Delete all role assignments for a user
 * @access   Public
 */
router.delete('/role-users/user/:userId', (req, res) => roleUserController.deleteByUserId(req, res));

/**
 * @route   DELETE /api/role-users/role/:roleId
 * @desc    Delete all user assignments for a role
 * @access   Public
 */
router.delete('/role-users/role/:roleId', (req, res) => roleUserController.deleteByRoleId(req, res));

// ==================== CLIENT ROUTES ====================

/**
 * @route   GET /api/clients
 * @desc    Get all clients with pagination
 * @access   Public
 */
router.get('/clients', (req, res) => clientController.getAllClients(req, res));

/**
 * @route   GET /api/clients/users
 * @desc    Get client users (clients with user accounts)
 * @access   Public
 */
router.get('/clients/users', (req, res) => clientController.getClientUsers(req, res));

/**
 * @route   GET /api/clients/:id
 * @desc    Get client by ID
 * @access   Public
 */
router.get('/clients/:id', (req, res) => clientController.getClientById(req, res));

/**
 * @route   POST /api/clients/link-user
 * @desc    Link user to client
 * @access   Public
 */
router.post('/clients/link-user', (req, res) => clientController.linkUserToClient(req, res));

/**
 * @route   POST /api/clients/unlink-user
 * @desc    Unlink user from client
 * @access   Public
 */
router.post('/clients/unlink-user', (req, res) => clientController.unlinkUserFromClient(req, res));

// ==================== OFFICE ROUTES ====================

/**
 * @route   GET /api/offices
 * @desc    Get all active offices
 * @access   Public
 */
router.get('/offices', (req, res) => officeController.getAllOffices(req, res));

/**
 * @route   GET /api/offices/:id
 * @desc    Get office by ID
 * @access   Public
 */
router.get('/offices/:id', (req, res) => officeController.getOfficeById(req, res));

// ==================== DROPDOWN ROUTES ====================

/**
 * @route   GET /api/dropdown/offices
 * @desc    Get all active offices for dropdown
 * @access   Public
 */
router.get('/dropdown/offices', (req, res) => dropdownController.getOffices(req, res));

/**
 * @route   GET /api/dropdown/roles
 * @desc    Get all roles for dropdown
 * @access   Public
 */
router.get('/dropdown/roles', (req, res) => dropdownController.getRoles(req, res));

/**
 * @route   GET /api/dropdown/provinces
 * @desc    Get all provinces for dropdown
 * @access   Public
 */
router.get('/dropdown/provinces', (req, res) => dropdownController.getProvinces(req, res));

/**
 * @route   GET /api/dropdown/all
 * @desc    Get all dropdown data (offices, roles, provinces)
 * @access   Public
 */
router.get('/dropdown/all', (req, res) => dropdownController.getAll(req, res));

module.exports = router;
