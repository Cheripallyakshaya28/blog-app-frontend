import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router";
import {
  articleGrid,
  articleCardClass,
  articleTitle,
  articleExcerpt,
  ghostBtn,
  loadingClass,
  errorClass,
  timestampClass,
} from "../styles/common";

function Articles() {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const BASE_URL =
    import.meta.env.VITE_API_URL ||
    (import.meta.env.PROD
      ? "https://blogapp-h3ux.onrender.com"
      : "http://localhost:4000");

  // Fetch active articles
  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${BASE_URL}/user-api/articles`,
          { withCredentials: true }
        );
        if (res.status === 200) {
          setArticles(res.data.payload || []);
        }
      } catch (err) {
        console.log(err);
        setError(err.response?.data?.error || "Failed to load articles");
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, [BASE_URL]);

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  //Navigate to article page
  const openArticle = (article) => {
    navigate(`/article/${article._id}`, {
      state: article,
    });
  };
  if (loading) return <p className={loadingClass}>Loading articles...</p>;
  if (error) return <p className={errorClass}>{error}</p>;
  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <h2 className="text-2xl font-semibold mb-6">Latest Articles</h2>
      {articles.length === 0 ? (
        <p className="text-gray-500 text-center py-10">
          No articles available yet
        </p>
      ) : (
        <div className={articleGrid}>
          {articles.map((article) => (
            <div key={article._id} className={articleCardClass}>
              <div className="flex flex-col h-full">
                {/* TOP */}
                <div>
                  <p className="text-xs text-gray-500 mb-1">
                    {article.category}
                  </p>
                  <p className={articleTitle}>{article.title}</p>
                  <p className={articleExcerpt}>
                    {article.content?.slice(0, 100) || "No content"}...
                  </p>
                  <p className={`${timestampClass} mt-2`}>
                    {formatDate(article.createdAt)}
                  </p>
                </div>
                {/* ACTION */}
                <button
                  className={`${ghostBtn} mt-auto pt-4`}
                  onClick={() => openArticle(article)}
                >
                  Read Article →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
export default Articles;