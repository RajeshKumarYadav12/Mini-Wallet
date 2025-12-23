const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");

/**
 * User Routes
 */

// Create a new user
router.post("/", userController.createUser.bind(userController));

// Get all users
router.get("/", userController.getAllUsers.bind(userController));

// Get user balance
router.get("/:id/balance", userController.getUserBalance.bind(userController));

// Get transaction history
router.get(
  "/:id/transactions",
  userController.getTransactionHistory.bind(userController)
);

module.exports = router;
