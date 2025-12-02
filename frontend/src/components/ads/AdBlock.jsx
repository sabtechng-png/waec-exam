import { useEffect, useRef } from "react";

export default function AdBlock({ adKey, width = 728, height = 90, id }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            loadAd();
            observer.disconnect();
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(ref.current);

    function loadAd() {
      const container = document.getElementById(id);
      if (!container) return;

      container.innerHTML = "";

      // ❗️ GLOBAL atOptions (required)
      window.atOptions = {
        key: adKey,
        format: "iframe",
        height: height,
        width: width,
        params: {},
      };

      // Load provider script
      const script = document.createElement("script");
      script.type = "text/javascript";
      script.src = `//www.highperformanceformat.com/${adKey}/invoke.js`;
      container.appendChild(script);
    }
  }, [adKey, width, height, id]);

  return (
    <div
      ref={ref}
      id={id}
      style={{
        width: "100%",
        textAlign: "center",
        margin: "20px 0",
        minHeight: height,
      }}
    ></div>
  );
}
