import React from "react";

export default function SafeAd({ src, width = "100%", height = 90 }) {
  return (
    <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
      <iframe
        src={src}
        width={width}
        height={height}
        style={{
          border: "none",
          overflow: "hidden",
          display: "block",
        }}
        frameBorder="0"
        scrolling="no"
        title="safe-ad-iframe"
      ></iframe>
    </div>
  );
}
