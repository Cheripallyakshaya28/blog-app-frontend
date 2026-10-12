import {
  divider,
  errorClass,
  formCard,
  formGroup,
  formTitle,
  inputClass,
  labelClass,
  pageBackground,
  submitBtn,
  mutedText,
} from "../styles/common";

import { useForm } from "react-hook-form";
import { NavLink, useNavigate } from "react-router";
import { useState } from "react";
import axios from "axios";

function Register() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [preview, setPreview] = useState(null);

  const navigate = useNavigate();

  // REGISTER FUNCTION
  const onUserRegister = async (userObj) => {
    try {
      setLoading(true);
      setApiError(null);

      const formData = new FormData();

      formData.append("role", userObj.role);
      formData.append("firstName", userObj.firstName);
      formData.append("lastName", userObj.lastName || "");
      formData.append("email", userObj.email);
      formData.append("password", userObj.password);

      // image
      if (userObj.profileImageUrl?.[0]) {
        formData.append("profileImageUrl", userObj.profileImageUrl[0]);
      }

     const BASE_URL =
       import.meta.env.VITE_API_URL ||
       (import.meta.env.PROD
         ? "https://blogapp-h3ux.onrender.com"
         : "http://localhost:4000");

const res = await axios.post(
  `${BASE_URL}/auth/users`,  
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (res.status === 201) {
        navigate("/login");
      }

    } catch (err) {
      console.log("Registration error:", err);
      setApiError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${pageBackground} flex items-center justify-center py-16 px-4`}>
      <div className={formCard}>
        <h2 className={formTitle}>Create an Account</h2>

        {apiError && <p className={errorClass}>{apiError}</p>}

        <form onSubmit={handleSubmit(onUserRegister)}>

          {/* ROLE */}
          <div className="mb-5">
            <p className={labelClass}>Register as</p>

            <div className="flex gap-6 mt-1">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="USER"
                  {...register("role", { required: "Select role" })}
                />
                <span>User</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="AUTHOR"
                  {...register("role", { required: "Select role" })}
                />
                <span>Author</span>
              </label>
            </div>

            {errors.role && <p className={errorClass}>{errors.role.message}</p>}
          </div>

          <div className={divider} />

          {/* NAME */}
          <div className="sm:flex gap-4 mb-4">
            <div className="flex-1">
              <label className={labelClass}>First Name</label>
              <input
                className={inputClass}
                {...register("firstName", { required: "First name required" })}
              />
              {errors.firstName && <p className={errorClass}>{errors.firstName.message}</p>}
            </div>

            <div className="flex-1">
              <label className={labelClass}>Last Name</label>
              <input className={inputClass} {...register("lastName")} />
            </div>
          </div>

          {/* EMAIL */}
          <div className={formGroup}>
            <label className={labelClass}>Email</label>
            <input
              type="email"
              className={inputClass}
              {...register("email", { required: "Email required" })}
            />
            {errors.email && <p className={errorClass}>{errors.email.message}</p>}
          </div>

          {/* PASSWORD */}
          <div className={formGroup}>
            <label className={labelClass}>Password</label>
            <input
              type="password"
              className={inputClass}
              {...register("password", { required: "Password required" })}
            />
            {errors.password && <p className={errorClass}>{errors.password.message}</p>}
          </div>

          {/* ✅ PROFILE IMAGE */}
          <div className={formGroup}>
            <label className={labelClass}>Profile Image</label>

            <input
              type="file"
              className={inputClass}
              accept="image/png, image/jpeg"
              {...register("profileImageUrl", {
                validate: {
                  fileType: (files) => {
                    if (!files?.[0]) return true;
                    return ["image/png", "image/jpeg"].includes(files[0].type) || "Only JPG/PNG allowed";
                  },
                  fileSize: (files) => {
                    if (!files?.[0]) return true;
                    return files[0].size <= 2 * 1024 * 1024 || "Max size 2MB";
                  },
                },
              })}
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  setPreview(URL.createObjectURL(file));
                }
              }}
            />

            {errors.profileImageUrl && (
              <p className={errorClass}>{errors.profileImageUrl.message}</p>
            )}

            {/* PREVIEW */}
            {preview && (
              <div className="mt-3 flex justify-center">
                <img
                  src={preview}
                  alt="preview"
                  className="w-24 h-24 rounded-full object-cover"
                />
              </div>
            )}
          </div>

          {/* SUBMIT */}
          <button type="submit" className={submitBtn} disabled={loading}>
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>

        <p className={`${mutedText} text-center mt-5`}>
          Already have an account?{" "}
          <NavLink to="/login" className="text-[#0066cc]">
            Sign in
          </NavLink>
        </p>
      </div>
    </div>
  );
}

export default Register;
