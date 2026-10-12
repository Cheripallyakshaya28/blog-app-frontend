import { NavLink } from "react-router";
import { useAuth } from "../stores/authStore";

function Header() {
  const isAuthenticated = useAuth((state) => state.isAuthenticated);
  const user = useAuth((state) => state.currentUser);

  const getProfilePath = () => {
    if (!user) return "/";
    switch (user.role) {
      case "AUTHOR":
        return "/author-profile";
      case "ADMIN":
        return "/admin-profile";
      default:
        return "/user-profile";
    }
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">

        {/* LOGO */}
        <NavLink
          to="/"
          className="text-2xl font-bold text-indigo-600 tracking-wide"
        >
          MyBlog
        </NavLink>

        {/* NAV LINKS */}
        <ul className="flex items-center gap-6 text-sm font-medium">

          {/* HOME */}
          <li>
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                isActive
                  ? "text-indigo-600 border-b-2 border-indigo-600 pb-1"
                  : "text-gray-600 hover:text-indigo-600 transition"
              }
            >
              Home
            </NavLink>
          </li>

          {/* NOT LOGGED IN */}
          {!isAuthenticated && (
            <>
              <li>
                <NavLink
                  to="/register"
                  className={({ isActive }) =>
                    isActive
                      ? "text-indigo-600 border-b-2 border-indigo-600 pb-1"
                      : "text-gray-600 hover:text-indigo-600 transition"
                  }
                >
                  Register
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/login"
                  className="bg-indigo-600 text-white px-4 py-1.5 rounded-full hover:bg-indigo-700 transition"
                >
                  Login
                </NavLink>
              </li>
            </>
          )}

          {/* LOGGED IN */}
          {isAuthenticated && (
            <li className="flex items-center gap-3">

              {/* Profile Image */}
              {user?.profileImageUrl ? (
                <img
                  src={user.profileImageUrl}
                  alt="profile"
                  className="w-8 h-8 rounded-full object-cover border"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-semibold">
                  {user?.firstName?.charAt(0)?.toUpperCase()}
                </div>
              )}

              <NavLink
                to={getProfilePath()}
                className="text-gray-700 hover:text-indigo-600 transition"
              >
                {user?.firstName || "Profile"}
              </NavLink>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
}

export default Header;