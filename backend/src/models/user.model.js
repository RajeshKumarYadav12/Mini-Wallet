const mongoose = require("mongoose");

/**
 * User Schema
 * Represents a wallet user with balance tracking
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [1, "Name must be at least 1 character"],
      maxlength: [100, "Name must be at most 100 characters"],
    },
    balance: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
      default: 0.0,
      validate: {
        validator: function (value) {
          // Convert Decimal128 to number for validation
          const numValue = parseFloat(value.toString());
          return numValue >= 0;
        },
        message: "Balance cannot be negative",
      },
      get: function (value) {
        // Convert Decimal128 to float for JSON responses
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

// Index for faster queries
userSchema.index({ name: 1 });

const User = mongoose.model("User", userSchema);

module.exports = User;
