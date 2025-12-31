"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Button } from "../components/ui/button"
import { Card } from "../components/ui/card"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../components/ui/accordion"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../components/ui/carousel"
import { Github, Twitter, Linkedin } from "lucide-react"
import {
  ArrowRight,
  Users,
  Star,
  Sparkles,
  Brain,
} from "lucide-react"
import { Logo } from "../components/logo"
import { BrandText } from "../components/brand-text"
import { STATS, FEATURES, HOW_IT_WORKS_STEPS, BENEFITS, STAT_CARDS, TESTIMONIALS, FAQ_ITEMS } from "../constants"
import { motion, useInView, useScroll, useTransform } from "framer-motion"

function FeaturesSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 0.7", "end 0.3"]
  })

  // Map scroll progress to active feature index (0, 1, 2)
  // Each feature gets 1/3 of the scroll progress
  const featureProgress = useTransform(scrollYProgress, [0, 0.33, 0.66, 1], [0, 1, 2, 2])
  
  useEffect(() => {
    const unsubscribe = featureProgress.on("change", (latest) => {
      const index = Math.floor(latest)
      const newIndex = Math.min(Math.max(index, 0), 2)
      if (newIndex !== activeIndex) {
        setActiveIndex(newIndex)
      }
    })
    return () => unsubscribe()
  }, [featureProgress, activeIndex])

  const features = FEATURES.slice(0, 3)

  return (
    <section ref={sectionRef} className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-semibold text-foreground mb-6 tracking-tight">
            Get a feel for what <BrandText size="4xl" /> can <span className="italic font-highlight">do</span> for you
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            const isActive = activeIndex === index
            const isPast = activeIndex > index
            
            return (
              <motion.div
                key={index}
                className="space-y-4"
                initial={{ opacity: 0.3 }}
                animate={{
                  opacity: isActive ? 1 : isPast ? 0.4 : 0.3,
                  scale: isActive ? 1 : 0.98,
                }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{
                      color: isActive ? "rgb(117, 63, 234)" : "rgba(91, 91, 91, 0.4)",
                    }}
                    transition={{ duration: 0.5 }}
                  >
                    <Icon className="w-6 h-6" />
                  </motion.div>
                  {isActive && (
                    <Sparkles className="w-4 h-4 text-primary" />
                  )}
                  <motion.h3
                    className="text-xl font-semibold"
                    animate={{
                      color: isActive ? "rgb(117, 63, 234)" : "rgba(91, 91, 91, 0.6)",
                    }}
                    transition={{ duration: 0.5 }}
                  >
                    {feature.title}
                  </motion.h3>
                </div>
                <motion.p
                  className="leading-relaxed text-base"
                  animate={{
                    color: isActive ? "rgba(0, 0, 0, 0.8)" : "rgba(91, 91, 91, 0.5)",
                  }}
                  transition={{ duration: 0.5 }}
                >
                  {feature.description}
                </motion.p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function AuthenticInsightsSection() {
  return (
    <section className="py-24 px-6" style={{ backgroundColor: 'rgb(30, 72, 84)' }}>
      <div className="max-w-6xl mx-auto">
        <div className="bg-[rgb(255,232,226)] rounded-3xl p-12 md:p-16 shadow-2xl">
          <div className="mb-12">
            <h2 className="text-4xl md:text-5xl font-semibold text-black mb-6 tracking-tight">
              <span className="text-black">Authentic audience insights</span> <span className="italic text-black font-highlight">done right</span>
            </h2>
          </div>

          {/* Feature 1: Contextual Suggestions - Horizontal Layout */}
          <div className="mb-12 pb-12 border-b border-black/10">
            <div className="grid md:grid-cols-2 gap-12 items-start">
              <div>
                <h3 className="text-2xl md:text-3xl font-semibold text-black mb-4">Contextual suggestions. Smart insights.</h3>
                <p className="text-black/70 leading-relaxed text-base">
                  CreatorIQ uses advanced AI capabilities to analyze your audience comments and generate content ideas that perfectly match your audience's style, sentiment, and subject matter preferences.
                </p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg border border-black/5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-black">Smart Analysis</span>
                </div>
                <div className="space-y-3">
                  <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
                    <p className="text-sm font-medium text-black mb-1">Advanced Tutorial Series</p>
                    <p className="text-xs text-black/60">Based on 45+ requests from T2/T3 subscribers</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-black/10 opacity-60">
                    <p className="text-sm font-medium text-black/70 mb-1">Behind-the-Scenes Content</p>
                    <p className="text-xs text-black/50">High sentiment score: 92% positive</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-black/10 opacity-40">
                    <p className="text-sm font-medium text-black/60 mb-1">Q&A Session</p>
                    <p className="text-xs text-black/40">Top keyword: "questions" (23 mentions)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 2: Continue Planning - Horizontal Layout */}
          <div>
            <div className="grid md:grid-cols-2 gap-12 items-start">
              <div>
                <h3 className="text-2xl md:text-3xl font-semibold text-black mb-4">Continue planning. Never get stuck.</h3>
                <p className="text-black/70 leading-relaxed text-base">
                  Let CreatorIQ pick up where your audience feedback leaves off, ensuring that you never get stuck or run into content planning block again.
                </p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg border border-black/5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-black">Content Ideas</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {['tutorial', 'behind-scenes', 'q&a', 'advanced', 'exclusive', 'premium'].map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-4 py-2 rounded-full text-sm font-medium text-white"
                      style={{
                        backgroundColor: idx === 0 ? 'rgb(117, 63, 234)' : 'rgba(117, 63, 234, 0.3)',
                        opacity: idx === 0 ? 1 : 0.6
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function BenefitsSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 0.7", "end 0.3"]
  })

  // Map scroll progress to active feature index (0, 1, 2)
  const featureProgress = useTransform(scrollYProgress, [0, 0.33, 0.66, 1], [0, 1, 2, 2])
  
  useEffect(() => {
    const unsubscribe = featureProgress.on("change", (latest) => {
      const index = Math.floor(latest)
      const newIndex = Math.min(Math.max(index, 0), 2)
      if (newIndex !== activeIndex) {
        setActiveIndex(newIndex)
      }
    })
    return () => unsubscribe()
  }, [featureProgress, activeIndex])

  const features = [
    {
      title: "Analyze. Understand. Create.",
      description: "Choose from AI-powered insights that analyze your audience comments to help you understand what content resonates most with each subscriber tier.",
    },
    {
      title: "Go premium, or keep it accessible.",
      description: "Switch between tier-specific content strategies with the click of a button and keep your content strategy aligned with subscriber expectations.",
    },
    {
      title: "Content planning made easy.",
      description: "Enjoy advanced AI capabilities that ensure your content ideas match audience sentiment, trending topics, and subscriber requests — before you hit 'publish'.",
    }
  ]

  return (
    <section ref={sectionRef} className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            {features.map((feature, index) => {
              const isActive = activeIndex === index
              const isPast = activeIndex > index
              
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0.3 }}
                  animate={{
                    opacity: isActive ? 1 : isPast ? 0.4 : 0.3,
                    filter: isActive ? "blur(0px)" : "blur(2px)",
                  }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                >
                  <motion.h3
                    className="text-2xl font-semibold mb-3 flex items-center gap-2"
                    animate={{
                      color: isActive ? "rgb(117, 63, 234)" : "rgba(91, 91, 91, 0.6)",
                    }}
                    transition={{ duration: 0.5 }}
                  >
                    {isActive && (
                      <Sparkles className="w-5 h-5 text-primary" />
                    )}
                    {feature.title}
                  </motion.h3>
                  <motion.p
                    className="leading-relaxed text-base"
                    animate={{
                      color: isActive ? "rgba(0, 0, 0, 0.8)" : "rgba(91, 91, 91, 0.5)",
                    }}
                    transition={{ duration: 0.5 }}
                  >
                    {feature.description}
                  </motion.p>
                </motion.div>
              )
            })}
            <Link href="/register">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm mt-4 rounded-full" style={{ paddingTop: '20px', paddingBottom: '20px', paddingLeft: '40px', paddingRight: '40px' }}>
                Get CreatorIQ for free
              </Button>
            </Link>
            <p style={{ color: 'rgba(91, 91, 91, 0.6)', fontSize: '14px', fontWeight: 400 }}>No credit card required</p>
          </div>
          <div className="relative">
            <motion.div
              className="bg-background/80 backdrop-blur-sm border border-border/30 rounded-xl p-8 shadow-lg"
              animate={{
                opacity: activeIndex >= 0 ? 1 : 0.6,
              }}
              transition={{ duration: 0.5 }}
            >
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <span className="w-2 h-2 rounded-full bg-primary"></span>
                  <span>AI Analysis Dashboard</span>
                </div>
                <div className="space-y-4">
                  <div className="bg-muted/30 rounded-lg p-4 border border-border/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-foreground">Sentiment Score</span>
                      <span className="text-sm font-semibold text-primary">87% Positive</span>
                    </div>
                    <div className="h-2 bg-border/50 rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: '87%' }}></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground mb-2">Top Content Requests:</p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                        "More advanced tutorials"
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                        "Behind-the-scenes content"
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                        "Q&A sessions"
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-background/80 backdrop-blur-md border-b border-border/30 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between h-16">
          <Link href="/" className="transition-opacity hover:opacity-80">
            <Logo showText={true} size="lg" textGradient={true} />
          </Link>
          <div className="flex gap-3">
            <Link href="/login">
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                Log in
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm rounded-full" style={{ paddingTop: '20px', paddingBottom: '20px', paddingLeft: '40px', paddingRight: '40px' }}>Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 text-center">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-6xl md:text-7xl font-medium text-black mb-6 leading-[1.05] tracking-tight" style={{ fontWeight: 500 }}>
            Know what your{" "}
            <span className="text-black">audience</span>{" "}
            <span className="text-black italic font-highlight" style={{ fontWeight: 300 }}>really wants</span>
          </h1>
          <p className="text-xl md:text-2xl text-black/70 mb-12 leading-relaxed max-w-3xl mx-auto font-light">
            Turn <span className="font-medium text-black">audience comments</span> into <span className="font-medium text-black">actionable content ideas</span>. <span className="text-black/80">AI-powered sentiment analysis</span> that helps you create content your <span className="font-medium text-black">subscribers</span> actually want to see.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-4">
            <Link href="/register">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm gap-2 text-base h-auto rounded-full" style={{ paddingTop: '20px', paddingBottom: '20px', paddingLeft: '40px', paddingRight: '40px' }}>
                Get Started for Free <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
          <p style={{ color: 'rgba(91, 91, 91, 0.6)', fontSize: '14px', fontWeight: 400 }}>No credit card required</p>
          
          {/* Stacked Image Cards (3 cards: 2 at back, 1 in front) */}
          <div className="mt-16 max-w-5xl mx-auto relative h-[500px] md:h-[600px]">
            {/* Back card 1 (left) */}
            <div className="absolute left-0 top-8 w-full max-w-sm aspect-[16/10] rounded-lg overflow-hidden bg-muted/30 border border-border/30 shadow-lg transform -rotate-2 opacity-60 z-0">
              <img
                src="/carousel-1.jpg"
                alt="Card image 1"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm bg-background/50">
                Image 1
              </div>
            </div>
            
            {/* Back card 2 (right) */}
            <div className="absolute right-0 top-8 w-full max-w-sm aspect-[16/10] rounded-lg overflow-hidden bg-muted/30 border border-border/30 shadow-lg transform rotate-2 opacity-60 z-0">
              <img
                src="/carousel-2.jpg"
                alt="Card image 2"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm bg-background/50">
                Image 2
          </div>
        </div>
            
            {/* Front card (centered) */}
            <div className="absolute left-1/2 top-0 -translate-x-1/2 w-full max-w-sm aspect-[16/10] rounded-lg overflow-hidden bg-muted/30 border border-border/30 shadow-2xl z-10">
              <img
                src="/carousel-3.jpg"
                alt="Card image 3"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm bg-background/50">
                Image 3
              </div>
          </div>
          </div>
        </div>
      </section>

      {/* Benefits Section - Wordtune Style with Scroll Animation */}
      <BenefitsSection />

      {/* Minimalist CTA Section - Wordtune Style */}
      <section className="py-32 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-semibold text-black mb-8 tracking-tight" style={{ fontWeight: 500 }}>
            <span className="text-black">Authentic audience insights</span>{" "}
            <span className="italic text-black font-highlight" style={{ fontWeight: 300 }}>done right</span>
          </h2>
          <div className="flex flex-col items-center gap-4">
            <Link href="/register">
              <Button 
                size="lg" 
                className="text-white hover:opacity-90 shadow-lg text-base h-auto rounded-full"
                style={{ 
                  backgroundColor: 'rgb(30, 30, 30)',
                  paddingTop: '20px', 
                  paddingBottom: '20px', 
                  paddingLeft: '40px', 
                  paddingRight: '40px',
                  fontWeight: 500
                }}
              >
                Get CreatorIQ for free
              </Button>
            </Link>
            <p style={{ color: 'rgba(91, 91, 91, 0.6)', fontSize: '14px', fontWeight: 400 }}>No credit card required</p>
          </div>
        </div>
      </section>

      {/* Features Section - Wordtune Style with Scroll Animation */}
      <FeaturesSection />

      {/* Authentic Audience Insights Section - Wordtune Style */}
      <AuthenticInsightsSection />

      {/* Testimonials Section - Wordtune Style */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          {/* Stats Section with Green Background */}
          <div className="mb-16">
            <div className="bg-[rgb(214,241,128)] rounded-xl p-8 md:p-12">
              <h2 className="text-2xl font-semibold text-black mb-8 text-center">CreatorIQ in numbers</h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                <div className="text-center">
                  <div className="text-4xl md:text-5xl font-semibold text-black mb-2">10K+</div>
                  <p className="text-sm text-black/70">Creators using CreatorIQ</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl md:text-5xl font-semibold text-black mb-2">4.8/5</div>
                  <p className="text-sm text-black/70">Average creator rating</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl md:text-5xl font-semibold text-black mb-2">2.5M+</div>
                  <p className="text-sm text-black/70">Comments analyzed</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl md:text-5xl font-semibold text-black mb-2">95%</div>
                  <p className="text-sm text-black/70">Sentiment accuracy</p>
                      </div>
                <div className="text-center">
                  <div className="text-4xl md:text-5xl font-semibold text-black mb-2">3x</div>
                  <p className="text-sm text-black/70">Faster content planning</p>
                    </div>
              </div>
            </div>
          </div>

          {/* Heading */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-semibold text-black mb-6 tracking-tight">
              A content insights platform <span className="italic font-highlight">you can rely on</span>
            </h2>
          </div>

          {/* Testimonial Cards Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-lg p-6 shadow-sm border border-black/5">
                <p className="text-black leading-relaxed text-base mb-4">"{testimonial.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20 flex-shrink-0">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-black font-medium text-sm">{testimonial.name}</p>
                    <p className="text-black/60 text-xs">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
            {/* Additional testimonials to match the 7-card layout */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-black/5">
              <p className="text-black leading-relaxed text-base mb-4">"CreatorIQ's AI suggestions have improved my content strategy so much. I would recommend it to any creator struggling with audience insights!"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20 flex-shrink-0">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-black font-medium text-sm">Alex Thompson</p>
                  <p className="text-black/60 text-xs">Content Strategist</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border border-black/5">
              <p className="text-black leading-relaxed text-base mb-4">"It's like having a team of analysts all willing to suggest content ideas based on my audience feedback, and I can pick the best ones instantly."</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20 flex-shrink-0">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-black font-medium text-sm">Jordan Lee</p>
                  <p className="text-black/60 text-xs">YouTube Creator</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border border-black/5">
              <p className="text-black leading-relaxed text-base mb-4">"CreatorIQ is so easy to use! I feel confident in my content decisions knowing that CreatorIQ can analyze and provide insights within minutes."</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20 flex-shrink-0">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-black font-medium text-sm">Morgan Davis</p>
                  <p className="text-black/60 text-xs">Podcast Host</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border border-black/5">
              <p className="text-black leading-relaxed text-base mb-4">"CreatorIQ is the best in my opinion, when it comes to understanding audience sentiment and generating content ideas."</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20 flex-shrink-0">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-black font-medium text-sm">Taylor Kim</p>
                  <p className="text-black/60 text-xs">Marketing Director</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border border-black/5">
              <p className="text-black leading-relaxed text-base mb-4">"Awesome platform for content creators. The AI feature is well suited for creators who want to understand their audience better. It is my go-to content planning tool."</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20 flex-shrink-0">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-black font-medium text-sm">Casey Brown</p>
                  <p className="text-black/60 text-xs">Streamer</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border border-black/5">
              <p className="text-black leading-relaxed text-base mb-4">"Though my content strategy is pretty solid, I'm always running my audience feedback through CreatorIQ to find inspiration and better ways to engage my subscribers."</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20 flex-shrink-0">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-black font-medium text-sm">Riley Wilson</p>
                  <p className="text-black/60 text-xs">Indie Creator</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section - Wordtune Style */}
      <section className="py-24 px-6" style={{ backgroundColor: 'rgb(30, 72, 84)' }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl font-semibold text-white mb-12">FAQ</h2>
          <Accordion type="single" collapsible className="w-full">
              {FAQ_ITEMS.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index + 1}`}
                className="border-b border-white/20 last:border-b-0"
                >
                <AccordionTrigger className="text-lg font-medium text-white hover:no-underline py-6">
                    {faq.question}
                  </AccordionTrigger>
                <AccordionContent className="text-white/80 pt-2 pb-6 leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
        </div>
      </section>

      {/* CTA Section - Wordtune Style */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-semibold text-foreground mb-6 tracking-tight">
            <span className="text-black">Find your</span> <span className="italic text-black font-highlight">true voice</span>
          </h2>
          <Link href="/register">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm text-base h-auto mb-3 rounded-full" style={{ paddingTop: '20px', paddingBottom: '20px', paddingLeft: '40px', paddingRight: '40px' }}>
              Get CreatorIQ for free
            </Button>
          </Link>
          <p style={{ color: 'rgba(91, 91, 91, 0.6)', fontSize: '14px', fontWeight: 400 }}>No credit card required</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-border/50 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <Link href="/" className="inline-block mb-4">
                <Logo showText={true} size="md" textGradient={true} />
              </Link>
              <p className="text-sm text-muted-foreground">
                All Rights Reserved © CreatorIQ, 2025
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground transition-colors">About</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">Features</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground transition-colors">Sentiment Analysis</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Content Ideas</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Tier Insights</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Analytics</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">Get CreatorIQ</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/register" className="hover:text-foreground transition-colors">Sign Up</Link></li>
                <li><Link href="/login" className="hover:text-foreground transition-colors">Log In</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Pricing</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Help Center</Link></li>
              </ul>
            </div>
          </div>
          <div className="flex items-center justify-between pt-8 border-t border-border/50">
            <p className="text-sm text-muted-foreground">© 2025 CreatorIQ. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Twitter className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Github className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Linkedin className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
