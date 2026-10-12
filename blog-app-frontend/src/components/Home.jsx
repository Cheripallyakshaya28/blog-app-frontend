import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router";

function Home() {
  const navigate = useNavigate();

  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const BASE_URL =
    import.meta.env.VITE_API_URL ||
    (import.meta.env.PROD
      ? "https://blogapp-h3ux.onrender.com"
      : "http://localhost:4000");

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${BASE_URL}/user-api/articles`,
          { withCredentials: true }
        );

        if (res.status === 200) {
          setArticles((res.data.payload || []).slice(0, 4));
        }
      } catch (err) {
        console.log(err);
        setError("Failed to load articles");
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [BASE_URL]);

  const openArticle = (article) => {
    if (!article?._id) return;
    navigate(`/article/${article._id}`, {
      state: article,
    });
  };

  const goToAllArticles = () => {
    navigate("/user-profile");
  };

  if (loading)
    return (
      <p className="text-center text-gray-500 py-10">Loading...</p>
    );

  if (error)
    return (
      <p className="text-center text-red-500 py-10">{error}</p>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">

      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* HERO */}
        <div className="text-center mb-14">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Welcome to <span className="text-indigo-600">MyBlog</span>
          </h1>

          <p className="text-gray-500 max-w-xl mx-auto">
            Discover insightful articles on technology, programming, AI, and more.
          </p>

          <button
            onClick={goToAllArticles}
            className="mt-6 bg-indigo-600 text-white px-6 py-2 rounded-full hover:bg-indigo-700 transition shadow-md"
          >
            Explore Articles
          </button>
        </div>

        {/* ARTICLES */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">
              Latest Articles
            </h2>

            <button
              onClick={goToAllArticles}
              className="text-sm text-indigo-600 hover:underline"
            >
              View All →
            </button>
          </div>

          {articles.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-lg">📭 No articles yet</p>
              <p className="text-sm">Be the first to explore content</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
              {articles.map((article) => (
                <div
                  key={article._id}
                  className="bg-white rounded-2xl shadow-md hover:shadow-xl transition duration-300 p-5 border border-gray-100 hover:-translate-y-1"
                >
                  <div className="flex flex-col h-full">

                    {/* CATEGORY */}
                    <p className="text-xs text-indigo-500 mb-1 capitalize">
                      {article.category}
                    </p>

                    {/* TITLE */}
                    <p className="text-lg font-semibold text-gray-800 hover:text-indigo-600 transition">
                      {article.title}
                    </p>

                    {/* CONTENT */}
                    <p className="text-sm text-gray-500 mt-2">
                      {article.content?.slice(0, 80) || "No content"}...
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

export default Home;