"use client"

import useSWR from "swr"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Building2, MapPin, Phone, User, Clock, FileText, Save, CheckCircle, XCircle, Clock3 } from "lucide-react"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function SettingsPage() {
  const { data, mutate } = useSWR("/api/settings", fetcher)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  const [form, setForm] = useState({
    businessName: "",
    address: "",
    primaryPhone: "",
    secondaryPhone: "",
    ownerName: "",
    managerName: "",
    about: "",
    timing: "",
    status: "OPEN",
  })

  // Load data when available
  useEffect(() => {
    if (data) {
      setForm(data)
    }
  }, [data])

  async function save() {
    setIsLoading(true)
    try {
      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      mutate()
      setIsSaved(true)
      setTimeout(() => setIsSaved(false), 3000)
    } catch (error) {
      console.error("Failed to save settings:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const statusOptions = [
    { value: "OPEN", label: "Open", icon: CheckCircle, color: "text-green-600" },
    { value: "CLOSED", label: "Closed", icon: XCircle, color: "text-red-600" },
    { value: "TEMPORARILY_CLOSED", label: "Temporarily Closed", icon: Clock3, color: "text-yellow-600" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Building2 className="w-6 h-6 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">Business Settings</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Business Information */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Business Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="businessName" className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Business Name
                </Label>
                <Input
                  id="businessName"
                  value={form.businessName}
                  onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                  placeholder="Perfect Ceiling"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Address
                </Label>
                <Input
                  id="address"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="Business address"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="primaryPhone" className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Primary Phone
                </Label>
                <Input
                  id="primaryPhone"
                  value={form.primaryPhone}
                  onChange={(e) => setForm({ ...form, primaryPhone: e.target.value })}
                  placeholder="+1234567890"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="secondaryPhone" className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Secondary Phone
                </Label>
                <Input
                  id="secondaryPhone"
                  value={form.secondaryPhone}
                  onChange={(e) => setForm({ ...form, secondaryPhone: e.target.value })}
                  placeholder="+1234567890"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="ownerName" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Owner Name
                </Label>
                <Input
                  id="ownerName"
                  value={form.ownerName}
                  onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
                  placeholder="Owner name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="managerName" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Manager Name
                </Label>
                <Input
                  id="managerName"
                  value={form.managerName}
                  onChange={(e) => setForm({ ...form, managerName: e.target.value })}
                  placeholder="Manager name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timing" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Business Hours
              </Label>
              <Input
                id="timing"
                value={form.timing}
                onChange={(e) => setForm({ ...form, timing: e.target.value })}
                placeholder="9:00 AM - 6:00 PM"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="about" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                About Business
              </Label>
              <Textarea
                id="about"
                value={form.about}
                onChange={(e) => setForm({ ...form, about: e.target.value })}
                placeholder="Tell customers about your business..."
                rows={4}
                className="resize-none"
              />
            </div>
          </CardContent>
        </Card>

        {/* Business Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Business Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <RadioGroup
              value={form.status}
              onValueChange={(value) => setForm({ ...form, status: value })}
              className="space-y-3"
            >
              {statusOptions.map((option) => {
                const IconComponent = option.icon
                return (
                  <div key={option.value} className="flex items-center space-x-3">
                    <RadioGroupItem value={option.value} id={option.value} />
                    <Label htmlFor={option.value} className="flex items-center gap-2 cursor-pointer">
                      <IconComponent className={`w-4 h-4 ${option.color}`} />
                      {option.label}
                    </Label>
                  </div>
                )
              })}
            </RadioGroup>

            <div className="pt-4 border-t">
              <Button onClick={save} disabled={isLoading} className="w-full" size="lg">
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Saving...
                  </>
                ) : isSaved ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Saved!
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Settings
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
