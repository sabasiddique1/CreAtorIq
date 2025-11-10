"use client"

import { useEffect, useState } from "react"
import { Card } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { graphqlQuery } from "../../../lib/graphql"
import { toast } from "../../../hooks/use-toast"
import { Search, Edit, Trash2, Shield, Mail, Calendar } from "lucide-react"
import { ROLES } from "@engagement-nexus/config"

interface User {
  _id: string
  email: string
  name: string
  role: string
  createdAt: string
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [editName, setEditName] = useState("")
  const [editRole, setEditRole] = useState("")

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    let filtered = users

    if (searchTerm) {
      filtered = filtered.filter(
        (u) =>
          u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.email.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (roleFilter !== "all") {
      filtered = filtered.filter((u) => u.role === roleFilter)
    }

    setFilteredUsers(filtered)
  }, [users, searchTerm, roleFilter])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const result = await graphqlQuery(`
        query {
          allUsers {
            _id
            email
            name
            role
            createdAt
          }
        }
      `)

      if (result?.allUsers) {
        setUsers(result.allUsers)
      }
    } catch (error: any) {
      console.error("Error fetching users:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to fetch users",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setEditName(user.name)
    setEditRole(user.role)
  }

  const handleSaveEdit = async () => {
    if (!editingUser) return

    try {
      await graphqlQuery(
        `
        mutation UpdateUser($id: ID!, $name: String, $role: String) {
          updateUser(id: $id, name: $name, role: $role) {
            _id
            name
            role
          }
        }
      `,
        {
          id: editingUser._id,
          name: editName,
          role: editRole,
        }
      )

      toast({
        title: "Success",
        description: "User updated successfully",
      })
      setEditingUser(null)
      await fetchUsers()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update user",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return
    }

    try {
      await graphqlQuery(
        `
        mutation DeleteUser($id: ID!) {
          deleteUser(id: $id)
        }
      `,
        { id: userId }
      )

      toast({
        title: "Success",
        description: "User deleted successfully",
      })
      await fetchUsers()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive",
      })
    }
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await graphqlQuery(
        `
        mutation UpdateUser($id: ID!, $role: String) {
          updateUser(id: $id, role: $role) {
            _id
            role
          }
        }
      `,
        {
          id: userId,
          role: newRole,
        }
      )

      toast({
        title: "Success",
        description: "User role updated successfully",
      })
      await fetchUsers()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to change role",
        variant: "destructive",
      })
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-red-500/20 text-red-400"
      case "CREATOR":
        return "bg-purple-500/20 text-purple-400"
      default:
        return "bg-blue-500/20 text-blue-400"
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <p className="text-slate-400">Loading users...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">User Management</h1>
        <p className="text-slate-400">Manage all platform users, roles, and permissions</p>
      </div>

      {/* Filters */}
      <Card className="bg-slate-800/50 border-slate-700 p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-900 border-slate-600 text-white"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 bg-slate-900 border border-slate-600 text-white rounded"
          >
            <option value="all">All Roles</option>
            <option value="ADMIN">Admin</option>
            <option value="CREATOR">Creator</option>
            <option value="SUBSCRIBER_T1">Subscriber T1</option>
            <option value="SUBSCRIBER_T2">Subscriber T2</option>
            <option value="SUBSCRIBER_T3">Subscriber T3</option>
          </select>
        </div>
      </Card>

      {/* Users Table */}
      <Card className="bg-slate-800/50 border-slate-700 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">
            Users ({filteredUsers.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Name</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Email</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Role</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Joined</th>
                <th className="text-right py-3 px-4 text-slate-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user._id} className="border-b border-slate-700/50 hover:bg-slate-800/30">
                  <td className="py-3 px-4">
                    <p className="text-white font-medium">{user.name}</p>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-300">{user.email}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user._id, e.target.value)}
                      className={`px-2 py-1 rounded text-xs font-medium border-0 ${getRoleColor(user.role)}`}
                    >
                      <option value="ADMIN">Admin</option>
                      <option value="CREATOR">Creator</option>
                      <option value="SUBSCRIBER_T1">Sub T1</option>
                      <option value="SUBSCRIBER_T2">Sub T2</option>
                      <option value="SUBSCRIBER_T3">Sub T3</option>
                    </select>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                      <Calendar className="w-4 h-4" />
                      {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(user)}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(user._id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-400">No users found</p>
            </div>
          )}
        </div>
      </Card>

      {/* Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="bg-slate-800 border-slate-700 p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold text-white mb-4">Edit User</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Name</label>
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="bg-slate-900 border-slate-600 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Role</label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-600 text-white rounded"
                >
                  <option value="ADMIN">Admin</option>
                  <option value="CREATOR">Creator</option>
                  <option value="SUBSCRIBER_T1">Subscriber T1</option>
                  <option value="SUBSCRIBER_T2">Subscriber T2</option>
                  <option value="SUBSCRIBER_T3">Subscriber T3</option>
                </select>
              </div>
              <div className="flex gap-3">
                <Button onClick={handleSaveEdit} className="flex-1 bg-blue-600 hover:bg-blue-700">
                  Save
                </Button>
                <Button
                  onClick={() => setEditingUser(null)}
                  variant="outline"
                  className="flex-1 border-slate-600"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

