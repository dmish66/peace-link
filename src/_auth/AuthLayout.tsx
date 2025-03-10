import { Outlet, Navigate } from "react-router-dom";
import { useUserContext } from "@/context/AuthContext";

export default function AuthLayout() {
  const { isAuthenticated, isLoading } = useUserContext();

  if (isLoading) return <p>Loading...</p>; // Show a loading state

  return isAuthenticated ? (
    <Navigate to="/" replace /> // Redirect logged-in users to Home
  ) : (
    <>
      <section className="flex flex-1 justify-center items-center flex-col py-10">
        <Outlet /> {/* Show login/signup pages */}
      </section>

      <img
        src="/assets/images/side-img.svg"
        alt="logo"
        className="hidden xl:block h-screen w-1/2 object-cover bg-no-repeat"
      />
    </>
  );
}
