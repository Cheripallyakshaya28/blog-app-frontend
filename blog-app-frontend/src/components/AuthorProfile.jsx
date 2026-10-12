import { NavLink, Outlet, useNavigate } from "react-router";
import { useAuth } from "../stores/authStore";

function AuthorProfile() {
  const currentUser = useAuth((state) => state.currentUser);
  const logout = useAuth((state) => state.logout);
  const navigate = useNavigate();

  const onLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">

      <div className="max-w-5xl mx-auto px-6 py-10">

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
              <p className="text-xs text-indigo-500">Author Dashboard</p>
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

        {/* NAV TABS */}
        <div className="flex gap-3 mb-8 bg-white p-2 rounded-full shadow-sm w-fit">

          <NavLink
            to="articles"
            className={({ isActive }) =>
              isActive
                ? "bg-indigo-600 text-white px-5 py-2 rounded-full text-sm font-medium shadow"
                : "text-gray-600 px-5 py-2 text-sm hover:text-indigo-600 transition"
            }
          >
            Articles
          </NavLink>

          <NavLink
            to="write-article"
            className={({ isActive }) =>
              isActive
                ? "bg-indigo-600 text-white px-5 py-2 rounded-full text-sm font-medium shadow"
                : "text-gray-600 px-5 py-2 text-sm hover:text-indigo-600 transition"
            }
          >
            Write Article
          </NavLink>

        </div>

        {/* CONTENT */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <Outlet />
        </div>

      </div>
    </div>
  );
}

export default AuthorProfile;