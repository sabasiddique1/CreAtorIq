// Vercel serverless function wrapper
// This file is automatically detected by Vercel as a serverless function
// Vercel compiles this separately, so TypeScript build excludes this file
// We use a type assertion to bypass TypeScript checking during build
// @ts-nocheck
// @ts-expect-error - This file is compiled separately by Vercel
import handler from "../src/server"

export default handler

