import { useEffect, useRef, useCallback } from 'react';

/**
 * useInfiniteScrolling Hook
 * 
 * Replaces the original Blaze infiniteScrolling mixin with a React hook.
 * This hook provides infinite scrolling functionality with:
 * - Scroll event handling
 * - Peak anticipation for smooth loading
 * - Configurable threshold and callbacks
 * 
 * Original Blaze mixin had:
 * - Scroll event handling
 * - Peak anticipation (200px)
 * - Next peak management
 * - Parent component communication
 */
const useInfiniteScrolling = ({
  onReachNextPeak,
  threshold = 200,
  enabled = true,
  containerRef = null,
}) => {
  const nextPeakRef = useRef(Infinity);
  const scrollHandlerRef = useRef(null);

  const setNextPeak = useCallback((value) => {
    nextPeakRef.current = value;
  }, []);

  const getNextPeak = useCallback(() => {
    return nextPeakRef.current;
  }, []);

  const resetNextPeak = useCallback(() => {
    nextPeakRef.current = Infinity;
  }, []);

  const handleScroll = useCallback((event) => {
    if (!enabled || !onReachNextPeak) return;

    const domElement = event.currentTarget;
    const scrollTop = domElement.scrollTop;
    const offsetHeight = domElement.offsetHeight;
    const altitude = scrollTop + offsetHeight + threshold;

    if (altitude >= nextPeakRef.current) {
      onReachNextPeak();
    }
  }, [enabled, onReachNextPeak, threshold]);

  // Set up scroll event listener
  useEffect(() => {
    if (!enabled) return;

    const element = containerRef?.current || window;
    scrollHandlerRef.current = handleScroll;

    element.addEventListener('scroll', scrollHandlerRef.current, { passive: true });

    return () => {
      if (scrollHandlerRef.current) {
        element.removeEventListener('scroll', scrollHandlerRef.current);
      }
    };
  }, [enabled, handleScroll, containerRef]);

  return {
    setNextPeak,
    getNextPeak,
    resetNextPeak,
  };
};

export default useInfiniteScrolling;
