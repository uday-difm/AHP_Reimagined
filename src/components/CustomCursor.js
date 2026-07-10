'use client';

import { useEffect, useRef } from 'react';

// Persist mouse position globally so that the cursor doesn't jump to (0,0) on page/tab navigation remounts
let globalMousePosition = { x: 0, y: 0 };
let globalHasMoved = false;

if (typeof window !== 'undefined') {
  const trackMouseGlobal = (e) => {
    globalMousePosition.x = e.clientX;
    globalMousePosition.y = e.clientY;
    globalHasMoved = true;
  };
  window.addEventListener('mousemove', trackMouseGlobal);
}

export default function CustomCursor() {
  const cursorRef = useRef(null);
  const cursorDotRef = useRef(null);

  useEffect(() => {
    // Disable cursor if user prefers reduced motion or is on a touch device
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    if (prefersReducedMotion || isTouchDevice) {
      return;
    }

    const handleMouseHover = (e) => {
      const target = e.target.closest('a, button, [role="button"], input, textarea, .tilt-card');
      if (cursorRef.current) {
        if (target) {
          cursorRef.current.classList.add('custom-cursor-hover');
        } else {
          cursorRef.current.classList.remove('custom-cursor-hover');
        }
      }
    };

    document.addEventListener('mouseover', handleMouseHover);
    return () => {
      document.removeEventListener('mouseover', handleMouseHover);
    };
  }, []);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    if (prefersReducedMotion || isTouchDevice) {
      return;
    }

    let mouseX = globalMousePosition.x;
    let mouseY = globalMousePosition.y;
    let cursorX = globalMousePosition.x;
    let cursorY = globalMousePosition.y;
    let isLoopRunning = false;
    let animId = null;
    const inertiaSpeed = 0.12;

    const updateCursor = () => {
      const dx = mouseX - cursorX;
      const dy = mouseY - cursorY;

      // Close enough to destination - pause loop to save CPU
      if (Math.abs(dx) < 0.1 && Math.abs(dy) < 0.1) {
        cursorX = mouseX;
        cursorY = mouseY;
        if (cursorRef.current) {
          cursorRef.current.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%)`;
        }
        isLoopRunning = false;
        animId = null;
        return;
      }

      cursorX += dx * inertiaSpeed;
      cursorY += dy * inertiaSpeed;

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%)`;
      }

      animId = requestAnimationFrame(updateCursor);
    };

    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      globalMousePosition.x = mouseX;
      globalMousePosition.y = mouseY;
      globalHasMoved = true;

      if (cursorRef.current) cursorRef.current.style.opacity = '1';
      if (cursorDotRef.current) cursorDotRef.current.style.opacity = '1';

      if (cursorDotRef.current) {
        cursorDotRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
      }

      // Start rendering loop only when mouse moves
      if (!isLoopRunning) {
        isLoopRunning = true;
        animId = requestAnimationFrame(updateCursor);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);

    // Initial positioning
    if (globalHasMoved && !isLoopRunning) {
      isLoopRunning = true;
      animId = requestAnimationFrame(updateCursor);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      if (animId) cancelAnimationFrame(animId);
    };
  }, []);

  // Return markup but it stays hidden on touch/mobile devices via CSS/checks
  return (
    <>
      <div
        ref={cursorRef}
        className="custom-cursor hidden lg:block"
        style={{
          willChange: 'transform',
          transform: globalHasMoved ? `translate3d(${globalMousePosition.x}px, ${globalMousePosition.y}px, 0) translate(-50%, -50%)` : undefined,
          opacity: globalHasMoved ? 1 : 0
        }}
      />
      <div
        ref={cursorDotRef}
        className="fixed top-0 left-0 w-1.5 h-1.5 bg-accent rounded-full pointer-events-none z-[100000] -translate-x-1/2 -translate-y-1/2 hidden lg:block"
        style={{
          willChange: 'transform',
          transform: globalHasMoved ? `translate3d(${globalMousePosition.x}px, ${globalMousePosition.y}px, 0) translate(-50%, -50%)` : undefined,
          opacity: globalHasMoved ? 1 : 0
        }}
      />
    </>
  );
}

