/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    // Include UI package for shared styles
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}'
  ]
}