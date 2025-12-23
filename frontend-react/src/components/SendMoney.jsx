import { useState } from "react";
import { toast } from "react-toastify";
import walletAPI from "../services/api";

const SendMoney = ({ fromUserId, users, onTransferComplete }) => {
  const [toUserId, setToUserId] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!toUserId) {
      toast.error("Please select a recipient");
      return;
    }

    if (fromUserId === toUserId) {
      toast.error("Cannot transfer to the same account");
      return;
    }

    const transferAmount = parseFloat(amount);
    if (isNaN(transferAmount) || transferAmount <= 0) {
      toast.error("Amount must be greater than 0");
      return;
    }

    try {
      setLoading(true);
      const response = await walletAPI.transferMoney(
        fromUserId,
        toUserId,
        transferAmount
      );

      if (response.success) {
        setToUserId("");
        setAmount("");
        onTransferComplete(response.data);
      } else {
        toast.error(response.error || "Transfer failed");
      }
    } catch (error) {
      toast.error(
        "Transfer error: " + (error.response?.data?.error || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  // Filter out current user from recipient list
  const availableRecipients = users.filter((user) => user._id !== fromUserId);

  return (
    <div className="card">
      <h2>Send Money</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="toUserId">Recipient:</label>
          <select
            id="toUserId"
            value={toUserId}
            onChange={(e) => setToUserId(e.target.value)}
            disabled={loading}
            required
          >
            <option value="">Select recipient...</option>
            {availableRecipients.map((user) => (
              <option key={user._id} value={user._id}>
                {user.name} (Balance: ${parseFloat(user.balance).toFixed(2)})
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="amount">Amount:</label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="50.00"
            step="0.01"
            min="0.01"
            disabled={loading}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Sending..." : "💸 Send Money"}
        </button>
      </form>
    </div>
  );
};

export default SendMoney;
