const mongoose = require("mongoose");

/**
 * Transaction Schema
 * Records all money transfers between users
 */
const transactionSchema = new mongoose.Schema(
  {
    from_user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Sender user ID is required"],
    },
    to_user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Recipient user ID is required"],
    },
    amount: {
      type: mongoose.Schema.Types.Decimal128,
      required: [true, "Amount is required"],
      validate: {
        validator: function (value) {
          const numValue = parseFloat(value.toString());
          return numValue > 0;
        },
        message: "Amount must be greater than 0",
      },
      get: function (value) {
        if (value) {
          return parseFloat(value.toString());
        }
        return 0;
      },
    },
  },
  {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true },
  }
);

// Indexes for faster queries
transactionSchema.index({ from_user_id: 1 });
transactionSchema.index({ to_user_id: 1 });
transactionSchema.index({ createdAt: -1 });

const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = Transaction;
