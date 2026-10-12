import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router";

import {
  articleCardClass,
  loadingClass,
  errorClass,
  ghostBtn,
} from "../styles/common";
function AuthorsList() {
  const navigate = useNavigate();
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  //BASE URL
  const BASE_URL =
    import.meta.env.VITE_API_URL ||
    (import.meta.env.PROD
      ? "https://blogapp-h3ux.onrender.com"
      : "http://localhost:4000");

  useEffect(() => {
    const fetchAuthors = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${BASE_URL}/admin-api/authors`,
          { withCredentials: true }
        );

        if (res.status === 200) {
          setAuthors(res.data.payload || []);
        }
      } catch (err) {
        console.log(err);

        //error handling
        if (err.response?.status === 401) {
          setError("Only admin can view authors");
        } else {
          setError("Failed to load authors");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAuthors();
  }, [BASE_URL]); //dependency

  const openAuthor = (author) => {
    if (!author?._id) return;
    navigate(`/author/${author._id}`, {
      state: author,
    });
  };

  if (loading) return <p className={loadingClass}>Loading authors...</p>;
  if (error) return <p className={errorClass}>{error}</p>;

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <h2 className="text-2xl font-semibold mb-6">All Authors</h2>

      {authors.length === 0 ? (
        <p className="text-gray-500 text-center py-10">
          No authors found
        </p>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {authors.map((author) => {
            const firstLetter =
              author.firstName?.charAt(0)?.toUpperCase();

            return (
              <div key={author._id} className={articleCardClass}>
                <div className="flex flex-col items-center text-center gap-3">

                  {/* Avatar */}
                  {author.profileImageUrl ? (
                    <img
                      src={author.profileImageUrl}
                      className="w-20 h-20 rounded-full object-cover border"
                      alt="author"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xl font-semibold">
                      {firstLetter || "A"}
                    </div>
                  )}

                  {/* Name */}
                  <h3 className="text-lg font-medium">
                    {author.firstName} {author.lastName}
                  </h3>

                  {/* Email */}
                  <p className="text-sm text-gray-500">
                    {author.email}
                  </p>

                  {/* Action */}
                  <button
                    className={ghostBtn}
                    onClick={() => openAuthor(author)}
                  >
                    View Articles →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default AuthorsList;