const walletService = require("../services/wallet.service");

/**
 * Transfer Controller
 * Handles money transfer HTTP requests
 */
class TransferController {
  /**
   * Transfer money between users
   * POST /api/transfer
   */
  async transferMoney(req, res, next) {
    try {
      const { from_user_id, to_user_id, amount } = req.body;

      // Validate required fields
      if (!from_user_id || !to_user_id || amount === undefined) {
        return res.status(400).json({
          success: false,
          error: "from_user_id, to_user_id, and amount are required",
        });
      }

      // Parse and validate amount
      const fromUserId = from_user_id;
      const toUserId = to_user_id;
      const transferAmount = parseFloat(amount);

      if (isNaN(transferAmount) || transferAmount <= 0) {
        return res.status(400).json({
          success: false,
          error: "Amount must be greater than 0",
        });
      }

      // Execute transfer
      const result = await walletService.transferMoney(
        fromUserId,
        toUserId,
        transferAmount
      );

      res.status(200).json({
        success: true,
        message: "Transfer completed successfully",
        data: result,
      });
    } catch (error) {
      // Handle specific error cases
      if (error.message === "Insufficient balance") {
        return res.status(400).json({
          success: false,
          error: error.message,
        });
      }

      if (error.message.includes("not found")) {
        return res.status(404).json({
          success: false,
          error: error.message,
        });
      }

      if (error.message === "Cannot transfer to the same account") {
        return res.status(400).json({
          success: false,
          error: error.message,
        });
      }

      next(error);
    }
  }
}

module.exports = new TransferController();
