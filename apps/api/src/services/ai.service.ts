import "dotenv/config"
import { generateText } from "ai"
import { google } from "@ai-sdk/google"

interface CommentAnalysis {
  text: string
  sentiment: "positive" | "negative" | "neutral"
  score: number
  keywords: string[]
}

interface SentimentResult {
  overallScore: number
  positiveCount: number
  negativeCount: number
  neutralCount: number
  topKeywords: string[]
  topRequests: string[]
  byTier?: {
    [key: string]: {
      score: number
      positive: number
      negative: number
    }
  }
}

export class AiService {
  /**
   * Analyze sentiment of comments
   */
  static async analyzeComments(comments: Array<{ text: string; tier?: string }>): Promise<SentimentResult> {
    if (!comments.length) {
      return {
        overallScore: 0,
        positiveCount: 0,
        negativeCount: 0,
        neutralCount: 0,
        topKeywords: [],
        topRequests: [],
      }
    }

    // Use Google Gemini
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      console.warn("[AI Service] GOOGLE_GENERATIVE_AI_API_KEY not configured, using fallback analysis")
      return {
        overallScore: 0,
        positiveCount: 0,
        negativeCount: 0,
        neutralCount: 0,
        topKeywords: [],
        topRequests: [],
      }
    }

    // Chunk comments for analysis (max 10 per request to avoid token limits)
    const chunks = []
    for (let i = 0; i < comments.length; i += 10) {
      chunks.push(comments.slice(i, i + 10))
    }

    const analyses: CommentAnalysis[] = []

