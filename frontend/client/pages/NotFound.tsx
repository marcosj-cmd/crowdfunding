import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="container py-16">
      <div className="text-center max-w-lg mx-auto">
        <h1 className="text-5xl font-extrabold mb-4">404</h1>
        <p className="text-lg text-muted-foreground mb-6">Oops! Page not found</p>
        <a href="/" className="text-sm font-medium text-foreground underline underline-offset-4">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
