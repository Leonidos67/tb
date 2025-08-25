import { Outlet } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";

const BaseLayout = () => {
  return (
    <>
      <Outlet />
      <Toaster />
    </>
  );
};

export default BaseLayout;
