import { useForm } from "react-hook-form";
import { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router";

import {
  formCard,
  formGroup,
  labelClass,
  inputClass,
  errorClass,
  loadingClass,
} from "../styles/common";
import { useAuth } from "../stores/authStore";

function WriteArticles() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const currentUser = useAuth((state) => state.currentUser);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  //save article
  const submitArticle = async (articleObj) => {
    setLoading(true);

    articleObj.author = currentUser._id;

    try {
      const BASE_URL =
        import.meta.env.VITE_API_URL ||
        (import.meta.env.PROD
          ? "https://blogapp-h3ux.onrender.com"
          : "http://localhost:4000");

let res = await axios.post(
  `${BASE_URL}/author-api/article`,
        articleObj,
        { withCredentials: true }
      );

      if (res.status === 201) {
        toast.success("Article published successfully");
        navigate("../articles");
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to publish article");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      
      {/* HEADER */}
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
          ✍️ Write New Article
        </h2>
        <p className="text-gray-500 text-sm mt-2">
          Share your thoughts with the world
        </p>
      </div>

      {/* FORM CARD */}
      <div className={`${formCard} shadow-xl border border-gray-200`}>
        <form onSubmit={handleSubmit(submitArticle)} className="space-y-6">

          {/* Title */}
          <div className={formGroup}>
            <label className={labelClass}>Title</label>
            <input
              type="text"
              className={`${inputClass} focus:ring-2 focus:ring-blue-500`}
              placeholder="Enter article title"
              {...register("title", {
                required: "Title is required",
                minLength: {
                  value: 5,
                  message: "Title must be at least 5 characters",
                },
              })}
            />
            {errors.title && (
              <p className={errorClass}>{errors.title.message}</p>
            )}
          </div>

          {/* Category */}
          <div className={formGroup}>
            <label className={labelClass}>Category</label>
            <select
              className={`${inputClass} focus:ring-2 focus:ring-blue-500`}
              {...register("category", {
                required: "Category is required",
              })}
            >
              <option value="">Select category</option>
              <option value="technology">Technology</option>
              <option value="programming">Programming</option>
              <option value="ai">AI</option>
              <option value="web-development">Web Development</option>
            </select>
            {errors.category && (
              <p className={errorClass}>{errors.category.message}</p>
            )}
          </div>

          {/* Content */}
          <div className={formGroup}>
            <label className={labelClass}>Content</label>
            <textarea
              rows="8"
              className={`${inputClass} focus:ring-2 focus:ring-blue-500`}
              placeholder="Write your article content..."
              {...register("content", {
                required: "Content is required",
                minLength: {
                  value: 50,
                  message: "Content must be at least 50 characters",
                },
              })}
            />
            {errors.content && (
              <p className={errorClass}>{errors.content.message}</p>
            )}
          </div>

          {/* Submit */}
          <button
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition"
            type="submit"
            disabled={loading}
          >
            {loading ? "Publishing..." : " Publish Article"}
          </button>

          {loading && (
            <p className={`${loadingClass} text-center`}>
              Publishing article...
            </p>
          )}
        </form>
      </div>
    </div>
  );
}

export default WriteArticles;
