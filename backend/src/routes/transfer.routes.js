const express = require("express");
const router = express.Router();
const transferController = require("../controllers/transfer.controller");

/**
 * Transfer Routes
 */

// Transfer money between users
router.post("/", transferController.transferMoney.bind(transferController));

module.exports = router;
