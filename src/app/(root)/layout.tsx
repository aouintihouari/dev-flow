import React from "react";

import Navbar from "@/components/navigation/navbar";

const RouteLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main>
      <Navbar />
      {children}
    </main>
  );
};

export default RouteLayout;