    for (const chunk of chunks) {
      try {
        const prompt = `Analyze these comments and return a JSON array with sentiment analysis for each. For each comment, provide:
- text: the original comment
- sentiment: "positive", "negative", or "neutral"
- score: sentiment score from -1 (very negative) to 1 (very positive)
- keywords: array of 2-3 key topics/words from the comment

Comments:
${chunk.map((c) => `- "${c.text}"`).join("\n")}

Return ONLY valid JSON array, no other text.`

        // Use Google Gemini with timeout protection (15 seconds per chunk)
        const result = await Promise.race([
          generateText({
            model: google("gemini-2.0-flash"),
            prompt,
          }),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("AI API timeout after 15 seconds")), 15000)
          ),
        ])
        const text = result.text

        try {
          const parsed = JSON.parse(text)
          analyses.push(...(Array.isArray(parsed) ? parsed : [parsed]))
        } catch (e) {
          // Fallback simple analysis
          analyses.push(
            ...chunk.map((c) => ({
              text: c.text,
              sentiment: "neutral" as const,
              score: 0,
              keywords: [],
            })),
          )
        }
      } catch (error) {
        console.error("[AI Service] Comment analysis error:", error)
        // Fallback to neutral sentiment
        analyses.push(
          ...chunk.map((c) => ({
            text: c.text,
            sentiment: "neutral" as const,
            score: 0,
            keywords: [],
          })),
        )
      }
    }

    // Calculate aggregates
    const positiveCount = analyses.filter((a) => a.sentiment === "positive").length
    const negativeCount = analyses.filter((a) => a.sentiment === "negative").length
    const neutralCount = analyses.filter((a) => a.sentiment === "neutral").length

    const overallScore = analyses.reduce((sum, a) => sum + (a.score || 0), 0) / analyses.length

    // Extract top keywords
    const keywordFreq: { [key: string]: number } = {}
    analyses.forEach((a) => {
      ;(a.keywords || []).forEach((k) => {
        keywordFreq[k.toLowerCase()] = (keywordFreq[k.toLowerCase()] || 0) + 1
      })
    })

    const topKeywords = Object.entries(keywordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([k]) => k)

    // Try to extract feature requests
    const topRequests = await this.extractRequests(comments.map((c) => c.text))

    return {
      overallScore,
      positiveCount,
      negativeCount,
      neutralCount,
      topKeywords,
      topRequests,
    }
  }

  /**
   * Extract feature requests from comments
   */
  static async extractRequests(commentTexts: string[]): Promise<string[]> {
    if (!commentTexts.length) return []

    try {
      const prompt = `From these comments, identify the top 5 feature requests or suggestions. 
Return a JSON array of strings, each being a request/suggestion (max 10 words each).
If fewer than 5 clear requests exist, return what you find.

Comments:
${commentTexts
  .slice(0, 20)
  .map((c) => `- "${c}"`)
  .join("\n")}

Return ONLY valid JSON array, no other text.`

      // Use Google Gemini with timeout protection (15 seconds)
      const result = await Promise.race([
        generateText({
          model: google("gemini-2.0-flash"),
          prompt,
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("AI API timeout after 15 seconds")), 15000)
        ),
      ])
      const text = result.text

      try {
        const parsed = JSON.parse(text)
        return Array.isArray(parsed) ? parsed.slice(0, 5) : []
      } catch {
        return []
      }
    } catch (error) {
      console.error("[AI Service] Extract requests error:", error)
      return []
    }
  }

  /**
   * Generate content ideas from sentiment snapshot
   */
  static async generateIdeas(
    snapshot: {
      topKeywords: string[]
      topRequests: string[]
      positiveCount: number
      negativeCount: number
    },
    creatorNiche: string,
    tierTarget?: string,
  ): Promise<
    Array<{
      title: string
      description: string
      ideaType: string
      outline: string[]
    }>
  > {
    // Use Google Gemini (free alternative)
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      console.error("[AI Service] GOOGLE_GENERATIVE_AI_API_KEY is not set")
      throw new Error(
        "Google Gemini API key is not configured. Please set GOOGLE_GENERATIVE_AI_API_KEY in your .env file.\n\n" +
        "Get free API key: https://aistudio.google.com/app/apikey"
      )
    }

    try {
      const prompt = `You are an expert content strategist. Based on audience sentiment data, generate 3 unique content ideas for a creator in the "${creatorNiche}" niche.

Audience Insights:
- Top requested topics: ${snapshot.topRequests.join(", ") || "general interest"}
- Key interests: ${snapshot.topKeywords.join(", ")}
- Positive sentiment: ${snapshot.positiveCount}
- Negative/Improvement requests: ${snapshot.negativeCount}
${tierTarget ? `- Target subscriber tier: ${tierTarget}` : ""}

For each idea, return a JSON object with:
- title: compelling title
- description: 1-2 sentence description explaining what the audience wants and how this content addresses their needs
- ideaType: one of [video, mini-course, live_qa, community_challenge]
- outline: array of 3-5 key points/sections

Return a JSON array of 3 ideas. Return ONLY JSON, no other text.`

      console.log("[AI Service] Generating ideas with prompt length:", prompt.length)
      console.log("[AI Service] Using provider: Google Gemini")
      
      // Use Google Gemini (free tier available) with timeout protection (20 seconds)
      const result = await Promise.race([
        generateText({
          model: google("gemini-2.0-flash"),
          prompt,
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("AI API timeout after 20 seconds")), 20000)
        ),
      ])
      const text = result.text

      console.log("[AI Service] Received response from AI, length:", text.length)

      try {
        // Try to extract JSON from the response (sometimes AI adds extra text)
        let jsonText = text.trim()
        const jsonMatch = jsonText.match(/\[[\s\S]*\]/)
        if (jsonMatch) {
          jsonText = jsonMatch[0]
        }

        const parsed = JSON.parse(jsonText)
        const ideas = Array.isArray(parsed)
          ? parsed.map((idea) => ({
              title: idea.title || "Untitled Idea",
              description: idea.description || "",
              ideaType: idea.ideaType || "video",
              outline: Array.isArray(idea.outline) ? idea.outline : [],
            }))
          : []

        console.log("[AI Service] Successfully parsed", ideas.length, "ideas")
        return ideas
      } catch (parseError) {
        console.error("[AI Service] Failed to parse JSON response:", parseError)
        console.error("[AI Service] Response text:", text.substring(0, 500))
        throw new Error("Failed to parse AI response. The AI service may be experiencing issues.")
      }
    } catch (error: any) {
      console.error("[AI Service] Generate ideas error:", error)
      if (error.message?.includes("API key")) {
        throw error
      }
      throw new Error(`Failed to generate ideas: ${error.message || "Unknown error"}`)
    }
  }

  /**
   * Generate course outline
   */
  static async generateCourseOutline(
    topic: string,
    difficulty: "beginner" | "intermediate" | "advanced" = "beginner",
  ): Promise<{
    title: string
    modules: Array<{
      title: string
      lessons: string[]
    }>
  }> {
    try {
      const prompt = `Create a structured course outline for: "${topic}" at ${difficulty} level.

Return JSON with:
- title: course title
- modules: array of modules, each with:
  - title: module title
  - lessons: array of 3-4 lesson titles

Include 4-5 modules. Return ONLY JSON, no other text.`

        // Use Google Gemini with timeout protection (15 seconds)
        const { text } = await Promise.race([
          generateText({
            model: google("gemini-2.0-flash"),
            prompt,
          }),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("AI API timeout after 15 seconds")), 15000)
          ),
        ])

      try {
        return JSON.parse(text)
      } catch {
        return {
          title: topic,
          modules: [
            {
              title: "Getting Started",
              lessons: ["Introduction", "Basics", "Setup"],
            },
          ],
        }
      }
    } catch (error) {
      console.error("[AI Service] Generate course outline error:", error)
      return {
        title: topic,
        modules: [],
      }
    }
  }
}
