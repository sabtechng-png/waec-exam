import { useEffect } from "react";

export default function ResponsiveAdsterraBanner() {
  useEffect(() => {
    const screenWidth = window.innerWidth;

    let script1 = document.createElement("script");
    let script2 = document.createElement("script");
    let configScript = document.createElement("script");

    // MOBILE (two ads)
    if (screenWidth < 600) {
      configScript.innerHTML = `
        atOptions = {
          'key' : '745d5c41636d54892202751ec572cf25',
          'format' : 'iframe',
          'height' : 250,
          'width' : 300,
          'params' : {}
        };
      `;

      script1.src =
        "//www.highperformanceformat.com/745d5c41636d54892202751ec572cf25/invoke.js";
      script2.src =
        "//www.highperformanceformat.com/745d5c41636d54892202751ec572cf25/invoke.js";
    }

    // TABLET (two ads)
    else if (screenWidth >= 600 && screenWidth < 1024) {
      configScript.innerHTML = `
        atOptions = {
          'key' : '36b8963e6342f147f020281c99c2e8dd',
          'format' : 'iframe',
          'height' : 60,
          'width' : 468,
          'params' : {}
        };
      `;

      script1.src =
        "//www.highperformanceformat.com/36b8963e6342f147f020281c99c2e8dd/invoke.js";
      script2.src =
        "//www.highperformanceformat.com/36b8963e6342f147f020281c99c2e8dd/invoke.js";
    }

    // DESKTOP (one ad)
    else {
      configScript.innerHTML = `
        atOptions = {
          'key' : 'efd800066af5754002a75671dd92ec61',
          'format' : 'iframe',
          'height' : 90,
          'width' : 728,
          'params' : {}
        };
      `;

      script1.src =
        "//www.highperformanceformat.com/efd800066af5754002a75671dd92ec61/invoke.js";

      script2 = null; // desktop only has ONE ad
    }

    document.getElementById("ad-container").appendChild(configScript);
    document.getElementById("ad-container").appendChild(script1);

    if (script2) {
      // insert second ad if needed
      let secondContainer = document.getElementById("ad-container-2");
      secondContainer.appendChild(script2.cloneNode(true));
    }
  }, []);

  return (
    <div style={{ width: "100%", textAlign: "center" }}>
      <div id="ad-container" style={{ marginBottom: "15px" }}></div>
      <div id="ad-container-2"></div>
    </div>
  );
}
