import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * API Service for Mini-Wallet Backend
 */
const walletAPI = {
  // User endpoints
  createUser: async (name, initialBalance) => {
    const response = await api.post("/users", {
      name,
      initial_balance: initialBalance,
    });
    return response.data;
  },

  getAllUsers: async () => {
    const response = await api.get("/users");
    return response.data;
  },

  getUserBalance: async (userId) => {
    const response = await api.get(`/users/${userId}/balance`);
    return response.data;
  },

  getTransactionHistory: async (userId) => {
    const response = await api.get(`/users/${userId}/transactions`);
    return response.data;
  },

  // Transfer endpoint
  transferMoney: async (fromUserId, toUserId, amount) => {
    const response = await api.post("/transfer", {
      from_user_id: fromUserId,
      to_user_id: toUserId,
      amount: parseFloat(amount),
    });
    return response.data;
  },

  // Health check
  healthCheck: async () => {
    const response = await api.get("/health");
    return response.data;
  },
};

export default walletAPI;
