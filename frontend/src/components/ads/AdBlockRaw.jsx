import { useEffect } from "react";

export default function AdBlockRaw({ scriptSrc, containerId }) {
  useEffect(() => {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = "";

    // Inject the script exactly as provider requires
    const script = document.createElement("script");
    script.async = true;
    script.src = scriptSrc;

    container.appendChild(script);
  }, [scriptSrc, containerId]);

  return (
    <div
      id={containerId}
      style={{ width: "100%", textAlign: "center", margin: "20px 0" }}
    ></div>
  );
}
