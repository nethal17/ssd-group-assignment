import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { apiService } from "../utils/api";

/**
 * Lands here after Google -> backend -> redirect, with our own access token in
 * the URL fragment. Reads it, strips it from the URL, then fetches the profile.
 */
export const OAuthCallback = () => {
  const navigate = useNavigate();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return; // StrictMode double-invokes effects in dev
    ran.current = true;

    const token = new URLSearchParams(window.location.hash.slice(1)).get("token");

    if (!token) {
      toast.error("Sign-in failed");
      navigate("/login", { replace: true });
      return;
    }

    localStorage.setItem("token", token);
    // Drop the token from the URL so it doesn't sit in history or get shared.
    window.history.replaceState({}, document.title, window.location.pathname);

    const loadUser = async () => {
      try {
        const { sub } = JSON.parse(atob(token.split(".")[1]));
        const { data } = await apiService.get(`/api/auth/searchUser/${sub}`);
        localStorage.setItem("user", JSON.stringify(data));
        toast.success("Signed in with Google");
        navigate("/profile", { replace: true });
      } catch {
        localStorage.removeItem("token");
        toast.error("Could not load your profile");
        navigate("/login", { replace: true });
      }
    };
    loadUser();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="w-12 h-12 mx-auto mb-4 border-t-4 border-b-4 border-green-600 rounded-full animate-spin" />
        <p className="text-gray-600">Signing you in...</p>
      </div>
    </div>
  );
};

export default OAuthCallback;
