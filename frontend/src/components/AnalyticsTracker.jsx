import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    if (window.gtag) {
      window.gtag("config", "G-2SKF6SRXF7", {
        page_path: location.pathname + location.search,
      });
    }
  }, [location]);

  return null;
}
