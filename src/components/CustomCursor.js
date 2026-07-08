'use client';

import { useEffect, useRef } from 'react';

export default function CustomCursor() {
  const cursorRef = useRef(null);
  const cursorDotRef = useRef(null);

  useEffect(() => {
    const handleMouseHover = (e) => {
      const target = e.target.closest('a, button, [role="button"], input, textarea, .tilt-card');
      if (target) {
        document.body.classList.add('hover-link');
      } else {
        document.body.classList.remove('hover-link');
      }
    };

    document.addEventListener('mouseover', handleMouseHover);
    return () => {
      document.removeEventListener('mouseover', handleMouseHover);
    };
  }, []);

  useEffect(() => {
    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;
    const inertiaSpeed = 0.12;

    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (cursorDotRef.current) {
        cursorDotRef.current.style.left = `${mouseX}px`;
        cursorDotRef.current.style.top = `${mouseY}px`;
      }
    };

    const updateCursor = () => {
      const dx = mouseX - cursorX;
      const dy = mouseY - cursorY;

      cursorX += dx * inertiaSpeed;
      cursorY += dy * inertiaSpeed;

      if (cursorRef.current) {
        cursorRef.current.style.left = `${cursorX}px`;
        cursorRef.current.style.top = `${cursorY}px`;
      }

      requestAnimationFrame(updateCursor);
    };

    document.addEventListener('mousemove', handleMouseMove);
    const animId = requestAnimationFrame(updateCursor);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <>
      <div
        ref={cursorRef}
        id="custom-cursor"
        className="fixed top-0 left-0 w-8 h-8 border-[1.5px] border-accent rounded-full pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 mix-blend-difference hidden lg:block"
      />
      <div
        ref={cursorDotRef}
        id="custom-cursor-dot"
        className="fixed top-0 left-0 w-1.5 h-1.5 bg-accent rounded-full pointer-events-none z-[10000] -translate-x-1/2 -translate-y-1/2 hidden lg:block"
      />
    </>
  );
}
