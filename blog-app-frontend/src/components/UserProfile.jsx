import { useAuth } from "../stores/authStore";
import { useNavigate } from "react-router";
import axios from "axios";
import { useEffect, useState } from "react";

function UserProfile() {
  const logout = useAuth((state) => state.logout);
  const currentUser = useAuth((state) => state.currentUser);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [articles, setArticles] = useState([]);

  const BASE_URL =
    import.meta.env.VITE_API_URL ||
    (import.meta.env.PROD
      ? "https://blogapp-h3ux.onrender.com"
      : "http://localhost:4000");

  useEffect(() => {
    const getArticles = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${BASE_URL}/user-api/articles`,
          { withCredentials: true }
        );

        if (res.status === 200) {
          setArticles(res.data.payload); // ✅ FIXED
        }
      } catch (err) {
        setError(err.response?.data?.error || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    getArticles();
  }, [BASE_URL]);

  const formatDateIST = (date) => {
    return new Date(date).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const onLogout = async () => {
    await logout();
    navigate("/login");
  };

  const openArticle = (article) => {
    navigate(`/article/${article._id}`, { state: article });
  };

  if (loading) {
    return <p className="text-center text-gray-500 py-10">Loading articles...</p>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">

      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* ERROR */}
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        {/* PROFILE HEADER */}
        <div className="bg-white rounded-3xl p-6 mb-10 shadow-md flex items-center justify-between">

          {/* LEFT */}
          <div className="flex items-center gap-4">
            
            {/* Avatar */}
            {currentUser?.profileImageUrl ? (
              <img
                src={currentUser.profileImageUrl}
                className="w-16 h-16 rounded-full object-cover border"
                alt="profile"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xl font-semibold">
                {currentUser?.firstName?.charAt(0)?.toUpperCase()}
              </div>
            )}

            {/* Name */}
            <div>
              <p className="text-sm text-gray-500">Welcome back</p>
              <h2 className="text-xl font-semibold text-gray-800">
                {currentUser?.firstName}
              </h2>
            </div>
          </div>

          {/* LOGOUT */}
          <button
            className="bg-red-500 text-white text-sm px-5 py-2 rounded-full hover:bg-red-600 transition"
            onClick={onLogout}
          >
            Logout
          </button>
        </div>

        {/* ARTICLES */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-6">
            Latest Articles
          </h3>

          {articles.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-lg">📭 No articles yet</p>
              <p className="text-sm">Explore content from authors</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
              {articles.map((article) => (
                <div
                  key={article._id}
                  className="bg-white rounded-2xl shadow-md hover:shadow-xl transition duration-300 p-5 border border-gray-100 hover:-translate-y-1"
                >
                  <div className="flex flex-col h-full">

                    {/* TITLE */}
                    <p className="text-lg font-semibold text-gray-800 hover:text-indigo-600 transition">
                      {article.title}
                    </p>

                    {/* CONTENT */}
                    <p className="text-sm text-gray-500 mt-2">
                      {article.content?.slice(0, 80)}...
                    </p>

                    {/* DATE */}
                    <p className="text-xs text-gray-400 mt-2">
                      {formatDateIST(article.createdAt)}
                    </p>

                    {/* ACTION */}
                    <button
                      className="text-indigo-600 hover:text-indigo-800 text-sm font-medium mt-auto pt-4"
                      onClick={() => openArticle(article)}
                    >
                      Read →
                    </button>

                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default UserProfile;