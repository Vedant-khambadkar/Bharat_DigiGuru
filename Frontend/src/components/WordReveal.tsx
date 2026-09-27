import React, { useEffect, useRef, useState } from "react";

interface WordRevealProps {
  text: string;
  className?: string;
  wordClassName?: string;
  delay?: number;
  staggerMs?: number;
  trigger?: boolean | number;
  replayOnHover?: boolean;
}

export const WordReveal: React.FC<WordRevealProps> = ({
  text,
  className = "",
  wordClassName = "",
  delay = 0,
  staggerMs = 24,
  trigger,
  replayOnHover = true,
}) => {
  const containerRef = useRef<HTMLSpanElement>(null);
  const [inView, setInView] = useState(false);
  const [waveCount, setWaveCount] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // External trigger (e.g. card hover)
  useEffect(() => {
    if (trigger !== undefined && inView) {
      setWaveCount((prev) => prev + 1);
    }
  }, [trigger]);

  const words = text.split(" ");

  return (
    <span
      ref={containerRef}
      onMouseEnter={() => {
        if (replayOnHover && inView) {
          setWaveCount((prev) => prev + 1);
        }
      }}
      className={`inline ${className}`}
    >
      {words.map((word, i) => {
        const isRevealed = inView;
        const wordDelay = delay + i * staggerMs;

        return (
          <span
            key={`${i}-${waveCount}`}
            className={`inline-block transition-all duration-500 ease-out ${wordClassName}`}
            style={{
              opacity: isRevealed ? 1 : 0.08,
              transform: isRevealed ? "translateY(0px)" : "translateY(7px)",
              filter: isRevealed ? "blur(0px)" : "blur(2.5px)",
              transitionDelay: isRevealed ? `${wordDelay}ms` : "0ms",
              marginRight: "0.28em",
            }}
          >
            {word}
          </span>
        );
      })}
    </span>
  );
};

export default WordReveal;
