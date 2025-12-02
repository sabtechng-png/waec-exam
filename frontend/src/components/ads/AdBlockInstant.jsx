import { useEffect } from "react";

export default function AdBlockInstant({ adKey, width = 728, height = 90, id }) {
  useEffect(() => {
    const container = document.getElementById(id);
    if (!container) return;

    container.innerHTML = "";

    // GLOBAL atOptions is required
    window.atOptions = {
      key: adKey,
      format: "iframe",
      height: height,
      width: width,
      params: {},
    };

    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = `//www.highperformanceformat.com/${adKey}/invoke.js`;
    container.appendChild(script);
  }, [adKey, width, height, id]);

  return (
    <div
      id={id}
      style={{ width: "100%", textAlign: "center", margin: "20px 0" }}
    ></div>
  );
}
