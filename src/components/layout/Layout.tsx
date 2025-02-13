import { ReactNode } from "react";
import Navbar from "./Navbar";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-orange-50">
      <Navbar />
      <main className="pt-16">{children}</main>
    </div>
  );
};

export default Layout;
