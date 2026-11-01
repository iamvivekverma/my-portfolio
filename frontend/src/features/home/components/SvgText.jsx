import { motion as Motion } from "framer-motion";

export default function SvgText({ children, scale = 1, isLg, isMd, isSm }) {
  // Determine typography proportional to viewport breakpoints
  const getTypography = () => {
    // If props from useMediaQuery are provided, use them directly for clean reactivity
    if (isLg !== undefined) {
      if (isLg) {
        return { fontSize: 50, strokeWidth: 12, svgWidth: 360, svgHeight: 120 };
      }
      if (isMd) {
        return { fontSize: 38, strokeWidth: 9, svgWidth: 280, svgHeight: 90 };
      }
      if (isSm) {
        return { fontSize: 30, strokeWidth: 7, svgWidth: 220, svgHeight: 70 };
      }
      // Mobile phones (< 500px): compact, proportional and beautifully balanced
      return { fontSize: 22, strokeWidth: 5, svgWidth: 180, svgHeight: 50 };
    }

    // Fallback to window.innerWidth if called without breakpoint props
    if (typeof window !== "undefined") {
      const w = window.innerWidth;
      if (w >= 1024) return { fontSize: 50, strokeWidth: 12, svgWidth: 360, svgHeight: 120 };
      if (w >= 768) return { fontSize: 38, strokeWidth: 9, svgWidth: 280, svgHeight: 90 };
      if (w >= 500) return { fontSize: 30, strokeWidth: 7, svgWidth: 220, svgHeight: 70 };
      return { fontSize: 22, strokeWidth: 5, svgWidth: 180, svgHeight: 50 };
    }

    return { fontSize: 50, strokeWidth: 12, svgWidth: 360, svgHeight: 120 };
  };

  const { fontSize, strokeWidth, svgWidth, svgHeight } = getTypography();

  return (
    <Motion.svg
      width={svgWidth}
      height={svgHeight}
      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
      className="z-50 overflow-visible lg:hidden lg:group-hover:block pointer-events-none select-none"
      style={{ fontSize: `${fontSize}px`, fontFamily: "'Syne', sans-serif" }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#450e16"
        stroke="#fff7e7"
        strokeWidth={strokeWidth}
        paintOrder="stroke fill"
        fontWeight="700"
        style={{ fontKerning: "normal", textRendering: "optimizeLegibility" }}
      >
        {children}
      </text>
    </Motion.svg>
  );
}
