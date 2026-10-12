import { useAuth } from "../stores/authStore";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import {
  articleCardClass,
  articleTitle,
  ghostBtn,
  loadingClass,
  errorClass,
} from "../styles/common";

function AdminProfile() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const BASE_URL =
    import.meta.env.VITE_API_URL ||
    (import.meta.env.PROD
      ? "https://blogapp-h3ux.onrender.com"
      : "http://localhost:4000");

  // 🔄 Fetch users + articles
  useEffect(() => {
    if (!currentUser || currentUser.role !== "ADMIN") return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [usersRes, articlesRes] = await Promise.all([
          axios.get(`${BASE_URL}/admin-api/users`, { withCredentials: true }),
          axios.get(`${BASE_URL}/admin-api/articles`, { withCredentials: true }),
        ]);

        setUsers(usersRes.data.payload || []);
        setArticles(articlesRes.data.payload || []);
      } catch (err) {
        console.log(err);
        setError(err.response?.data?.error || "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser, BASE_URL]);

  // 🔐 Protect route
  if (!currentUser) {
    return <p className="text-center mt-10">Loading profile...</p>;
  }

  if (currentUser.role !== "ADMIN") {
    return <p className="text-center mt-10">Access denied</p>;
  }

  // 🚪 Logout
  const onLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      console.log(err);
    }
  };

  // ❌ Delete article (admin)
  const deleteArticle = async (articleId) => {
    if (!window.confirm("Delete this article?")) return;

    try {
      await axios.delete(`${BASE_URL}/admin-api/articles/${articleId}`, {
        withCredentials: true,
      });

      setArticles((prev) => prev.filter((a) => a._id !== articleId));
      toast.success("Article deleted");
    } catch (err) {
      toast.error(err.response?.data?.error || "Delete failed");
    }
  };

  if (loading) return <p className={loadingClass}>Loading admin data...</p>;

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      {/* HEADER */}
      <div className="bg-white border rounded-3xl p-6 mb-8 shadow-sm flex justify-between items-center">
        <div className="flex items-center gap-4">
          {currentUser.profileImageUrl ? (
            <img
              src={currentUser.profileImageUrl}
              className="w-16 h-16 rounded-full object-cover"
              alt="profile"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-xl">
              {currentUser.firstName?.charAt(0)?.toUpperCase() || "A"}
            </div>
          )}

          <div>
            <p className="text-gray-500 text-sm">Admin Panel</p>
            <h2 className="text-xl font-semibold">{currentUser.firstName}</h2>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="bg-red-500 text-white px-5 py-2 rounded-full"
        >
          Logout
        </button>
      </div>

      {/* ERROR */}
      {error && <p className={errorClass}>{error}</p>}

      {/* USERS */}
      <div className="mb-10">
        <h3 className="text-lg font-semibold mb-4">All Users</h3>

        {users.length === 0 ? (
          <p>No users found</p>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {users.map((user) => (
              <div key={user._id} className="border p-4 rounded-xl bg-white">
                <p className="font-medium">{user.firstName}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
                <p className="text-xs mt-1">Role: {user.role}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ARTICLES */}
      <div>
        <h3 className="text-lg font-semibold mb-4">All Articles</h3>

        {articles.length === 0 ? (
          <p>No articles found</p>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {articles.map((article) => (
              <div key={article._id} className={articleCardClass}>
                <p className={articleTitle}>{article.title}</p>

                <p className="text-sm text-gray-600 mt-1">
                  {article.content?.slice(0, 80)}...
                </p>

                <div className="flex justify-between mt-4">
                  <button
                    className={ghostBtn}
                    onClick={() =>
                      navigate(`/article/${article._id}`, {
                        state: article,
                      })
                    }
                  >
                    View
                  </button>

                  <button
                    className="text-red-500 text-sm"
                    onClick={() => deleteArticle(article._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminProfile;