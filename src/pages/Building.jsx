import { useRef, useLayoutEffect, useState, useMemo } from "react";
import gsap from "gsap";

const buildings = [
  {
    name: "Burj Khalifa",
    city: "Dubai",
    svg: (
      <svg viewBox="0 0 80 220" fill="currentColor" className="w-full h-full">
        <polygon points="40,0 44,60 50,80 54,120 58,160 60,220 20,220 22,160 26,120 30,80 36,60" />
        <rect x="32" y="190" width="16" height="30" />
        <rect x="28" y="170" width="24" height="25" />
      </svg>
    ),
  },
  {
    name: "Empire State",
    city: "New York",
    svg: (
      <svg viewBox="0 0 80 220" fill="currentColor" className="w-full h-full">
        <rect x="36" y="0" width="8" height="40" />
        <rect x="32" y="40" width="16" height="30" />
        <rect x="26" y="70" width="28" height="30" />
        <rect x="20" y="100" width="40" height="40" />
        <rect x="14" y="140" width="52" height="40" />
        <rect x="10" y="180" width="60" height="40" />
      </svg>
    ),
  },
  {
    name: "Eiffel Tower",
    city: "Paris",
    svg: (
      <svg viewBox="0 0 80 220" fill="currentColor" className="w-full h-full">
        <polygon points="40,0 42,80 48,100 55,140 62,180 65,220 15,220 18,180 25,140 32,100 38,80" />
        <rect x="30" y="95" width="20" height="6" />
        <rect x="22" y="138" width="36" height="6" />
        <rect x="38" y="0" width="4" height="35" />
      </svg>
    ),
  },
  {
    name: "Shard",
    city: "London",
    svg: (
      <svg viewBox="0 0 80 220" fill="currentColor" className="w-full h-full">
        <polygon points="40,0 55,100 58,160 56,220 24,220 22,160 25,100" />
        <polygon points="40,0 58,100 62,160 60,220 28,220 26,160 30,100" opacity="0.4" />
      </svg>
    ),
  },
  {
    name: "Petronas Towers",
    city: "Kuala Lumpur",
    svg: (
      <svg viewBox="0 0 80 220" fill="currentColor" className="w-full h-full">
        <rect x="8" y="20" width="28" height="200" rx="3" />
        <rect x="44" y="20" width="28" height="200" rx="3" />
        <rect x="4" y="18" width="36" height="5" />
        <rect x="40" y="18" width="36" height="5" />
        <polygon points="22,0 24,20 20,20" />
        <polygon points="58,0 60,20 56,20" />
        <rect x="33" y="100" width="14" height="6" rx="2" />
        <rect x="8" y="30" width="28" height="3" opacity="0.4" />
        <rect x="44" y="30" width="28" height="3" opacity="0.4" />
      </svg>
    ),
  },
  {
    name: "Chrysler Building",
    city: "New York",
    svg: (
      <svg viewBox="0 0 80 220" fill="currentColor" className="w-full h-full">
        <polygon points="40,0 42,30 46,50 44,30" />
        <polygon points="40,0 38,30 34,50 36,30" />
        <rect x="34" y="28" width="12" height="30" />
        <rect x="30" y="56" width="20" height="20" />
        <rect x="24" y="74" width="32" height="30" />
        <rect x="18" y="102" width="44" height="35" />
        <rect x="14" y="135" width="52" height="45" />
        <rect x="12" y="178" width="56" height="42" />
      </svg>
    ),
  },
  {
    name: "Flatiron",
    city: "New York",
    svg: (
      <svg viewBox="0 0 80 220" fill="currentColor" className="w-full h-full">
        <polygon points="40,0 70,220 10,220" />
        <line x1="40" y1="20" x2="40" y2="220" stroke="rgba(0,0,0,0.2)" strokeWidth="1" />
        <line x1="40" y1="60" x2="65" y2="220" stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
      </svg>
    ),
  },
  {
    name: "Sagrada Família",
    city: "Barcelona",
    svg: (
      <svg viewBox="0 0 80 220" fill="currentColor" className="w-full h-full">
        <polygon points="40,0 43,60 46,220 34,220 37,60" />
        <polygon points="20,20 22,70 25,220 15,220 17,70" />
        <polygon points="60,20 62,70 65,220 55,220 57,70" />
        <rect x="10" y="140" width="60" height="5" />
        <polygon points="40,0 41,10 39,10" />
        <polygon points="20,20 21,30 19,30" />
        <polygon points="60,20 61,30 59,30" />
      </svg>
    ),
  },
];

