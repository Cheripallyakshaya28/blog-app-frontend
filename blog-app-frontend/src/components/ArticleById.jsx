import { useParams, useLocation, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../stores/authStore";
import { useForm } from "react-hook-form";
import {
  articlePageWrapper,
  articleHeader,
  articleCategory,
  articleMainTitle,
  articleAuthorRow,
  authorInfo,
  articleContent,
  articleFooter,
  articleActions,
  editBtn,
  deleteBtn,
  loadingClass,
  errorClass,
  inputClass,
  commentsWrapper,
  commentCard,
  commentHeader,
  commentUserRow,
  avatar,
  commentUser,
  commentTime,
  commentText,
} from "../styles/common.js";
function ArticleByID() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { register, handleSubmit } = useForm();
  const user = useAuth((state) => state.currentUser);
  const [article, setArticle] = useState(location.state || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // BASE URL
  const BASE_URL =
    import.meta.env.VITE_API_URL ||
    (import.meta.env.PROD
      ? "https://blogapp-h3ux.onrender.com"
      : "http://localhost:4000");

  useEffect(() => {
    if (article) return;
    const getArticle = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${BASE_URL}/user-api/article/${id}`,
          { withCredentials: true }
        );
        setArticle(res.data.payload);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to load article");
      } finally {
        setLoading(false);
      }
    };
    getArticle();
  }, [id, BASE_URL, article]);

  const formatDate = (date) => {
    return new Date(date).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  // Delete / Restore
  const toggleArticleStatus = async () => {
    const newStatus = !article.isArticleActive;
    if (!window.confirm(newStatus ? "Restore this article?" : "Delete this article?")) return;
    try {
      const res = await axios.patch(
        `${BASE_URL}/author-api/articles`,
        { articleId: article._id, isArticleActive: newStatus },
        { withCredentials: true }
      );
      setArticle(res.data.payload);
    } catch (err) {
      setError(err.response?.data?.message || "Operation failed");
    }
  };

  //Edit
  const editArticle = (articleObj) => {
    navigate("/edit-article", { state: articleObj });
  };

  // Add comment
  const addComment = async (commentObj) => {
    commentObj.articleId = article._id;
    try {
      const res = await axios.put(
        `${BASE_URL}/user-api/articles`,
        commentObj,
        { withCredentials: true }
      );
      if (res.status === 200) {
        setArticle(res.data.payload);
      }
    } catch {
      setError("Failed to add comment");
    }
  };
  if (loading) return <p className={loadingClass}>Loading article...</p>;
  if (error) return <p className={errorClass}>{error}</p>;
  if (!article) return null;
  return (
    <div className={articlePageWrapper}>
      <div className={articleHeader}>
        <span className={articleCategory}>{article.category}</span>
        <h1 className={`${articleMainTitle} uppercase`}>{article.title}</h1>
        <div className={articleAuthorRow}>
          <div className={authorInfo}>✍️ {user?.role}</div>
          <div>{formatDate(article.createdAt)}</div>
        </div>
      </div>
      <div className={articleContent}>{article.content}</div>
      {user?.role === "AUTHOR" && (
        <div className={articleActions}>
          <button className={editBtn} onClick={() => editArticle(article)}>
            Edit
          </button>
          <button className={deleteBtn} onClick={toggleArticleStatus}>
            {article.isArticleActive ? "Delete" : "Restore"}
          </button>
        </div>
      )}
      {user?.role === "USER" && (
        <div className={articleActions}>
          <form onSubmit={handleSubmit(addComment)}>
            <input
              type="text"
              {...register("comment")}
              className={inputClass}
              placeholder="Write your comment here..."
            />
            <button className="bg-amber-600 text-white px-5 py-2 rounded-2xl mt-5">
              Add comment
            </button>
          </form>
        </div>
      )}
      <div className={commentsWrapper}>
        {article.comments?.length === 0 && (
          <p className="text-[#a1a1a6] text-sm text-center">No comments yet</p>
        )}
        {article.comments?.map((commentObj, index) => {
          const name = commentObj.user?.email || "User";
          const firstLetter = name.charAt(0).toUpperCase();
          return (
            <div key={index} className={commentCard}>
              <div className={commentHeader}>
                <div className={commentUserRow}>
                  <div className={avatar}>{firstLetter}</div>
                  <div>
                    <p className={commentUser}>{name}</p>
                    <p className={commentTime}>
                      {formatDate(commentObj.createdAt || new Date())}
                    </p>
                  </div>
                </div>
              </div>
              <p className={commentText}>{commentObj.comment}</p>
            </div>
          );
        })}
      </div>
      <div className={articleFooter}>
        Last updated: {formatDate(article.updatedAt)}
      </div>
    </div>
  );
}

export default ArticleByID;