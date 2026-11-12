'use client';

import { useEffect, useRef } from 'react';

export default function Cursor() {
  const puntoRef = useRef<HTMLDivElement>(null);
  const anilloRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const punto = puntoRef.current;
    const anillo = anilloRef.current;
    if (!punto || !anillo) return;

    let x = 0;
    let y = 0;
    let ax = 0; // ring position, lagging behind
    let ay = 0;
    let frame = 0;

    const mover = (e: MouseEvent) => {
      x = e.clientX;
      y = e.clientY;
      punto.style.opacity = '1';
      anillo.style.opacity = '1';
    };

    // Each frame, the dot follows the mouse directly and the ring catches up slowly
    const animar = () => {
      punto.style.transform = `translate(${x}px, ${y}px)`;
      ax += (x - ax) * 0.18;
      ay += (y - ay) * 0.18;
      anillo.style.transform = `translate(${ax}px, ${ay}px)`;
      frame = requestAnimationFrame(animar);
    };

    window.addEventListener('mousemove', mover);
    frame = requestAnimationFrame(animar);

    return () => {
      window.removeEventListener('mousemove', mover);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <>
      <div ref={anilloRef} className="cursor-anillo" aria-hidden />
      <div ref={puntoRef} className="cursor-punto" aria-hidden />
    </>
  );
}
