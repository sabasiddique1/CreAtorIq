// Vercel serverless function wrapper
// This file is automatically detected by Vercel as a serverless function
// Since package.json has "type": "module", we use ES module imports
// Import from dist after build completes
// @ts-nocheck
import handler from "../dist/server.js"

export default handler

