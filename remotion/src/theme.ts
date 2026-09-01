import { loadFont as loadSora } from "@remotion/google-fonts/Sora";
import { loadFont as loadJakarta } from "@remotion/google-fonts/PlusJakartaSans";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";

export const sora = loadSora("normal", { weights: ["600", "700", "800"], subsets: ["latin"] })
  .fontFamily;
export const jakarta = loadJakarta("normal", {
  weights: ["400", "500", "600", "700"],
  subsets: ["latin"],
}).fontFamily;
export const mono = loadMono("normal", { weights: ["500"], subsets: ["latin"] }).fontFamily;

export const C = {
  bg: "#F6F8FC",
  bgDeep: "#EEF2F9",
  surface: "#FFFFFF",
  navy: "#151E38",
  navySoft: "#3A4462",
  muted: "#6A7490",
  border: "#E2E7F0",
  borderStrong: "#CFD7E6",
  primary: "#2B54EA",
  primarySoft: "#E7EDFE",
  cyan: "#1FA8C4",
  cyanSoft: "#E1F4F8",
  violet: "#7A46DC",
  violetSoft: "#EFE8FC",
  slate: "#8894AE",
};

/** Frame-based easing helpers */
export const EASE_OUT = (t: number) => 1 - Math.pow(1 - t, 3);
export const EASE_IN_OUT = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
