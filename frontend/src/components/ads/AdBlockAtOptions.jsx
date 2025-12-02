import { useEffect } from "react";

export default function AdBlockAtOptions({ adKey, width = 728, height = 90, id }) {
  useEffect(() => {
    const container = document.getElementById(id);
    if (!container) return;

    container.innerHTML = "";

    // Set global atOptions (required by provider)
    window.atOptions = {
      key: adKey,
      format: "iframe",
      height: height,
      width: width,
      params: {},
    };

    // Load the provider's script
    const script = document.createElement("script");
    script.src = `//www.highperformanceformat.com/${adKey}/invoke.js`;
    script.type = "text/javascript";

    container.appendChild(script);
  }, [adKey, width, height, id]);

  return (
    <div
      id={id}
      style={{ width: "100%", textAlign: "center", margin: "20px 0" }}
    ></div>
  );
}
