import { Outlet } from "react-router-dom";

import Topbar from "@/components/shared/home/Topbar";
import Bottombar from "@/components/shared/home/Bottombar";
import LeftSidebar from "@/components/shared/home/LeftSidebar";

const RootLayout = () => {
  return (
    <div className="w-full md:flex">
      <Topbar />
      <LeftSidebar />

      <section className="flex flex-1 h-full">
        <Outlet />
      </section>

      <Bottombar />
    </div>
  );
};

export default RootLayout;