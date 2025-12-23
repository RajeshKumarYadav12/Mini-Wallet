import React from "react";

const UserList = ({
  users,
  selectedUserId,
  onUserSelect,
  onRefresh,
  loading,
}) => {
  return (
    <div className="card">
      <div className="card-header">
        <h2>All Users</h2>
        <button
          onClick={onRefresh}
          className="btn btn-secondary btn-sm"
          disabled={loading}
        >
          {loading ? "Loading..." : "🔄 Refresh"}
        </button>
      </div>

      <div className="users-list">
        {users.length === 0 ? (
          <div className="empty-message">
            <p>No users found. Create an account to get started!</p>
          </div>
        ) : (
          users.map((user) => (
            <div
              key={user._id}
              className={`user-item ${
                selectedUserId === user._id ? "selected" : ""
              }`}
              onClick={() => onUserSelect(user._id)}
            >
              <div className="user-info">
                <h4>{user.name}</h4>
                <p className="user-id">ID: {user._id.substring(0, 8)}...</p>
                <p className="user-date">
                  Created: {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="user-balance">
                ${parseFloat(user.balance).toFixed(2)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default UserList;
