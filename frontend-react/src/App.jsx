import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import walletAPI from "./services/api";
import Header from "./components/Header";
import CreateUser from "./components/CreateUser";
import UserBalance from "./components/UserBalance";
import SendMoney from "./components/SendMoney";
import UserList from "./components/UserList";
import TransactionHistory from "./components/TransactionHistory";
import "./App.css";

function App() {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch all users on component mount
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await walletAPI.getAllUsers();
      if (response.success) {
        setUsers(response.data);
        // Auto-select first user if available
        if (response.data.length > 0 && !selectedUserId) {
          setSelectedUserId(response.data[0]._id);
        }
      }
    } catch (error) {
      toast.error("Failed to load users: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUserCreated = (newUser) => {
    toast.success(`Account created for ${newUser.name}!`);
    loadUsers();
  };

  const handleTransferComplete = () => {
    toast.success("Transfer completed successfully!");
    loadUsers();
  };

  const handleUserSelect = (userId) => {
    setSelectedUserId(userId);
  };

  return (
    <div className="app">
      <Header />

      <main className="container">
        <div className="grid">
          {/* Left Column */}
          <div className="column">
            <CreateUser onUserCreated={handleUserCreated} />

            <UserList
              users={users}
              selectedUserId={selectedUserId}
              onUserSelect={handleUserSelect}
              onRefresh={loadUsers}
              loading={loading}
            />
          </div>

          {/* Right Column */}
          <div className="column">
            {selectedUserId && (
              <>
                <UserBalance
                  userId={selectedUserId}
                  key={`balance-${selectedUserId}`}
                />

                <SendMoney
                  fromUserId={selectedUserId}
                  users={users}
                  onTransferComplete={handleTransferComplete}
                />

                <TransactionHistory
                  userId={selectedUserId}
                  key={`history-${selectedUserId}`}
                />
              </>
            )}

            {!selectedUserId && users.length === 0 && (
              <div className="card empty-state">
                <div className="empty-icon">💰</div>
                <h3>No Users Yet</h3>
                <p>Create your first account to get started!</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="footer">
        <p>&copy; 2025 Mini-Wallet System | Built with React & MongoDB</p>
      </footer>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
}

export default App;
