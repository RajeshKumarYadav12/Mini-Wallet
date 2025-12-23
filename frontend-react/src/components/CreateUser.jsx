import { useState } from "react";
import { toast } from "react-toastify";
import walletAPI from "../services/api";

const CreateUser = ({ onUserCreated }) => {
  const [name, setName] = useState("");
  const [initialBalance, setInitialBalance] = useState("100");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter a name");
      return;
    }

    const balance = parseFloat(initialBalance);
    if (isNaN(balance) || balance < 0) {
      toast.error("Initial balance must be a non-negative number");
      return;
    }

    try {
      setLoading(true);
      const response = await walletAPI.createUser(name.trim(), balance);

      if (response.success) {
        setName("");
        setInitialBalance("100");
        onUserCreated(response.data);
      } else {
        toast.error(response.error || "Failed to create user");
      }
    } catch (error) {
      toast.error("Error: " + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>Create New Account</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="userName">Name:</label>
          <input
            type="text"
            id="userName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="initialBalance">Initial Balance:</label>
          <input
            type="number"
            id="initialBalance"
            value={initialBalance}
            onChange={(e) => setInitialBalance(e.target.value)}
            placeholder="100"
            step="0.01"
            min="0"
            disabled={loading}
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Creating..." : "Create Account"}
        </button>
      </form>
    </div>
  );
};

export default CreateUser;