// Duplicate 4 times for smoother seamless loop and better distribution
const quadrupled = [...buildings, ...buildings, ...buildings, ...buildings];

export default function BuildingMarquee() {
  const containerRef = useRef(null);

  // Randomize initial properties for each building to ensure variety
  const [configs] = useState(() =>
    buildings.map(() => ({
      // Speed Tier: 50s to 60s for a very majestic, slow crawl
      duration: 50 + Math.random() * 10, 
      // Randomized delay between 0 and 5 seconds
      delay: Math.random() * 5,
      scale: 0.85 + Math.random() * 0.2,
      yOffset: Math.random() * 30,
    }))
  );

  useLayoutEffect(() => {
    const container = containerRef.current;
    const items = gsap.utils.toArray(".building-card");
    if (!container || items.length === 0) return;

    // We use the window width to ensure buildings start/end far enough away
    const stageWidth = window.innerWidth;
    const offScreenBuffer = 400; // Extra space to hide buildings completely

    items.forEach((item, i) => {
      const config = configs[i];

      // Initial State: Hidden and far to the right
      gsap.set(item, { 
        x: stageWidth + offScreenBuffer, 
        opacity: 0 
      });

      const tl = gsap.timeline({
        repeat: -1,
        // The delay here ensures they don't all start at once
        delay: config.delay + (i * 8), // (i * 8) ensures they are spaced out across the loop
      });

      tl.to(item, {
        opacity: 1,
        duration: 2,
        ease: "power1.inOut"
      })
      .to(item, {
        // Move to the far left, past the viewport
        x: -(offScreenBuffer), 
        duration: config.duration,
        ease: "none",
      }, 0); // Movement starts at the same time as the fade-in
    });

    return () => gsap.killTweensOf(".building-card");
  }, [configs]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0f] overflow-hidden">
      {/* Header */}
      <div className="mb-24 text-center px-4 z-20 relative">
        <p className="text-xs tracking-[0.4em] uppercase mb-3 text-[#c9a84c]">
          Icons of the World
        </p>
        <h1 className="text-6xl md:text-8xl font-light text-[#f0ede6] tracking-tighter">
          Structures
        </h1>
      </div>

      {/* Marquee Viewport */}
      <div 
        ref={containerRef}
        className="relative w-full h-[450px]"
        style={{ 
          // Stronger mask to hide buildings "appearing" from the sides
          maskImage: "linear-gradient(to right, transparent 0%, black 25%, black 75%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 25%, black 75%, transparent 100%)"
        }}
      >
        {buildings.map((b, i) => (
          <div
            key={i}
            className="building-card absolute bottom-0 flex flex-col items-center will-change-transform"
            style={{ width: 250 }}
          >
            <div
              className="flex flex-col items-center"
              style={{
                transform: `translateY(${configs[i].yOffset}px) scale(${configs[i].scale})`,
                color: "#f0ede6",
              }}
            >
              {/* Building Silhouette */}
              <div className="h-72 w-44 drop-shadow-[0_-15px_20px_rgba(201,168,76,0.1)]">
                {b.svg}
              </div>
              
              {/* Labels */}
              <div className="mt-12 text-center">
                <p className="text-[11px] tracking-[0.3em] uppercase text-[#f0ede6] font-light">
                  {b.name}
                </p>
                <div className="h-[1px] w-6 bg-[#c9a84c] my-3 mx-auto opacity-30" />
                <p className="text-[8px] tracking-[0.4em] uppercase text-[#c9a84c] opacity-80">
                  {b.city}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
