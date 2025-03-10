import { Outlet, Navigate } from "react-router-dom";
import { useUserContext } from "@/context/AuthContext";

import Topbar from "@/components/shared/home/Topbar";
import Bottombar from "@/components/shared/home/Bottombar";
import LeftSidebar from "@/components/shared/home/LeftSidebar";

const RootLayout = () => {
  const { isAuthenticated, isLoading } = useUserContext();

  if (isLoading) return <p>Loading...</p>; // Optional loading state

  return isAuthenticated ? (
    <div className="w-full md:flex">
      <Topbar />
      <LeftSidebar />

      <section className="flex flex-1 h-full">
        <Outlet />
      </section>

      <Bottombar />
    </div>
  ) : (
    <Navigate to="/sign-in" replace />
  );
};

export default RootLayout;
