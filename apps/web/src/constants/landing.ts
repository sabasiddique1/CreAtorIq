import {
  BarChart3,
  Zap,
  Users,
  Brain,
  Target,
  Rocket,
  Upload,
  BrainCircuit,
  Lightbulb,
  TrendingUp,
  CheckCircle2,
  TrendingUp as TrendingUpIcon,
  Award,
  Sparkles,
} from "lucide-react"

export const STATS = [
  { value: "10K+", label: "Creators using CreatorIQ" },
  { value: "2.5M+", label: "Comments analyzed" },
  { value: "4.8/5", label: "Average creator rating" },
  { value: "95%", label: "Sentiment accuracy" },
] as const

export const FEATURES = [
  {
    icon: BarChart3,
    title: "Analyze. Understand. Create.",
    description: "Choose from AI-powered insights that analyze your audience comments to help you understand what content resonates most with each subscriber tier.",
    iconColor: "text-blue-400",
    hoverBorder: "hover:border-blue-500/50",
  },
  {
    icon: Zap,
    title: "Go premium, or keep it accessible.",
    description: "Switch between tier-specific content strategies with the click of a button and keep your content strategy aligned with subscriber expectations.",
    iconColor: "text-purple-400",
    hoverBorder: "hover:border-purple-500/50",
  },
  {
    icon: Users,
    title: "Content planning made easy.",
    description: "Enjoy advanced AI capabilities that ensure your content ideas match audience sentiment, trending topics, and subscriber requests — before you hit 'publish'.",
    iconColor: "text-emerald-400",
    hoverBorder: "hover:border-emerald-500/50",
  },
  {
    icon: Brain,
    title: "AI-Powered Insights",
    description: "Leverage advanced machine learning to extract meaningful patterns from thousands of comments instantly.",
    iconColor: "text-yellow-400",
    hoverBorder: "hover:border-yellow-500/50",
  },
  {
    icon: Target,
    title: "Audience Segmentation",
    description: "Identify key topics, requests, and pain points that matter most to different subscriber tiers.",
    iconColor: "text-pink-400",
    hoverBorder: "hover:border-pink-500/50",
  },
  {
    icon: Rocket,
    title: "Content Strategy",
    description: "Get actionable content outlines and recommendations that align with your audience's desires.",
    iconColor: "text-cyan-400",
    hoverBorder: "hover:border-cyan-500/50",
  },
] as const

export const HOW_IT_WORKS_STEPS = [
  {
    number: 1,
    icon: Upload,
    title: "Import Comments",
    description: "Upload or paste comments from your platform. We support multiple formats.",
    iconColor: "text-blue-400",
    borderColor: "border-blue-500/50",
    badgeColor: "bg-blue-500",
    shadowColor: "shadow-blue-500/20",
    hoverBorder: "hover:border-blue-500/50",
  },
  {
    number: 2,
    icon: BrainCircuit,
    title: "AI Analysis",
    description: "Our AI analyzes sentiment, extracts keywords, and identifies key requests.",
    iconColor: "text-purple-400",
    borderColor: "border-purple-500/50",
    badgeColor: "bg-purple-500",
    shadowColor: "shadow-purple-500/20",
    hoverBorder: "hover:border-purple-500/50",
  },
  {
    number: 3,
    icon: Lightbulb,
    title: "Get Ideas",
    description: "Receive personalized content ideas tailored to your audience's needs.",
    iconColor: "text-pink-400",
    borderColor: "border-pink-500/50",
    badgeColor: "bg-pink-500",
    shadowColor: "shadow-pink-500/20",
    hoverBorder: "hover:border-pink-500/50",
  },
  {
    number: 4,
    icon: TrendingUp,
    title: "Create & Grow",
    description: "Implement ideas and watch your engagement and subscriber satisfaction soar.",
    iconColor: "text-orange-400",
    borderColor: "border-orange-500/50",
    badgeColor: "bg-orange-500",
    shadowColor: "shadow-orange-500/20",
    hoverBorder: "hover:border-orange-500/50",
  },
] as const

export const BENEFITS = [
  {
    icon: CheckCircle2,
    title: "Save Hours of Manual Work",
    description: "No more reading through hundreds of comments. AI does the heavy lifting in seconds.",
  },
  {
    icon: CheckCircle2,
    title: "Data-Driven Decisions",
    description: "Make content decisions based on actual audience sentiment, not guesswork.",
  },
  {
    icon: CheckCircle2,
    title: "Increase Subscriber Retention",
    description: "Create content that your paying subscribers actually want, reducing churn.",
  },
  {
    icon: CheckCircle2,
    title: "Scale Your Business",
    description: "Understand what works across all your content and replicate success.",
  },
] as const

