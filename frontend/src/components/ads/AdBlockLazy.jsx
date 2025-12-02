import { useEffect, useRef } from "react";

export default function AdBlockLazy({ adKey, width = 728, height = 90, id }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadAd();
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(ref.current);

    function loadAd() {
      const el = document.getElementById(id);
      if (!el) return;

      el.innerHTML = "";

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
      el.appendChild(script);
    }
  }, [adKey, width, height, id]);

  return (
    <div
      ref={ref}
      id={id}
      style={{ width: "100%", textAlign: "center", margin: "20px 0" }}
    ></div>
  );
}
