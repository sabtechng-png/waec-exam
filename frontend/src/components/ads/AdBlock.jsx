import { useEffect, useState, useRef } from "react";

export default function AdBlockRaw({ scriptSrc, containerId, refreshInterval = 5000 }) {
  const [isLoading, setIsLoading] = useState(true);  // Track loading state
  const containerRef = useRef(null);  // Ref for the container to manage ad rendering

  useEffect(() => {
    const loadAd = () => {
      const container = containerRef.current;
      if (!container) return;

      // Clear existing ad content
      container.innerHTML = "";

      const script = document.createElement("script");
      script.async = true;
      script.src = scriptSrc;

      // Set loading state when script starts loading
      script.onload = () => setIsLoading(false);
      script.onerror = () => setIsLoading(false);  // Handle error

      container.appendChild(script);
    };

    // Initial ad load
    loadAd();

    // Refresh the ad at the specified interval
    const intervalId = setInterval(() => {
      loadAd();  // Load a new ad every refreshInterval
      setIsLoading(true);  // Set loading state while refreshing
    }, refreshInterval);

    // Cleanup on unmount
    return () => clearInterval(intervalId);
  }, [scriptSrc, refreshInterval]);  // Dependencies to trigger re-render on scriptSrc change

  return (
    <div
      id={containerId}
      ref={containerRef}  // Use ref to manage container directly
      style={{ width: "100%", textAlign: "center", margin: "20px 0" }}
    >
      {isLoading && <div>Loading ad...</div>}  {/* Loading spinner or message */}
    </div>
  );
}
