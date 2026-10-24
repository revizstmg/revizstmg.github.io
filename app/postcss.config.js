import tailwind from 'tailwindcss'
import autoprefixer from 'autoprefixer'
import surfaces from './scripts/plugin-surfaces.mjs'
export default {plugins:[tailwind(),autoprefixer(),surfaces()]}