export const STAT_CARDS = [
  {
    icon: TrendingUpIcon,
    value: "3x",
    label: "Faster Content Planning",
    gradient: "from-blue-500/20 to-purple-500/20",
    border: "border-blue-500/30",
    iconColor: "text-blue-400",
  },
  {
    icon: Award,
    value: "2.5x",
    label: "Better Engagement",
    gradient: "from-purple-500/20 to-pink-500/20",
    border: "border-purple-500/30",
    iconColor: "text-purple-400",
  },
  {
    icon: Users,
    value: "40%",
    label: "Higher Retention",
    gradient: "from-pink-500/20 to-red-500/20",
    border: "border-pink-500/30",
    iconColor: "text-pink-400",
  },
  {
    icon: Sparkles,
    value: "100+",
    label: "Ideas Generated",
    gradient: "from-red-500/20 to-orange-500/20",
    border: "border-red-500/30",
    iconColor: "text-red-400",
  },
] as const

export const TESTIMONIALS = [
  {
    name: "Sarah Chen",
    role: "Tech Creator",
    text: "This platform transformed how I understand my audience. The AI insights are incredibly accurate and have helped me create content that my subscribers actually want.",
    gradient: "from-blue-500 to-purple-500",
  },
  {
    name: "Marcus Johnson",
    role: "Education Creator",
    text: "The tier-based insights are a game-changer. I can now create premium content that my T3 subscribers love, which has significantly improved my retention rate.",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    name: "Emma Rodriguez",
    role: "Lifestyle Creator",
    text: "I've tried many analytics tools, but nothing comes close to the depth of insights I get here. The sentiment analysis is spot-on every time.",
    gradient: "from-pink-500 to-red-500",
  },
] as const

export const FAQ_ITEMS = [
  {
    question: "What is CreatorIQ?",
    answer: "CreatorIQ is an AI-powered platform that analyzes your audience comments to understand sentiment, extract key topics, and generate personalized content ideas tailored to each subscription tier.",
  },
  {
    question: "How is CreatorIQ different from other analytics tools?",
    answer: "Unlike generic analytics, CreatorIQ focuses specifically on comment sentiment analysis and tier-based insights. We don't just show you numbers—we tell you what content your subscribers actually want to see, organized by their subscription level.",
  },
  {
    question: "Does CreatorIQ work with any platform?",
    answer: "Yes! You can import comments from any platform—YouTube, Patreon, Discord, Twitch, or any other platform—by pasting them directly or uploading a CSV file. Our AI analyzes the content, not the source.",
  },
  {
    question: "What types of content can CreatorIQ help with?",
    answer: "CreatorIQ helps with all types of content: tutorials, vlogs, educational content, entertainment, Q&A sessions, behind-the-scenes, and more. The AI adapts to your niche and suggests ideas based on what your specific audience wants.",
  },
  {
    question: "Can CreatorIQ help with content strategy?",
    answer: "Absolutely. CreatorIQ provides actionable content outlines, identifies trending topics within your audience, and suggests content types that align with subscriber sentiment and requests.",
  },
  {
    question: "How accurate is the sentiment analysis?",
    answer: "Our AI-powered sentiment analysis achieves 95%+ accuracy by using advanced natural language processing models trained on millions of comments across various niches and platforms.",
  },
] as const

export const COLOR_CLASSES = {
  blue: {
    border: "border-blue-500/50",
    icon: "text-blue-400",
    badge: "bg-blue-500",
    shadow: "shadow-blue-500/20",
    borderColor: "border-blue-500/50",
  },
  purple: {
    border: "border-purple-500/50",
    icon: "text-purple-400",
    badge: "bg-purple-500",
    shadow: "shadow-purple-500/20",
    borderColor: "border-purple-500/50",
  },
  pink: {
    border: "border-pink-500/50",
    icon: "text-pink-400",
    badge: "bg-pink-500",
    shadow: "shadow-pink-500/20",
    borderColor: "border-pink-500/50",
  },
  orange: {
    border: "border-orange-500/50",
    icon: "text-orange-400",
    badge: "bg-orange-500",
    shadow: "shadow-orange-500/20",
    borderColor: "border-orange-500/50",
  },
  emerald: {
    border: "border-emerald-500/50",
    icon: "text-emerald-400",
    badge: "bg-emerald-500",
    shadow: "shadow-emerald-500/20",
    borderColor: "border-emerald-500/50",
  },
  yellow: {
    border: "border-yellow-500/50",
    icon: "text-yellow-400",
    badge: "bg-yellow-500",
    shadow: "shadow-yellow-500/20",
    borderColor: "border-yellow-500/50",
  },
  cyan: {
    border: "border-cyan-500/50",
    icon: "text-cyan-400",
    badge: "bg-cyan-500",
    shadow: "shadow-cyan-500/20",
    borderColor: "border-cyan-500/50",
  },
} as const

