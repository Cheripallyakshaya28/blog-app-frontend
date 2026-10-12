import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router";
import { useAuth } from "../stores/authStore";

import {
  articleCardClass,
  articleTitle,
  articleExcerpt,
  articleMeta,
  ghostBtn,
  loadingClass,
  errorClass,
  emptyStateClass,
  articleStatusActive,
  articleStatusDeleted,
} from "../styles/common";

function AuthorArticles() {
  const navigate = useNavigate();
  const user = useAuth((state) => state.currentUser);

  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  //BASE URL
  const BASE_URL =
    import.meta.env.VITE_API_URL ||
    (import.meta.env.PROD
      ? "https://blogapp-h3ux.onrender.com"
      : "http://localhost:4000");

  useEffect(() => {
    if (!user) return;

    const getAuthorArticles = async () => {
      try {
        setLoading(true);

        const res = await axios.get(
          `${BASE_URL}/author-api/articles`,
          { withCredentials: true }
        );

        if (res.status === 200) {
          setArticles(res.data.payload || []);
        }
      } catch (err) {
        console.log(err);

        if (err.response?.status === 401) {
          setError("Please login again");
        } else {
          setError("Failed to fetch articles");
        }
      } finally {
        setLoading(false);
      }
    };

    getAuthorArticles();
  }, [user, BASE_URL]);

  const openArticle = (article) => {
    if (!article?._id) return;
    navigate(`/article/${article._id}`, {
      state: article,
    });
  };

  if (loading) return <p className={loadingClass}>Loading articles...</p>;
  if (error) return <p className={errorClass}>{error}</p>;

  if (articles.length === 0) {
    return (
      <div className={emptyStateClass}>
        You haven't published any articles yet.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {articles.map((article) => (
        <div
          key={article._id}
          className={`${articleCardClass} relative flex flex-col`}
        >
          {/* Status Badge */}
          <span
            className={
              article.isArticleActive
                ? articleStatusActive
                : articleStatusDeleted
            }
          >
            {article.isArticleActive ? "ACTIVE" : "DELETED"}
          </span>
          <div className="flex flex-col gap-2">
            <p className={articleMeta}>{article.category}</p>
            <p className={articleTitle}>{article.title}</p>
            <p className={articleExcerpt}>
              {article.content?.slice(0, 60)}...
            </p>
          </div>
          <button className={`${ghostBtn} mt-auto pt-4`}onClick={() => openArticle(article)}>
            Read Article →
          </button>
        </div>
      ))}
    </div>
  );
}

export default AuthorArticles;