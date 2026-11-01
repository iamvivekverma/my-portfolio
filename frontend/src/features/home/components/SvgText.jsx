import { motion as Motion } from "framer-motion";

export default function SvgText({ children, scale = 1 }) {
  const getFontSize = () => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 500)  return '60px';
      if (window.innerWidth < 1024) return '45px';
      return '55px';
    }
    return '55px';
  };

  return (
    <Motion.svg
      width="600"
      height="200"
      viewBox="0 0 600 200"
      className="z-50 overflow-visible lg:hidden lg:group-hover:block"
      style={{ fontSize: getFontSize(), fontFamily: "'Syne', sans-serif" }}
      initial={{ opacity: 0, scale: 0.2, y: -40 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
    >
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#450e16"
        stroke="#fff7e7"
        strokeWidth={20 * scale}
        paintOrder="stroke fill"
        fontWeight="700"
        transform={`scale(${scale}, 1) translateX(${15 * scale / (scale * 100)}%)`}
        style={{ fontKerning: 'normal', textRendering: 'optimizeLegibility' }}
      >
        {children}
      </text>
    </Motion.svg>
  );
}
