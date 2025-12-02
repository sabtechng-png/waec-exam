// =====================================
// useAdBlockGuard.js
// Global AdBlock detection with route + premium awareness
// =====================================

import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

// Pages that NEED ads to be enabled
const PROTECTED_PREFIXES = ["/", "/practice", "/waec", "/jamb", "/neco", "/exam", "/blog"];

// Pages that must NEVER be blocked
const EXCLUDED_PATHS = ["/login", "/register", "/ads-required"];

// Simple bait-based detection
function detectAdBlockOnce() {
  return new Promise((resolve) => {
    // If we already detected before in this session, reuse it
    if (typeof window !== "undefined" && window.__cbtMasterAdBlocked != null) {
      return resolve(window.__cbtMasterAdBlocked);
    }

    const bait = document.createElement("div");
    bait.className = "ads ad-banner ad-unit ad-wrapper ad-container advertisement";
    bait.style.position = "absolute";
    bait.style.left = "-9999px";
    document.body.appendChild(bait);

    setTimeout(() => {
      const style = window.getComputedStyle(bait);
      const blocked =
        bait.offsetParent === null ||
        bait.offsetHeight === 0 ||
        bait.offsetWidth === 0 ||
        style.display === "none" ||
        style.visibility === "hidden";

      document.body.removeChild(bait);

      if (typeof window !== "undefined") {
        window.__cbtMasterAdBlocked = blocked;
      }

      resolve(blocked);
    }, 200);
  });
}

export function useAdBlockGuard({ isPremium = false } = {}) {
  const location = useLocation();
  const [adBlocked, setAdBlocked] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Premium users: no ads, no checks
    if (isPremium) {
      setAdBlocked(false);
      setShowModal(false);
      return;
    }

    const path = location.pathname;

    // Never run on excluded routes
    if (EXCLUDED_PATHS.includes(path)) {
      setShowModal(false);
      return;
    }

    // Check if this path is a "protected" path that needs ads
    const isProtected = PROTECTED_PREFIXES.some((prefix) =>
      path === prefix || path.startsWith(prefix)
    );

    if (!isProtected) {
      setShowModal(false);
      return;
    }

    // Detect adblocker only on protected pages
    detectAdBlockOnce().then((blocked) => {
      setAdBlocked(blocked);
      setShowModal(blocked);
    });
  }, [location.pathname, isPremium]);

  return { adBlocked, showModal, setShowModal };
}
