"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import Image from "next/image"
import { signIn } from "next-auth/react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Edit2, User, Mail, Camera, Save, LogIn } from "lucide-react"

// Define the User interface
interface User {
  name: string
  email: string
  profilePicUrl?: string
}

async function fetchUser() {
  const res = await fetch("/api/user", { cache: "no-store" })
  if (!res.ok) throw new Error("Failed to fetch user")
  return res.json()
}

async function updateUser(formData: FormData) {
  const res = await fetch("/api/user/update", {
    method: "POST",
    body: formData,
  })
  if (!res.ok) throw new Error("Failed to update user")
  return res.json()
}

export default function ProfileClient({ isAuthenticated }: { isAuthenticated: boolean }) {
  const qc = useQueryClient()

  const { data, isLoading, error } = useQuery<User>({
    queryKey: ["user"],
    queryFn: fetchUser,
    enabled: isAuthenticated,
  })

  const mutation = useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["user"] })
      setIsDialogOpen(false)
      setName("")
      setFile(null)
    },
  })

  const [name, setName] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  if (!isAuthenticated) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="text-center space-y-6">
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full flex items-center justify-center">
            <User className="w-12 h-12 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Access Your Profile</h2>
            <p className="text-gray-600 dark:text-gray-400">You must be logged in to view your profile.</p>
          </div>
          <Button
            onClick={() => signIn("google")}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <LogIn className="w-4 h-4 mr-2" />
            Login with Google
          </Button>
        </div>
      </div>
    )
  }

  if (isLoading)
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            <div className="space-y-2">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
            </div>
          </div>
        </div>
      </div>
    )

  if (error)
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <p className="text-red-600 dark:text-red-400 font-medium">Failed to load profile.</p>
        </div>
      </div>
    )

  const user = data as User // Use the defined User interface

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                <Edit2 className="w-4 h-4" />
                Edit Profile
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Edit2 className="w-5 h-5" />
                  Edit Profile
                </DialogTitle>
              </DialogHeader>
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault()
                  const fd = new FormData()
                  if (name) fd.append("name", name)
                  if (file) fd.append("file", file)
                  mutation.mutate(fd)
                }}
              >
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Name
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder={user.name}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="file" className="flex items-center gap-2">
                    <Camera className="w-4 h-4" />
                    Profile Picture
                  </Label>
                  <Input
                    id="file"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="w-full"
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button
                    type="submit"
                    disabled={mutation.isPending}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    {mutation.isPending ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    disabled={mutation.isPending}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex items-center gap-6">
          <div className="relative">
            <Image
              src={user.profilePicUrl || "/placeholder.svg?height=80&width=80&query=user avatar"}
              alt="Profile picture"
              width={80}
              height={80}
              className="rounded-full object-cover border-4 border-gray-100 dark:border-gray-700 shadow-lg"
            />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              <span className="font-semibold text-xl text-gray-900 dark:text-white">{user.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <span className="text-gray-600 dark:text-gray-400">{user.email}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Profile</p>
              <p className="text-lg font-bold text-blue-900 dark:text-blue-100">Complete</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-green-600 dark:text-green-400 font-medium">Email</p>
              <p className="text-lg font-bold text-green-900 dark:text-green-100">Verified</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">Avatar</p>
              <p className="text-lg font-bold text-purple-900 dark:text-purple-100">Updated</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}