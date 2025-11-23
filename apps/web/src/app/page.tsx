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
  ArrowRight,
  Users,
  Star,
} from "lucide-react"
import { Logo } from "../components/logo"
import { BrandText } from "../components/brand-text"
import { STATS, FEATURES, HOW_IT_WORKS_STEPS, BENEFITS, STAT_CARDS, TESTIMONIALS, FAQ_ITEMS } from "../constants"

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-slate-950/80 backdrop-blur-md border-b border-slate-800 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link href="/">
            <Logo showText={true} size="lg" textGradient={true} />
          </Link>
          <div className="flex gap-4">
            <Link href="/login">
              <Button variant="ghost" className="text-slate-300 hover:text-slate-300">
                Log in
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-[lab(33_35.57_-75.79)] hover:bg-[lab(33_35.57_-75.79)]/90 hover:text-white text-white">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Understand Your Audience,{" "}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Monetize Smarter
            </span>
          </h1>
          <p className="text-xl text-slate-300 mb-8">
            AI-powered sentiment analysis and hyper-personalized content recommendations for creators who want to build
            thriving communities.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="bg-[lab(33_35.57_-75.79)] hover:bg-[lab(33_35.57_-75.79)]/90 hover:text-white text-white gap-2">
                Start as Creator <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/register?role=SUBSCRIBER_T1">
              <Button
                size="lg"
                variant="outline"
                className="border-slate-600 text-slate-300 hover:text-slate-300 hover:bg-slate-800 gap-2 bg-transparent"
              >
                Join as Subscriber <Users className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-slate-900/30">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-transparent bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text mb-2">
                  {stat.value}
                </div>
                <p className="text-slate-400 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Why <BrandText size="3xl" />?</h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Everything you need to understand your audience and grow your creator business
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {FEATURES.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card
                  key={index}
                  className={`bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg p-6 ${feature.hoverBorder} transition-all`}
                >
                  <Icon className={`w-12 h-12 ${feature.iconColor} mb-4`} />
                  <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                  <p className="text-slate-400">{feature.description}</p>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 bg-slate-900/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Simple steps to unlock powerful audience insights
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-8 relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-12 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 via-pink-500 to-orange-500 opacity-20"></div>
            
            {HOW_IT_WORKS_STEPS.map((step) => {
              const Icon = step.icon
              return (
                <Card
                  key={step.number}
                  className={`bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6 ${step.hoverBorder} transition-all text-center relative z-10`}
                >
                  <div className={`w-20 h-20 bg-slate-900 border-2 ${step.borderColor} rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg ${step.shadowColor}`}>
                    <Icon className={`w-10 h-10 ${step.iconColor}`} />
                  </div>
                  <div className={`absolute -top-3 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-lg`}>
                    {step.number}
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2 mt-2">{step.title}</h3>
                  <p className="text-slate-400 text-sm">{step.description}</p>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Built for Creators Who Want to <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Scale Smart</span>
              </h2>
              <div className="space-y-4">
                {BENEFITS.map((benefit, index) => {
                  const Icon = benefit.icon
                  return (
                    <div key={index} className="flex items-start gap-4">
                      <Icon className="w-6 h-6 text-emerald-400 shrink-0 mt-1" />
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-1">{benefit.title}</h3>
                        <p className="text-slate-400">{benefit.description}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {STAT_CARDS.map((stat, index) => {
                const Icon = stat.icon
                return (
                  <Card
                    key={index}
                    className={`bg-gradient-to-br ${stat.gradient} border ${stat.border} p-6`}
                  >
                    <Icon className={`w-8 h-8 ${stat.iconColor} mb-3`} />
                    <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                    <p className="text-slate-300 text-sm">{stat.label}</p>
                  </Card>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Loved by Creators</h2>
            <p className="text-xl text-slate-400">See what creators are saying about us</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((testimonial, index) => (
              <Card key={index} className="bg-slate-800/50 border border-slate-700 p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-slate-300 mb-4">"{testimonial.text}"</p>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 bg-gradient-to-br ${testimonial.gradient} rounded-full`}></div>
                  <div>
                    <p className="text-white font-medium">{testimonial.name}</p>
                    <p className="text-slate-400 text-sm">{testimonial.role}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 bg-slate-900/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-slate-400">Everything you need to know</p>
          </div>
          <Card className="bg-slate-800/50 border border-slate-700 p-6">
            <Accordion type="single" collapsible className="w-full space-y-2">
              {FAQ_ITEMS.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index + 1}`}
                  className={index === FAQ_ITEMS.length - 1 ? "border-b-0" : "border-b border-slate-700/50"}
                >
                  <AccordionTrigger className="text-lg font-semibold text-white hover:no-underline py-4">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-400 pt-2 pb-4">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Ready to grow your community smarter?</h2>
          <Link href="/register">
            <Button size="lg" className="bg-[lab(33_35.57_-75.79)] hover:bg-[lab(33_35.57_-75.79)]/90 hover:text-white text-white">
              Create Your Account
            </Button>
          </Link>
        </div>
      </section>
    </main>
  )
}
