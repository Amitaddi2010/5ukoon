import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export function CustomCursor() {
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  
  // Create a style element to hide the default cursor globally
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      * { cursor: none !important; }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  const springConfig = { damping: 25, stiffness: 400, mass: 0.2 };
  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    setIsTouchDevice(isTouch);
    if (isTouch) return;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const interactive = target.closest(
        'a, button, [data-cursor-hover], input, textarea, select, [role="button"], label[for]'
      );
      setIsHovering(!!interactive);
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);
    document.addEventListener("mouseover", handleMouseOver);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      document.removeEventListener("mouseover", handleMouseOver);
    };
  }, [mouseX, mouseY, isVisible]);

  if (isTouchDevice) return null;

  return (
    <motion.div
      className="fixed top-0 left-0 pointer-events-none mix-blend-screen"
      style={{
        x: cursorX,
        y: cursorY,
        zIndex: 99999,
        opacity: isVisible ? 1 : 0,
        transition: "opacity 0.2s"
      }}
    >
      <motion.div
        animate={{
          width: isHovering ? 64 : 24,
          height: isHovering ? 64 : 24,
          backgroundColor: isHovering ? "rgba(68, 205, 43, 0.2)" : "rgba(255, 255, 255, 0.4)",
          filter: isHovering ? "blur(12px)" : "blur(4px)",
        }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        style={{
          borderRadius: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />
      {/* Inner sharp dot */}
      <motion.div
        animate={{
          scale: isHovering ? 0 : 1,
          opacity: isHovering ? 0 : 1,
        }}
        transition={{ duration: 0.2 }}
        className="absolute top-0 left-0 w-1.5 h-1.5 bg-white rounded-full"
        style={{ transform: "translate(-50%, -50%)" }}
      />
    </motion.div>
  );
}
