import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

import {
  articleGrid,
  articleCardClass,
  articleTitle,
  loadingClass,
  errorClass,
} from "../styles/common";

function UsersList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const BASE_URL =
    import.meta.env.VITE_API_URL ||
    (import.meta.env.PROD
      ? "https://blogapp-h3ux.onrender.com"
      : "http://localhost:4000");

  // 📡 Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${BASE_URL}/admin-api/users`,
          { withCredentials: true }
        );

        if (res.status === 200) {
          setUsers(res.data.payload || []);
        }
      } catch (err) {
        console.log(err);
        setError(err.response?.data?.error || "Failed to fetch users");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [BASE_URL]);

  // Delete user (admin)
  const deleteUser = async (userId) => {
    if (!window.confirm("Delete this user?")) return;

    try {
      await axios.delete(`${BASE_URL}/admin-api/users/${userId}`, {
        withCredentials: true,
      });

      setUsers((prev) => prev.filter((u) => u._id !== userId));
      toast.success("User deleted");
    } catch (err) {
      toast.error(err.response?.data?.error || "Delete failed");
    }
  };

  if (loading) return <p className={loadingClass}>Loading users...</p>;
  if (error) return <p className={errorClass}>{error}</p>;

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <h2 className="text-2xl font-semibold mb-6">All Users</h2>

      {users.length === 0 ? (
        <p className="text-gray-500 text-center py-10">
          No users found
        </p>
      ) : (
        <div className={articleGrid}>
          {users.map((user) => (
            <div key={user._id} className={articleCardClass}>
              <div className="flex flex-col items-center text-center gap-3">
                
                {/* Avatar */}
                {user.profileImageUrl ? (
                  <img
                    src={user.profileImageUrl}
                    alt="user"
                    className="w-20 h-20 rounded-full object-cover border"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-xl font-semibold">
                    {user.firstName?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                )}

                {/* Name */}
                <p className={articleTitle}>
                  {user.firstName} {user.lastName}
                </p>

                {/* Email */}
                <p className="text-sm text-gray-500">{user.email}</p>

                {/* Role */}
                <p className="text-xs text-gray-400">
                  Role: {user.role}
                </p>

                {/* Delete button */}
                <button
                  className="text-red-500 text-sm mt-2"
                  onClick={() => deleteUser(user._id)}
                >
                  Delete User
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default UsersList;