/**
 * Shared placeholder image used across the entire app
 * (products, collection grid slots, media carousels, etc.)
 *
 * Brand blue gradient with subtle concentric rings and a
 * stacked-layers icon — works at any aspect ratio.
 */
const PLACEHOLDER_SVG = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0d1b3e"/>
      <stop offset="50%" style="stop-color:#0d36c7"/>
      <stop offset="100%" style="stop-color:#3887f8"/>
    </linearGradient>
  </defs>
  <rect width="400" height="400" fill="url(#g)"/>
  <circle cx="200" cy="200" r="112" fill="none" stroke="white" stroke-width="1" opacity="0.07"/>
  <circle cx="200" cy="200" r="66" fill="none" stroke="white" stroke-width="1" opacity="0.09"/>
  <g transform="translate(200,200)" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.28">
    <polygon points="0,-30 26,-15 0,0 -26,-15"/>
    <polyline points="-26,-7 0,8 26,-7"/>
    <polyline points="-26,7 0,22 26,7"/>
  </g>
</svg>`)}`;

export const PLACEHOLDER_IMAGE = PLACEHOLDER_SVG;

export default PLACEHOLDER_IMAGE;
