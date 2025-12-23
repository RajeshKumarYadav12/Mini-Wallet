const { mongoose } = require("../config/db");
const User = require("../models/user.model");
const Transaction = require("../models/transaction.model");

/**
 * Wallet Service
 * Handles all wallet operations with database transactions
 */
class WalletService {
  /**
   * Create a new user with initial balance
   * @param {string} name - User's name
   * @param {number} initialBalance - Starting balance
   * @returns {Promise<User>} Created user
   */
  async createUser(name, initialBalance = 0) {
    try {
      // Validate input
      if (!name || name.trim() === "") {
        throw new Error("Name is required");
      }

      if (initialBalance < 0) {
        throw new Error("Initial balance cannot be negative");
      }

      const user = await User.create({
        name: name.trim(),
        balance: initialBalance,
      });

      return user;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get user balance by ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} User balance information
   */
  async getUserBalance(userId) {
    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid user ID format");
    }

    const user = await User.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    return {
      user_id: user._id,
      name: user.name,
      balance: user.balance,
    };
  }

  /**
   * Transfer money between users atomically
   * CRITICAL: Uses MongoDB sessions/transactions to ensure atomicity
   * Both debit and credit happen together or neither happens
   *
   * @param {string} fromUserId - Sender's user ID
   * @param {string} toUserId - Recipient's user ID
   * @param {number} amount - Amount to transfer
   * @returns {Promise<Object>} Transaction details
   */
  async transferMoney(fromUserId, toUserId, amount) {
    // Input validation
    if (!fromUserId || !toUserId) {
      throw new Error("Both sender and recipient user IDs are required");
    }

    // Validate MongoDB ObjectIds
    if (!mongoose.Types.ObjectId.isValid(fromUserId)) {
      throw new Error("Invalid sender user ID format");
    }

    if (!mongoose.Types.ObjectId.isValid(toUserId)) {
      throw new Error("Invalid recipient user ID format");
    }

    if (fromUserId === toUserId) {
      throw new Error("Cannot transfer to the same account");
    }

    if (!amount || amount <= 0) {
      throw new Error("Amount must be greater than 0");
    }

    // Round to 2 decimal places to prevent floating point issues
    const transferAmount = Math.round(amount * 100) / 100;

    // Start a MongoDB session for transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Fetch both users within transaction
      const fromUser = await User.findById(fromUserId).session(session);
      const toUser = await User.findById(toUserId).session(session);

      // Validate users exist
      if (!fromUser) {
        throw new Error("Sender user not found");
      }

      if (!toUser) {
        throw new Error("Recipient user not found");
      }

      // Check sufficient balance
      if (parseFloat(fromUser.balance) < transferAmount) {
        throw new Error("Insufficient balance");
      }

      // Perform atomic debit and credit
      // Update sender balance
      fromUser.balance = parseFloat(fromUser.balance) - transferAmount;
      await fromUser.save({ session });

      // Update recipient balance
      toUser.balance = parseFloat(toUser.balance) + transferAmount;
      await toUser.save({ session });

      // Record the transaction
      const transaction = await Transaction.create(
        [
          {
            from_user_id: fromUserId,
            to_user_id: toUserId,
            amount: transferAmount,
          },
        ],
        { session }
      );

      // Commit the transaction
      await session.commitTransaction();

      return {
        transaction_id: transaction[0]._id,
        from_user_id: fromUserId,
        to_user_id: toUserId,
        amount: transferAmount,
        from_user_balance: fromUser.balance,
        to_user_balance: toUser.balance,
        timestamp: transaction[0].createdAt,
      };
    } catch (error) {
      // Rollback on any error
      await session.abortTransaction();
      throw error;
    } finally {
      // End session
      session.endSession();
    }
  }

  /**
   * Get all users (for testing/admin purposes)
   * @returns {Promise<Array>} List of all users
   */
  async getAllUsers() {
    return await User.find({})
      .select("_id name balance createdAt")
      .sort({ _id: 1 });
  }

  /**
   * Get transaction history for a user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Transaction history
   */
  async getTransactionHistory(userId) {
    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid user ID format");
    }

    const transactions = await Transaction.find({
      $or: [{ from_user_id: userId }, { to_user_id: userId }],
    })
      .sort({ createdAt: -1 })
      .limit(50);

    return transactions;
  }
}

module.exports = new WalletService();
