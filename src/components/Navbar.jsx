import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [showTooltip, setShowTooltip] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const premiumBlue = "text-[#3b82f6]";
  const blueBg = "bg-[#3b82f6] text-white";

  const isAdmin =
    user?.role === "admin" || user?.isAdmin === true || user?.admin === true;

  const handleAddPropertyClick = (e) => {
    if (!user) {
      e.preventDefault();
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 2500);
    }
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white/10 backdrop-blur-md border-b border-white/20 shadow-lg  top-0 left-0 w-full z-50 ">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* -------- LOGO -------- */}
          <Link
            to="/"
            className="flex items-center space-x-2"
            onClick={() => setIsMobileMenuOpen(false)}
          >
              <img src="/logo.png" className="w-16 h-auto drop-shadow-xl" />
      
          </Link>

          {/* -------- DESKTOP MENU -------- */}
          <div className={`hidden lg:flex items-center space-x-6 text-gray-900`}>

            <Link to="/" className="hover:text-[#5b7adb] hover:bg-white/30 px-2 py-1 rounded transition font-medium">
              Properties
            </Link>

            <Link to="/featured" className="hover:text-[#5b7adb] hover:bg-white/30 px-2 py-1 rounded transition font-medium">
              Featured
            </Link>

            {isAdmin && (
              <Link
                to="/admin"
                className="px-4 py-2 rounded-lg bg-white/20 border border-gray-900/20 hover:bg-[#5b7adb] hover:border-[#5b7adb] hover:text-white transition shadow-md font-medium"
              >
                Admin
              </Link>
            )}

            <Link
              to={user ? "/add-listing" : "#"}
              onClick={handleAddPropertyClick}
              className={`px-4 py-2 rounded-lg transition font-medium ${
                user
                  ? "bg-[#5b7adb] text-white hover:bg-[#4a69ca] shadow-md"
                  : "bg-gray-400/50 text-gray-600 cursor-not-allowed"
              }`}
            >
              Add Property
            </Link>

            {showTooltip && !user && (
              <div className="absolute top-16 bg-gray-900/90 px-3 py-1 rounded text-sm text-white">
                Login required
              </div>
            )}

            {/* -------- LOGGED IN -------- */}
            {user ? (
              <div className="flex items-center space-x-4">

                <Link to="/profile" className="hover:text-[#5b7adb] hover:bg-white/30 px-2 py-1 rounded transition font-medium">
                  Profile
                </Link>

                <span className="text-xs bg-[#5b7adb] text-white px-2 py-1 rounded font-medium">
                  {user.username}
                </span>

                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-lg bg-white/20 border border-gray-900/20 hover:bg-[#5b7adb] hover:border-[#5b7adb] hover:text-white transition font-medium"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="hover:text-[#5b7adb] hover:bg-white/30 px-2 py-1 rounded font-medium">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-lg bg-[#5b7adb] text-white hover:bg-[#4a69ca] border border-[#5b7adb] transition shadow-md font-medium"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* -------- MOBILE TOGGLE -------- */}
          <button
            className={`text-gray-900 lg:hidden px-3 py-2 rounded focus:outline-none`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* -------- MOBILE MENU -------- */}
      {isMobileMenuOpen && (
        <div className={`lg:hidden bg-white/10 backdrop-blur-md border-t border-white/20 p-4 space-y-3 text-gray-900`}>

          <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="block hover:text-[#5b7adb] hover:bg-white/30 p-2 rounded font-medium">
            Properties
          </Link>

          <Link to="/featured" onClick={() => setIsMobileMenuOpen(false)} className="block hover:text-[#5b7adb] hover:bg-white/30 p-2 rounded font-medium">
            Featured
          </Link>

          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block bg-white/20 border border-gray-900/20 p-2 rounded-lg mt-1 hover:bg-[#5b7adb] hover:text-white transition font-medium"
            >
              Admin
            </Link>
          )}

          <Link
            to={user ? "/add-listing" : "#"}
            onClick={handleAddPropertyClick}
            className={`block p-2 rounded-lg mt-1 font-medium ${
              user
                ? "bg-[#5b7adb] text-white hover:bg-[#4a69ca]"
                : "bg-gray-400/50 text-gray-600 cursor-not-allowed"
            }`}
          >
            Add Property
          </Link>

          {user ? (
            <>
              <Link
                to="/profile"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block hover:text-[#5b7adb] hover:bg-white/30 p-2 rounded font-medium"
              >
                Profile
              </Link>

              <div className="text-xs bg-[#5b7adb] text-white px-2 py-1 rounded mt-1 font-medium">
                {user.username}
              </div>

              <button
                onClick={handleLogout}
                className="block w-full text-left bg-white/20 border border-gray-900/20 p-2 rounded-lg mt-2 hover:bg-[#5b7adb] hover:text-white transition font-medium"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block hover:text-[#5b7adb] hover:bg-white/30 p-2 rounded font-medium"
              >
                Login
              </Link>

              <Link
                to="/register"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block bg-[#5b7adb] text-white p-2 rounded-lg mt-1 hover:bg-[#4a69ca] border border-[#5b7adb] transition font-medium"
              >
                Register
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}