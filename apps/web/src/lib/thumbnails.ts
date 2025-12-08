/**
 * Generate thumbnail URL with fallback logic
 * @param title - Content title
 * @param type - Content type (video, course, post, live_session)
 * @param niche - Creator niche (optional)
 * @returns Thumbnail URL
 */
export function getThumbnailWithFallback(
  title: string,
  type: string,
  niche?: string
): string {
  // For now, use a placeholder service
  // You can enhance this to use actual thumbnail services later
  
  const encodedTitle = encodeURIComponent(title.substring(0, 50))
  const color = getColorForType(type)
  
  // Use placeholder.com or similar service
  return `https://via.placeholder.com/400x225/${color}/FFFFFF?text=${encodedTitle}`
}

/**
 * Get color code for content type
 */
function getColorForType(type: string): string {
  const colorMap: Record<string, string> = {
    video: "DC2626", // Red
    course: "2563EB", // Blue
    post: "059669", // Green
    live_session: "7C3AED", // Purple
    default: "4A5568", // Gray
  }
  
  return colorMap[type.toLowerCase()] || colorMap.default
}


