import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import walletAPI from "../services/api";

const TransactionHistory = ({ userId }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userId) {
      loadHistory();
    }
  }, [userId]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const response = await walletAPI.getTransactionHistory(userId);

      if (response.success) {
        setTransactions(response.data);
      } else {
        toast.error(response.error || "Failed to load transaction history");
      }
    } catch (error) {
      toast.error(
        "Error loading history: " +
          (error.response?.data?.error || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="card">
        <h2>Transaction History</h2>
        <div className="loading">Loading transactions...</div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <h2>Transaction History</h2>
        <button onClick={loadHistory} className="btn btn-secondary btn-sm">
          🔄 Refresh
        </button>
      </div>

      <div className="transactions-list">
        {transactions.length === 0 ? (
          <div className="empty-message">
            <p>No transactions yet.</p>
          </div>
        ) : (
          transactions.map((tx) => {
            const isSent = tx.from_user_id === userId;
            const type = isSent ? "sent" : "received";
            const icon = isSent ? "↗️" : "↙️";
            const action = isSent ? "Sent to" : "Received from";
            const otherUserId = isSent ? tx.to_user_id : tx.from_user_id;

            return (
              <div key={tx._id} className={`transaction-item ${type}`}>
                <div className="transaction-info">
                  <div className="transaction-action">
                    <span className="transaction-icon">{icon}</span>
                    <span className="transaction-text">{action}</span>
                  </div>
                  <div className="transaction-user">
                    User: {otherUserId.substring(0, 8)}...
                  </div>
                  <div className="transaction-date">
                    {new Date(tx.createdAt).toLocaleString()}
                  </div>
                </div>
                <div className={`transaction-amount ${type}`}>
                  {isSent ? "-" : "+"}${parseFloat(tx.amount).toFixed(2)}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default TransactionHistory;
