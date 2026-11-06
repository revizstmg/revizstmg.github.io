import base from './playwright.config.js'
export default {...base,workers:1,use:{...base.use,baseURL:'http://localhost:4301'},webServer:{command:'npx vite preview --port 4301 --strictPort',url:'http://localhost:4301',reuseExistingServer:false}}
