"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2, XCircle } from "lucide-react"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Card } from "../../../components/ui/card"
import { cn } from "../../../lib/utils"
import { toast } from "../../../hooks/use-toast"
import { graphqlQuery } from "../../../lib/graphql"

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

  // Validation for display name
  const displayNameValidation = useMemo(() => {
    const value = formData.displayName.trim()
    if (value.length === 0) {
      return { isValid: false, message: "" }
    }
    if (value.length < 2) {
      return { isValid: false, message: "Display name must be at least 2 characters" }
    }
    if (value.length > 50) {
      return { isValid: false, message: "Display name must be less than 50 characters" }
    }
    // Check for valid characters (letters, numbers, spaces, hyphens, underscores)
    if (!/^[a-zA-Z0-9\s\-_]+$/.test(value)) {
      return { isValid: false, message: "Display name can only contain letters, numbers, spaces, hyphens, and underscores" }
    }
    return { isValid: true, message: "Display name looks good!" }
  }, [formData.displayName])

  // Validation for niche
  const nicheValidation = useMemo(() => {
    const value = formData.niche.trim()
    if (value.length === 0) {
      return { isValid: false, message: "" }
    }
    if (value.length < 2) {
      return { isValid: false, message: "Niche must be at least 2 characters" }
    }
    return { isValid: true, message: "Niche looks good!" }
  }, [formData.niche])

  const handleNext = async () => {
    if (step === 3) {
      setLoading(true)
      try {
        // Validate all fields before submitting
        if (!displayNameValidation.isValid || !nicheValidation().isValid) {
          toast({
            variant: "destructive",
            title: "Validation Error",
            description: "Please fix the errors in the form before continuing.",
          })
          setLoading(false)
          return
        }

        const result = await graphqlQuery(
          `
          mutation CreateCreatorProfile($displayName: String!, $bio: String!, $primaryPlatform: String!, $niche: String!) {
            createCreatorProfile(displayName: $displayName, bio: $bio, primaryPlatform: $primaryPlatform, niche: $niche) {
              _id
              displayName
              bio
              niche
              primaryPlatform
            }
          }
          `,
          {
            displayName: formData.displayName.trim(),
            bio: formData.bio.trim(),
            primaryPlatform: formData.primaryPlatform,
            niche: formData.niche.trim(),
          }
        )

        if (result?.createCreatorProfile) {
          toast({
            title: "Profile Created",
            description: "Your creator profile has been set up successfully!",
          })
          // Small delay to show toast before redirect
          setTimeout(() => {
            window.location.href = "/creator/dashboard"
          }, 500)
        }
      } catch (error: any) {
        const errorMessage = error?.message || "Failed to create profile. Please try again."
        toast({
          variant: "destructive",
          title: "Error",
          description: errorMessage,
        })
        console.error("Error creating profile:", error)
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
                <div className="relative">
                  <Input
                    value={formData.displayName}
                    onChange={(e) => setFormData((prev) => ({ ...prev, displayName: e.target.value }))}
                    placeholder="Your creator name"
                    className={cn(
                      "bg-slate-900 border-slate-600 text-white pr-10",
                      formData.displayName.trim().length > 0 && displayNameValidation.isValid && "border-green-500",
                      formData.displayName.trim().length > 0 && !displayNameValidation.isValid && "border-red-500"
                    )}
                  />
                  {formData.displayName.trim().length > 0 && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {displayNameValidation.isValid ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                  )}
                </div>
                {formData.displayName.trim().length > 0 && (
                  <p
                    className={cn(
                      "text-xs mt-1.5",
                      displayNameValidation.isValid ? "text-green-400" : "text-red-400"
                    )}
                  >
                    {displayNameValidation.message}
                  </p>
                )}
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
                <p className="text-xs text-slate-500 mt-1.5">Optional - You can add this later</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Niche/Category</label>
                <div className="relative">
                  <Input
                    value={formData.niche}
                    onChange={(e) => setFormData((prev) => ({ ...prev, niche: e.target.value }))}
                    placeholder="e.g., Gaming, Education, Music"
                    className={cn(
                      "bg-slate-900 border-slate-600 text-white pr-10",
                      formData.niche.trim().length > 0 && nicheValidation.isValid && "border-green-500",
                      formData.niche.trim().length > 0 && !nicheValidation.isValid && "border-red-500"
                    )}
                  />
                  {formData.niche.trim().length > 0 && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {nicheValidation.isValid ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                  )}
                </div>
                {formData.niche.trim().length > 0 && (
                  <p
                    className={cn(
                      "text-xs mt-1.5",
                      nicheValidation.isValid ? "text-green-400" : "text-red-400"
                    )}
                  >
                    {nicheValidation.message}
                  </p>
                )}
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
              <Button variant="outline" onClick={handleBack} className="border-slate-600 bg-transparent text-slate-300">
                Back
              </Button>
            )}
            <Button
              onClick={handleNext}
              disabled={
                loading ||
                (step === 1 && !displayNameValidation.isValid) ||
                (step === 2 && !nicheValidation.isValid) ||
                (step === 3 && (!displayNameValidation.isValid || !nicheValidation.isValid))
              }
              className="flex-1 bg-[lab(33_35.57_-75.79)] hover:bg-[lab(33_35.57_-75.79)]/90 hover:text-white text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Setting up..." : step === 3 ? "Complete Setup" : "Next"}
            </Button>
          </div>
        </Card>
      </div>
    </main>
  )
}
