import { useEffect, useRef } from "react";

export default function AdBlockRaw({ scriptSrc, containerId }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;

    // Clear container
    ref.current.innerHTML = "";

    // Remove old scripts
    const old = document.querySelectorAll(`script[data-ad="${containerId}"]`);
    old.forEach((s) => s.remove());

    // Create new script
    const script = document.createElement("script");
    script.src = scriptSrc;
    script.async = true;
    script.setAttribute("data-ad", containerId);

    // Insert after DOM settles
    const timeout = setTimeout(() => {
      document.body.appendChild(script);
    }, 30);

    return () => clearTimeout(timeout);
  }, [scriptSrc, containerId]);

  return (
    <div
      id={containerId}
      ref={ref}
      style={{ width: "100%", minHeight: "50px" }}
    />
  );
}
