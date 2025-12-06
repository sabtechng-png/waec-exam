import { useEffect } from "react";

export default function SingleAdsterraInject() {
  useEffect(() => {
    // Insert adOptions config
    const optionsScript = document.createElement("script");
    optionsScript.type = "text/javascript";
    optionsScript.innerHTML = `
      atOptions = {
        'key' : '7629fe5e49451bb53832ffbd53cdf300',
        'format' : 'iframe',
        'height' : 50,
        'width' : 320,
        'params' : {}
      };
    `;

    // Insert ad script
    const adScript = document.createElement("script");
    adScript.type = "text/javascript";
    adScript.src =
      "//www.highperformanceformat.com/7629fe5e49451bb53832ffbd53cdf300/invoke.js";

    const container = document.getElementById("faq-ad-container");

    if (container) {
      container.appendChild(optionsScript);
      container.appendChild(adScript);
    }
  }, []);

  return <div id="faq-ad-container" style={{ textAlign: "center", marginTop: 20 }} />;
}
