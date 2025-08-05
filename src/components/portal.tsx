"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface PortalProps {
  children: React.ReactNode;
  containerId?: string;
}

export function Portal({ children, containerId = "portal-root" }: PortalProps) {
  const [mounted, setMounted] = useState(false);
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    // Check if we're in the browser
    if (typeof window === "undefined") return;

    let container = document.getElementById(containerId);
    
    // Create the container if it doesn't exist
    if (!container) {
      container = document.createElement("div");
      container.id = containerId;
      container.style.position = "relative";
      container.style.zIndex = "9999";
      document.body.appendChild(container);
    }

    setPortalContainer(container);
    setMounted(true);

    // Cleanup function
    return () => {
      // Only remove if we created it and it's empty
      if (container && container.children.length === 0 && container.id === containerId) {
        document.body.removeChild(container);
      }
    };
  }, [containerId]);

  // Don't render anything on the server or before mounting
  if (!mounted || !portalContainer) {
    return null;
  }

  return createPortal(children, portalContainer);
}