import { useState, useEffect, RefObject } from 'react';
import { LEADERBOARD_WIDTH } from '@/constants';

export function useLeaderboardInteraction(
  containerRef: RefObject<HTMLDivElement | null>,
  backgroundPosition: { x: number; y: number } | undefined,
  backgroundImage: string | undefined,
  onPositionChange: (pos: { x: number; y: number }) => void
) {
  const [scaleFactor, setScaleFactor] = useState(0.5);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialPos, setInitialPos] = useState({ x: 0, y: 0 });

  // --- Scale Calculation ---
  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        const newScale = width / LEADERBOARD_WIDTH;
        setScaleFactor(newScale);
      }
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, [containerRef]);

  // --- Dragging Handlers ---
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!backgroundImage) return;
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setInitialPos(backgroundPosition || { x: 0, y: 0 });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    
    const deltaX = (e.clientX - dragStart.x) / scaleFactor;
    const deltaY = (e.clientY - dragStart.y) / scaleFactor;
    
    onPositionChange({
      x: initialPos.x + deltaX,
      y: initialPos.y + deltaY
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging) setIsDragging(false);
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, [isDragging]);

  return { scaleFactor, isDragging, handleMouseDown, handleMouseMove, handleMouseUp };
}
