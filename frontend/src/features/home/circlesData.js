// Positions and sizes for the home page circles.

export const BASE_SIZE = 200;

export const NAV_CIRCLES = [
  {
    size: { base: 90, sm: 120, md: 155, lg: 160 },
    top: "20%",
    left: "2%",
    textPosition: {
      base: { x: 120, y: -40 },
      sm: { x: 160, y: -40 },
      md: { x: 175, y: -40 },
      lg: { x: 180, y: -40 },
    },
    image: {
      src: "/assets/images/projects.svg",
      alt: "Projects",
      top: 55,
      left: 20,
    },
    name: "Projects",
    path: "/projects",
    scale: 1.25,
  },
  {
    size: { base: 88, sm: 130, md: 170, lg: 180 },
    top: "62%",
    left: "12%",
    textPosition: {
      base: { x: 80, y: 45 },
      sm: { x: 120, y: 55 },
      md: { x: 108, y: 52 },
      lg: { x: 110, y: 55 },
    },
    image: {
      src: "/assets/images/about.svg",
      alt: "About",
      left: 18,
      top: 18,
    },
    name: "About",
    path: "/about",
    scale: 1.2,
  },
  {
    size: { base: 94, sm: 140, md: 180, lg: 200 },
    top: "46%",
    left: "78%",
    textPosition: {
      base: { x: -105, y: 45 },
      sm: { x: -130, y: 52 },
      md: { x: -145, y: 58 },
      lg: { x: -150, y: 60 },
    },
    image: {
      src: "/assets/images/bot.svg",
      alt: "Experience",
      top: 12,
      left: 20,
    },
    name: "Experience",
    path: "/experience",
    scale: 1.05,
  },
  {
    size: { base: 80, sm: 115, md: 145, lg: 150 },
    top: "8%",
    left: "68%",
    textPosition: {
      base: { x: -90, y: 45 },
      sm: { x: -102, y: 48 },
      md: { x: -112, y: 52 },
      lg: { x: -115, y: 55 },
    },
    image: {
      src: "/assets/images/skills.svg",
      alt: "Skills",
      top: 15,
      left: 50,
    },
    name: "Skills",
    path: "/skills",
    scale: 1.25,
  },
];

export const FLOATING_CIRCLES = [
  {
    special: true,
    size: { base: 42, sm: 60, md: 82, lg: 90 },
    top: "5%",
    left: "55%",
  },
  {
    special: true,
    size: { base: 14, sm: 20, md: 26, lg: 30 },
    top: "16%",
    left: "30%",
  },
  {
    special: true,
    size: { base: 34, sm: 48, md: 65, lg: 70 },
    top: "85%",
    left: "45%",
  },
  {
    special: true,
    size: { base: 14, sm: 20, md: 26, lg: 30 },
    top: "80%",
    left: "70%",
  },
  {
    size: { base: 18, sm: 26, md: 36, lg: 40 },
    top: "35%",
    left: "85%",
  },
  {
    size: { base: 26, sm: 38, md: 52, lg: 55 },
    top: "58%",
    left: "8%",
  },
];

// Order the circles pop in clockwise from top-right
export const POP_ORDER = [
  "/skills",
  "/experience",
  "/about",
  "/projects",
];
