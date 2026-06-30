"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";

type InteractiveMarqueeCarouselProps = {
  children: ReactNode;
  label: string;
  tone?: "light" | "dark";
  className?: string;
  contentClassName?: string;
  step?: number;
};

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function InteractiveMarqueeCarousel({
  children,
  label,
  tone = "light",
  className,
  contentClassName,
  step = 340,
}: InteractiveMarqueeCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragStartXRef = useRef(0);
  const dragStartScrollRef = useRef(0);
  const dragDistanceRef = useRef(0);
  const interactionTimeoutRef = useRef<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) {
      return;
    }

    let animationFrame = 0;
    let previousTime = performance.now();

    const tick = (time: number) => {
      const delta = time - previousTime;
      previousTime = time;

      if (!isPaused && !isDragging) {
        const loopPoint = track.scrollWidth / 2;
        track.scrollLeft += delta * 0.035;

        if (track.scrollLeft >= loopPoint) {
          track.scrollLeft -= loopPoint;
        }
      }

      animationFrame = window.requestAnimationFrame(tick);
    };

    animationFrame = window.requestAnimationFrame(tick);

    return () => window.cancelAnimationFrame(animationFrame);
  }, [isDragging, isPaused]);

  useEffect(() => {
    return () => {
      if (interactionTimeoutRef.current) {
        window.clearTimeout(interactionTimeoutRef.current);
      }
    };
  }, []);

  function pauseTemporarily() {
    setIsPaused(true);

    if (interactionTimeoutRef.current) {
      window.clearTimeout(interactionTimeoutRef.current);
    }

    interactionTimeoutRef.current = window.setTimeout(() => {
      setIsPaused(false);
    }, 2400);
  }

  function scrollByStep(direction: "previous" | "next") {
    pauseTemporarily();
    trackRef.current?.scrollBy({
      left: direction === "next" ? step : -step,
      behavior: "smooth",
    });
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    const track = trackRef.current;
    if (!track) {
      return;
    }

    setIsDragging(true);
    setIsPaused(true);
    dragDistanceRef.current = 0;
    dragStartXRef.current = event.clientX;
    dragStartScrollRef.current = track.scrollLeft;
    track.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const track = trackRef.current;
    if (!track || !isDragging) {
      return;
    }

    const deltaX = event.clientX - dragStartXRef.current;
    dragDistanceRef.current = Math.max(dragDistanceRef.current, Math.abs(deltaX));
    track.scrollLeft = dragStartScrollRef.current - deltaX;
  }

  function handlePointerUp(event: PointerEvent<HTMLDivElement>) {
    const track = trackRef.current;
    if (track?.hasPointerCapture(event.pointerId)) {
      track.releasePointerCapture(event.pointerId);
    }

    setIsDragging(false);
    pauseTemporarily();
  }

  function handleClickCapture(event: MouseEvent<HTMLDivElement>) {
    if (dragDistanceRef.current > 8) {
      event.preventDefault();
      event.stopPropagation();
      dragDistanceRef.current = 0;
    }
  }

  const isDark = tone === "dark";

  return (
    <div className={cn("relative", className)}>
      <div
        className={cn(
          "pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r to-transparent sm:w-24",
          isDark ? "from-foreground" : "from-paper",
        )}
        aria-hidden="true"
      />
      <div
        className={cn(
          "pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l to-transparent sm:w-24",
          isDark ? "from-foreground" : "from-paper",
        )}
        aria-hidden="true"
      />

      <button
        type="button"
        onClick={() => scrollByStep("previous")}
        className={cn(
          "absolute left-2 top-1/2 z-20 grid size-10 -translate-y-1/2 place-items-center rounded-full border shadow-lg backdrop-blur-md transition hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:left-4",
          isDark
            ? "border-paper/18 bg-paper/12 text-paper hover:bg-paper/22"
            : "border-foreground/12 bg-white/60 text-foreground hover:bg-white/86",
        )}
        aria-label={`Voltar ${label}`}
      >
        <ChevronLeft size={20} aria-hidden="true" />
      </button>

      <div
        ref={trackRef}
        className={cn(
          "scrollbar-minimal flex gap-4 overflow-x-auto scroll-smooth py-4 pr-4",
          isDragging ? "cursor-grabbing" : "cursor-grab",
          contentClassName,
        )}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerEnter={() => setIsPaused(true)}
        onPointerLeave={() => {
          if (!isDragging) {
            setIsPaused(false);
          }
        }}
        onFocusCapture={() => setIsPaused(true)}
        onBlurCapture={() => setIsPaused(false)}
        onClickCapture={handleClickCapture}
        aria-label={label}
      >
        {children}
      </div>

      <button
        type="button"
        onClick={() => scrollByStep("next")}
        className={cn(
          "absolute right-2 top-1/2 z-20 grid size-10 -translate-y-1/2 place-items-center rounded-full border shadow-lg backdrop-blur-md transition hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:right-4",
          isDark
            ? "border-paper/18 bg-paper/12 text-paper hover:bg-paper/22"
            : "border-foreground/12 bg-white/60 text-foreground hover:bg-white/86",
        )}
        aria-label={`Avançar ${label}`}
      >
        <ChevronRight size={20} aria-hidden="true" />
      </button>
    </div>
  );
}
