import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router";
import { useEffect } from "react";
import axios from "axios";

import {
  formCard,
  formTitle,
  formGroup,
  labelClass,
  inputClass,
  submitBtn,
  errorClass,
} from "../styles/common";

function EditArticle() {
  const BASE_URL =
    import.meta.env.VITE_API_URL ||
    (import.meta.env.PROD
      ? "https://blogapp-h3ux.onrender.com"
      : "http://localhost:4000");

  const location = useLocation();
  const navigate = useNavigate();

  const article = location.state;

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  //Prefill form
  useEffect(() => {
    if (!article) return;

    setValue("title", article.title);
    setValue("category", article.category);
    setValue("content", article.content);
  }, [article, setValue]);

  //If user directly opens page without state
  useEffect(() => {
    if (!article) {
      navigate("/");
    }
  }, [article, navigate]);

  // Update article
  const updateArticle = async (modifiedArticle) => {
    try {
      modifiedArticle.articleId = article._id;

      const res = await axios.put(
        `${BASE_URL}/author-api/articles`,
        modifiedArticle,
        { withCredentials: true }
      );

      if (res.status === 200) {
        navigate(`/article/${article._id}`, {
          state: res.data.payload,
        });
      }
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.message || "Update failed");
    }
  };

  return (
    <div className={`${formCard} mt-10`}>
      <h2 className={formTitle}>Edit Article</h2>

      <form onSubmit={handleSubmit(updateArticle)}>
        
        {/* TITLE */}
        <div className={formGroup}>
          <label className={labelClass}>Title</label>

          <input
            className={inputClass}
            {...register("title", { required: "Title is required" })}
          />

          {errors.title && (
            <p className={errorClass}>{errors.title.message}</p>
          )}
        </div>

        {/* CATEGORY */}
        <div className={formGroup}>
          <label className={labelClass}>Category</label>

          <select
            className={inputClass}
            {...register("category", { required: "Category is required" })}
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

        {/* CONTENT */}
        <div className={formGroup}>
          <label className={labelClass}>Content</label>

          <textarea
            rows="12"
            className={inputClass}
            {...register("content", {
              required: "Content is required",
            })}
          />

          {errors.content && (
            <p className={errorClass}>{errors.content.message}</p>
          )}
        </div>

        {/* SUBMIT */}
        <button className={submitBtn}>Update Article</button>
      </form>
    </div>
  );
}

export default EditArticle;