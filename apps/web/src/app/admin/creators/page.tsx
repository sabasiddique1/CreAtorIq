"use client"

import { useEffect, useState } from "react"
import { Card } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { graphqlQuery } from "../../../lib/graphql"
import { toast } from "../../../hooks/use-toast"
import { Search, Trash2, User, Calendar, Video } from "lucide-react"

interface Creator {
  _id: string
  displayName: string
  niche: string
  primaryPlatform: string
  bio: string
  createdAt: string
}

export default function CreatorsManagementPage() {
  const [creators, setCreators] = useState<Creator[]>([])
  const [filteredCreators, setFilteredCreators] = useState<Creator[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchCreators()
  }, [])

  useEffect(() => {
    let filtered = creators

    if (searchTerm) {
      filtered = filtered.filter(
        (c) =>
          c.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.niche.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.primaryPlatform.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredCreators(filtered)
  }, [creators, searchTerm])

  const fetchCreators = async () => {
    try {
      setLoading(true)
      const result = await graphqlQuery(`
        query {
          allCreators {
            _id
            displayName
            niche
            primaryPlatform
            bio
            createdAt
            userId
          }
        }
      `)

      if (result?.allCreators) {
        setCreators(result.allCreators)
      }
    } catch (error: any) {
      console.error("Error fetching creators:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to fetch creators",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (creatorId: string) => {
    if (!confirm("Are you sure you want to delete this creator profile? This will also remove all associated content.")) {
      return
    }

    try {
      await graphqlQuery(
        `
        mutation DeleteCreatorProfile($id: ID!) {
          deleteCreatorProfile(id: $id)
        }
      `,
        { id: creatorId }
      )

      toast({
        title: "Success",
        description: "Creator profile deleted successfully",
      })
      await fetchCreators()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete creator",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <p className="text-slate-400">Loading creators...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Creator Management</h1>
        <p className="text-slate-400">Manage creator profiles and their content</p>
      </div>

      {/* Search */}
      <Card className="bg-slate-800/50 border-slate-700 p-6 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Search creators by name, niche, or platform..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-slate-900 border-slate-600 text-white"
          />
        </div>
      </Card>

      {/* Creators List */}
      <Card className="bg-slate-800/50 border-slate-700 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">
            Creators ({filteredCreators.length})
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {filteredCreators.length > 0 ? (
            filteredCreators.map((creator) => (
              <div
                key={creator._id}
                className="border border-slate-700 rounded-lg p-4 bg-slate-900/50 hover:bg-slate-900 transition"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[lab(33_35.57_-75.79)] rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-medium">{creator.displayName}</h3>
                      <p className="text-slate-400 text-sm">{creator.niche}</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(creator._id)}
                    className="border-red-600 text-red-400 hover:bg-red-600/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                {creator.bio && (
                  <p className="text-slate-300 text-sm mb-3 line-clamp-2">{creator.bio}</p>
                )}

                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Video className="w-4 h-4" />
                    <span>{creator.primaryPlatform}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(creator.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-2 text-center py-12">
              <p className="text-slate-400">No creators found</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

