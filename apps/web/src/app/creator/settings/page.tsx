"use client"

import { Card } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { useState, useEffect } from "react"
import { graphqlQuery } from "../../../lib/graphql"
import { useAuthStore } from "../../../hooks/use-auth-store"
import { toast } from "../../../hooks/use-toast"

export default function SettingsPage() {
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [profile, setProfile] = useState({
    _id: "",
    displayName: "",
    bio: "",
    niche: "",
    primaryPlatform: "YouTube",
  })

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return

      try {
        const result = await graphqlQuery(`
          query {
            myCreatorProfile {
              _id
              displayName
              bio
              niche
              primaryPlatform
            }
          }
        `)

        if (result?.myCreatorProfile) {
          setProfile({
            _id: result.myCreatorProfile._id,
            displayName: result.myCreatorProfile.displayName || "",
            bio: result.myCreatorProfile.bio || "",
            niche: result.myCreatorProfile.niche || "",
            primaryPlatform: result.myCreatorProfile.primaryPlatform || "YouTube",
          })
        }
      } catch (error) {
        console.error("Error fetching profile:", error)
        toast({
          title: "Error",
          description: "Failed to load profile. Please refresh the page.",
          variant: "destructive",
        })
      } finally {
        setFetching(false)
      }
    }

    if (user) {
      fetchProfile()
    }
  }, [user])

  const handleSave = async () => {
    if (!profile._id) {
      toast({
        title: "Error",
        description: "Profile not found. Please complete onboarding first.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const result = await graphqlQuery(
        `
        mutation UpdateCreatorProfile($id: ID!, $displayName: String, $bio: String, $niche: String) {
          updateCreatorProfile(id: $id, displayName: $displayName, bio: $bio, niche: $niche) {
            _id
            displayName
            bio
            niche
            primaryPlatform
          }
        }
      `,
        {
          id: profile._id,
          displayName: profile.displayName,
          bio: profile.bio,
          niche: profile.niche,
        }
      )

      if (result?.updateCreatorProfile) {
        toast({
          title: "Success",
          description: "Profile updated successfully!",
        })
      }
    } catch (error: any) {
      console.error("Error saving profile:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to save profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Creator Settings</h1>
          <p className="text-slate-400">Manage your creator profile and preferences.</p>
        </div>
        <Card className="bg-slate-800/50 border-slate-700 p-6 max-w-2xl">
          <div className="text-center py-8">
            <p className="text-slate-400">Loading profile...</p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Creator Settings</h1>
        <p className="text-slate-400">Manage your creator profile and preferences.</p>
      </div>

      <Card className="bg-slate-800/50 border-slate-700 p-6 max-w-2xl">
        <h2 className="text-xl font-semibold text-white mb-6">Creator Profile</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Display Name</label>
            <Input
              value={profile.displayName}
              onChange={(e) => setProfile((prev) => ({ ...prev, displayName: e.target.value }))}
              placeholder="Your display name"
              className="bg-slate-900 border-slate-600 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Bio</label>
            <textarea
              value={profile.bio}
              onChange={(e) => setProfile((prev) => ({ ...prev, bio: e.target.value }))}
              placeholder="Tell us about yourself"
              rows={4}
              className="w-full bg-slate-900 border border-slate-600 text-white rounded p-3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Niche</label>
            <Input
              value={profile.niche}
              onChange={(e) => setProfile((prev) => ({ ...prev, niche: e.target.value }))}
              placeholder="e.g., Tech, Gaming, Education"
              className="bg-slate-900 border-slate-600 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Primary Platform</label>
            <select
              value={profile.primaryPlatform}
              onChange={(e) => setProfile((prev) => ({ ...prev, primaryPlatform: e.target.value }))}
              className="w-full bg-slate-900 border border-slate-600 text-white rounded p-2"
            >
              <option>YouTube</option>
              <option>Twitch</option>
              <option>Other</option>
            </select>
          </div>

          <Button 
            onClick={handleSave} 
            disabled={loading || fetching}
            className="bg-blue-600 hover:bg-blue-700 w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </Card>
    </div>
  )
}
