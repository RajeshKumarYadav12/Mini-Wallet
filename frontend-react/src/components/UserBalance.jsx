import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import walletAPI from "../services/api";

const UserBalance = ({ userId }) => {
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userId) {
      loadBalance();
    }
  }, [userId]);

  const loadBalance = async () => {
    try {
      setLoading(true);
      const response = await walletAPI.getUserBalance(userId);

      if (response.success) {
        setBalance(response.data);
      } else {
        toast.error(response.error || "Failed to load balance");
      }
    } catch (error) {
      toast.error(
        "Error loading balance: " +
          (error.response?.data?.error || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="card balance-card">
        <h2>Current Balance</h2>
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (!balance) {
    return null;
  }

  return (
    <div className="card balance-card">
      <h2>Current Balance</h2>
      <div className="balance-info">
        <div className="user-name">{balance.name}</div>
        <div className="balance-amount">
          ${parseFloat(balance.balance).toFixed(2)}
        </div>
        <div className="user-id">User ID: {balance.user_id}</div>
      </div>
      <button onClick={loadBalance} className="btn btn-secondary btn-sm">
        Refresh Balance
      </button>
    </div>
  );
};

export default UserBalance;
