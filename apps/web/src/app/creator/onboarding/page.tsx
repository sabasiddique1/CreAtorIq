"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Card } from "../../../components/ui/card"

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    displayName: "",
    bio: "",
    primaryPlatform: "YouTube",
    niche: "",
  })
  const [loading, setLoading] = useState(false)

  const handleNext = async () => {
    if (step === 3) {
      setLoading(true)
      try {
        // TODO: Call GraphQL mutation to create creator profile
        console.log("Creating creator profile:", formData)
        router.push("/creator/dashboard")
      } finally {
        setLoading(false)
      }
    } else {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    if (step > 1) setStep(step - 1)
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between mb-4">
            {[1, 2, 3].map((s) => (
              <div key={s} className={`h-2 flex-1 mx-1 rounded ${s <= step ? "bg-blue-500" : "bg-slate-700"}`} />
            ))}
          </div>
          <p className="text-slate-400 text-sm">Step {step} of 3</p>
        </div>

        <Card className="bg-slate-800/50 border-slate-700 p-8">
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-white mb-6">Welcome to Creator Hub</h2>
              <p className="text-slate-400 mb-4">
                Let's set up your creator profile so your audience can discover you.
              </p>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Display Name</label>
                <Input
                  value={formData.displayName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, displayName: e.target.value }))}
                  placeholder="Your creator name"
                  className="bg-slate-900 border-slate-600 text-white"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-white mb-6">About Your Channel</h2>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
                  placeholder="Tell us about your channel..."
                  rows={4}
                  className="w-full bg-slate-900 border border-slate-600 text-white rounded p-3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Niche/Category</label>
                <Input
                  value={formData.niche}
                  onChange={(e) => setFormData((prev) => ({ ...prev, niche: e.target.value }))}
                  placeholder="e.g., Gaming, Education, Music"
                  className="bg-slate-900 border-slate-600 text-white"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-white mb-6">Confirm Details</h2>
              <div className="bg-slate-900 rounded p-4 space-y-3">
                <div>
                  <p className="text-slate-400 text-sm">Display Name</p>
                  <p className="text-white font-medium">{formData.displayName}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Niche</p>
                  <p className="text-white font-medium">{formData.niche}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Bio</p>
                  <p className="text-white font-medium text-sm">{formData.bio || "Not provided"}</p>
                </div>
              </div>
              <p className="text-slate-400 text-sm">You can update these details anytime in your settings.</p>
            </div>
          )}

          <div className="flex gap-3 mt-8">
            {step > 1 && (
              <Button variant="outline" onClick={handleBack} className="border-slate-600 bg-transparent">
                Back
              </Button>
            )}
            <Button
              onClick={handleNext}
              disabled={loading || !formData.displayName || !formData.niche}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {loading ? "Setting up..." : step === 3 ? "Complete Setup" : "Next"}
            </Button>
          </div>
        </Card>
      </div>
    </main>
  )
}
