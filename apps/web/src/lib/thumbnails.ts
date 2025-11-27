/**
 * Generate thumbnail images for content items
 * Uses Lorem Picsum for random images with consistent seeds based on content
 */

export function getContentThumbnail(
  title: string,
  type: string,
  niche?: string
): string {
  // Generate a consistent seed from title for same image each time
  const seed = generateSeed(title, type, niche)
  const width = 400
  const height = 225 // 16:9 aspect ratio like YouTube
  
  // Use Lorem Picsum with seed for consistent images
  // Format: https://picsum.photos/seed/{seed}/{width}/{height}
  return `https://picsum.photos/seed/${seed}/${width}/${height}`
}

function generateSeed(title: string, type: string, niche?: string): string {
  // Create a hash-like seed from title, type, and niche
  const combined = `${title}-${type}-${niche || ""}`
  let hash = 0
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  // Use absolute value and ensure it's positive
  return Math.abs(hash).toString()
}

function getKeywordsForContent(title: string, type: string, niche?: string): string {
  // Extract keywords from title and type
  const titleWords = title.toLowerCase().split(/\s+/).slice(0, 3).join(",")
  
  // Add type-specific keywords
  const typeKeywords: Record<string, string> = {
    video: "video,technology,education",
    course: "course,learning,education",
    post: "article,blog,writing",
    live_session: "live,streaming,broadcast",
  }
  
  const typeKeyword = typeKeywords[type] || "content"
  
  // Add niche if available
  const nicheKeyword = niche ? niche.toLowerCase() : ""
  
  // Combine keywords
  const keywords = [titleWords, typeKeyword, nicheKeyword].filter(Boolean).join(",")
  
  return keywords || "technology,education"
}

/**
 * Alternative: Use placeholder.com for consistent thumbnails
 */
export function getPlaceholderThumbnail(
  title: string,
  type: string,
  seed?: string
): string {
  const seedValue = seed || title.replace(/\s+/g, "-").toLowerCase()
  const colors: Record<string, string> = {
    video: "4A90E2",
    course: "7B68EE",
    post: "50C878",
    live_session: "FF6B6B",
  }
  const color = colors[type] || "6C757D"
  
  // Using placeholder.com with text
  return `https://via.placeholder.com/400x225/${color}/FFFFFF?text=${encodeURIComponent(title.substring(0, 30))}`
}

/**
 * Get thumbnail with fallback chain
 */
export function getThumbnailWithFallback(
  title: string,
  type: string,
  niche?: string
): string {
  // Use Lorem Picsum for random but consistent images
  // Falls back to placeholder in onError handler in component
  return getContentThumbnail(title, type, niche)
}

