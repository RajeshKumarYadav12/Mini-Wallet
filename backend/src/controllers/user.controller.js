const walletService = require("../services/wallet.service");

/**
 * User Controller
 * Handles user-related HTTP requests
 */
class UserController {
  /**
   * Create a new user
   * POST /api/users
   */
  async createUser(req, res, next) {
    try {
      const { name, initial_balance } = req.body;

      // Validate required fields
      if (!name) {
        return res.status(400).json({
          success: false,
          error: "Name is required",
        });
      }

      // Parse and validate initial balance
      const initialBalance =
        initial_balance !== undefined ? parseFloat(initial_balance) : 0;

      if (isNaN(initialBalance) || initialBalance < 0) {
        return res.status(400).json({
          success: false,
          error: "Initial balance must be a non-negative number",
        });
      }

      const user = await walletService.createUser(name, initialBalance);

      res.status(201).json({
        success: true,
        data: {
          user_id: user._id,
          name: user.name,
          balance: user.balance,
          created_at: user.createdAt,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user balance
   * GET /api/users/:id/balance
   */
  async getUserBalance(req, res, next) {
    try {
      const userId = req.params.id;

      const balance = await walletService.getUserBalance(userId);

      res.status(200).json({
        success: true,
        data: balance,
      });
    } catch (error) {
      if (error.message === "User not found") {
        return res.status(404).json({
          success: false,
          error: error.message,
        });
      }
      next(error);
    }
  }

  /**
   * Get all users
   * GET /api/users
   */
  async getAllUsers(req, res, next) {
    try {
      const users = await walletService.getAllUsers();

      res.status(200).json({
        success: true,
        data: users,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get transaction history for a user
   * GET /api/users/:id/transactions
   */
  async getTransactionHistory(req, res, next) {
    try {
      const userId = req.params.id;

      const transactions = await walletService.getTransactionHistory(userId);

      res.status(200).json({
        success: true,
        data: transactions,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();
