"use client";

import type React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import Image from "next/image";
import { BUSINESS_STATUS_OPTIONS } from "@/constants/business";
import {
  Building2,
  Phone,
  PhoneCall,
  Clock,
  Upload,
  Edit3,
  Save,
  X,
  Plus,
  CheckCircle,
  AlertCircle,
  FileText,
  ImageIcon,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";

async function fetchSettings() {
  const res = await fetch("/api/business", { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to fetch settings");
  return res.json();
}

async function upsertSettings(formData: FormData, method: "POST" | "PUT") {
  const res = await fetch("/api/business", { method, body: formData });
  if (!res.ok) throw new Error("Failed to save settings");
  return res.json();
}

export default function BusinessSettingsClient() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["business-settings"],
    queryFn: fetchSettings,
  });

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [primaryPhone, setPrimaryPhone] = useState("");
  const [secondaryPhone, setSecondaryPhone] = useState("");
  const [status, setStatus] = useState<string>("open");
  const [terms, setTerms] = useState<string[]>([]);
  const [termInput, setTermInput] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [removeCurrentLogo, setRemoveCurrentLogo] = useState(false);

  const method: "POST" | "PUT" = data ? "PUT" : "POST";

  const saveMutation = useMutation({
    mutationFn: (payload: FormData) => upsertSettings(payload, method),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["business-settings"] });
      setIsEditDialogOpen(false);
      setName("");
      setPrimaryPhone("");
      setSecondaryPhone("");
      setStatus("open");
      setTerms([]);
      setTermInput("");
      setLogoFile(null);
      setLogoPreview(null);
      setRemoveCurrentLogo(false);
    },
  });

  const filled = useMemo(() => data, [data]);

  const onAddTerm = () => {
    const v = termInput.trim();
    if (!v) return;
    setTerms((prev) => Array.from(new Set([...prev, v])));
    setTermInput("");
  };

  const onRemoveTerm = (t: string) =>
    setTerms((prev) => prev.filter((x) => x !== t));

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      setIsImageLoading(true);
      setRemoveCurrentLogo(false);
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
        setIsImageLoading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearLogo = () => {
    if (logoFile || logoPreview) {
      setLogoFile(null);
      setLogoPreview(null);
    } else if (filled?.logoUrl) {
      setRemoveCurrentLogo(true);
    }
  };

  const openEditDialog = () => {
    setName(filled?.name || "");
    setPrimaryPhone(filled?.primaryPhone || "");
    setSecondaryPhone(filled?.secondaryPhone || "");
    setStatus(filled?.status || "open");
    setTerms(filled?.terms || []);
    setLogoPreview(null);
    setLogoFile(null);
    setRemoveCurrentLogo(false);
    setIsEditDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append("name", name || filled?.name || "");
    fd.append("primaryPhone", primaryPhone || filled?.primaryPhone || "");
    if (secondaryPhone || filled?.secondaryPhone)
      fd.append(
        "secondaryPhone",
        secondaryPhone || filled?.secondaryPhone || ""
      );
    fd.append("status", status || filled?.status || "open");
    (terms.length ? terms : filled?.terms || []).forEach((t: string) =>
      fd.append("terms[]", t)
    );
    if (logoFile) fd.append("logo", logoFile);
    if (removeCurrentLogo) fd.append("removeLogo", "true");
    saveMutation.mutate(fd);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "closed":
        return "bg-red-50 text-red-700 border-red-200";
      case "busy":
        return "bg-amber-50 text-amber-700 border-amber-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <CheckCircle className="w-4 h-4" />;
      case "closed":
        return <X className="w-4 h-4" />;
      case "busy":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white p-2 sm:p-4 lg:p-8">
        <div className="max-w-6xl mx-auto space-y-4 sm:space-y-8">
          <Card className="overflow-hidden border border-gray-200 shadow-sm">
            <CardHeader className="bg-gray-100 border-b border-gray-200 p-4 sm:p-6">
              <Skeleton className="h-7 w-64 bg-gray-300" />
            </CardHeader>
            <CardContent className="p-4 sm:p-8 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
                <div className="space-y-4">
                  <Skeleton className="h-20 w-full bg-gray-200" />
                  <Skeleton className="h-20 w-full bg-gray-200" />
                  <Skeleton className="h-20 w-full bg-gray-200" />
                </div>
                <div className="space-y-4">
                  <Skeleton className="h-32 w-full bg-gray-200" />
                  <Skeleton className="h-24 w-full bg-gray-200" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-2 sm:p-4 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-8">
        {/* Main Settings Card */}
        <Card className="overflow-hidden border border-gray-200 shadow-lg bg-white p-0 m-0">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-700 text-white border-b-0 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Building2 className="w-5 h-5 sm:w-6 sm:h-6" /> 
                </div>

                <div>
                  <CardTitle className="text-xl sm:text-2xl font-bold">
                    Business Information
                  </CardTitle>
                  <p className="hidden sm:block text-white/90 mt-1 text-sm sm:text-base">
                    manage your business information, contact details, and
                    operational preferences
                  </p>
                </div>
              </div>
              <Dialog
                open={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm transition-all duration-200 w-full sm:w-auto"
                    onClick={openEditDialog}
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit Settings
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto bg-white border border-gray-200 mx-auto">
                  <DialogHeader className="border-b border-gray-100 pb-4">
                    <DialogTitle className="flex items-center gap-3 text-xl sm:text-2xl font-semibold text-gray-900">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Edit3 className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                      </div>
                      Edit Business Settings
                    </DialogTitle>
                  </DialogHeader>

                  <form
                    onSubmit={handleSubmit}
                    className="space-y-6 sm:space-y-8 mt-4 sm:mt-6"
                  >
                    {/* Business Name */}
                    <div className="space-y-3">
                      <Label
                        htmlFor="name"
                        className="flex items-center gap-2 text-sm font-semibold text-gray-900"
                      >
                        <Building2 className="w-4 h-4 text-purple-600" />
                        Business Name
                      </Label>
                      <Input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g., Perfect Ceiling"
                        className="h-10 sm:h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500 text-gray-900"
                      />
                    </div>

                    {/* Phone Numbers */}
                    <div className="grid grid-cols-1 gap-4 sm:gap-6">
                      <div className="space-y-3">
                        <Label
                          htmlFor="primaryPhone"
                          className="flex items-center gap-2 text-sm font-semibold text-gray-900"
                        >
                          <Phone className="w-4 h-4 text-purple-600" />
                          Primary Phone
                        </Label>
                        <Input
                          id="primaryPhone"
                          type="tel"
                          value={primaryPhone}
                          onChange={(e) => setPrimaryPhone(e.target.value)}
                          placeholder="e.g., +1 234 567 890"
                          className="h-10 sm:h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500 text-gray-900"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label
                          htmlFor="secondaryPhone"
                          className="flex items-center gap-2 text-sm font-semibold text-gray-900"
                        >
                          <PhoneCall className="w-4 h-4 text-purple-600" />
                          Secondary Phone
                        </Label>
                        <Input
                          id="secondaryPhone"
                          type="tel"
                          value={secondaryPhone}
                          onChange={(e) => setSecondaryPhone(e.target.value)}
                          placeholder="Optional secondary number"
                          className="h-10 sm:h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500 text-gray-900"
                        />
                      </div>
                    </div>

                    {/* Status and Logo */}
                    <div className="grid grid-cols-1 gap-4 sm:gap-6">
                      <div className="space-y-3">
                        <Label
                          htmlFor="status"
                          className="flex items-center gap-2 text-sm font-semibold text-gray-900"
                        >
                          <Clock className="w-4 h-4 text-purple-600" />
                          Business Status
                        </Label>
                        <Select value={status} onValueChange={setStatus}>
                          <SelectTrigger className="h-10 sm:h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-white border border-gray-200">
                            {BUSINESS_STATUS_OPTIONS.map((opt) => (
                              <SelectItem
                                key={opt.value}
                                value={opt.value}
                                className="text-gray-900"
                              >
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-3">
                        <Label className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                          <Upload className="w-4 h-4 text-purple-600" />
                          Business Logo
                        </Label>
                        <div className="space-y-4">
                          {!logoPreview &&
                          !filled?.logoUrl &&
                          !removeCurrentLogo ? (
                            <label className="flex flex-col items-center justify-center w-full h-24 sm:h-32 border-2 border-dashed border-purple-300 rounded-xl bg-purple-50 hover:bg-purple-100 cursor-pointer transition-colors">
                              <div className="flex flex-col items-center justify-center pt-3 pb-4 sm:pt-5 sm:pb-6">
                                <ImageIcon className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500 mb-2" />
                                <p className="text-xs sm:text-sm text-purple-600 font-medium">
                                  Click to upload logo
                                </p>
                                <p className="text-xs text-purple-500">
                                  PNG, JPG, GIF up to 10MB
                                </p>
                              </div>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleLogoChange}
                                className="hidden"
                              />
                            </label>
                          ) : !removeCurrentLogo &&
                            (logoPreview || filled?.logoUrl) ? (
                            <div className="relative inline-block">
                              <div className="flex items-center justify-center w-24 h-24 sm:w-32 sm:h-32 border-2 border-purple-300 rounded-xl bg-purple-50 overflow-hidden">
                                {isImageLoading ? (
                                  <Skeleton className="w-full h-full bg-purple-200" />
                                ) : (
                                  <Image
                                    src={logoPreview || filled?.logoUrl}
                                    alt="Logo preview"
                                    width={128}
                                    height={128}
                                    className="w-full h-full object-contain"
                                    onLoad={() => setIsImageLoading(false)}
                                  />
                                )}
                              </div>
                              <div className="absolute -top-2 -right-2 flex gap-1">
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  className="w-6 h-6 sm:w-7 sm:h-7 rounded-full p-0 bg-red-500 hover:bg-red-600"
                                  onClick={clearLogo}
                                >
                                  <X className="w-3 h-3 sm:w-4 sm:h-4" />
                                </Button>
                              </div>
                              <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity cursor-pointer rounded-xl">
                                <Edit3 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleLogoChange}
                                  className="hidden"
                                />
                              </label>
                            </div>
                          ) : (
                            <label className="flex flex-col items-center justify-center w-full h-24 sm:h-32 border-2 border-dashed border-purple-300 rounded-xl bg-purple-50 hover:bg-purple-100 cursor-pointer transition-colors">
                              <div className="flex flex-col items-center justify-center pt-3 pb-4 sm:pt-5 sm:pb-6">
                                <ImageIcon className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500 mb-2" />
                                <p className="text-xs sm:text-sm text-purple-600 font-medium">
                                  Click to upload logo
                                </p>
                                <p className="text-xs text-purple-500">
                                  PNG, JPG, GIF up to 10MB
                                </p>
                              </div>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleLogoChange}
                                className="hidden"
                              />
                            </label>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Terms & Conditions */}
                    <div className="space-y-4">
                      <Label className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                        <FileText className="w-4 h-4 text-purple-600" />
                        Terms & Conditions
                      </Label>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Textarea
                          value={termInput}
                          onChange={(e) => setTermInput(e.target.value)}
                          placeholder="Add a new term or condition (supports multiple lines)"
                          className="flex-1 min-h-[60px] sm:min-h-[80px] border-gray-300 focus:border-purple-500 focus:ring-purple-500 text-gray-900 resize-none"
                          onKeyPress={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              onAddTerm();
                            }
                          }}
                        />
                        <Button
                          type="button"
                          onClick={onAddTerm}
                          className="h-fit px-4 sm:px-6 py-2 sm:py-3 bg-purple-600 hover:bg-purple-700 text-white w-full sm:w-auto"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add
                        </Button>
                      </div>

                      {(terms.length > 0 ||
                        (filled?.terms && filled.terms.length > 0)) && (
                        <div className="p-3 sm:p-4 bg-purple-50 rounded-xl border border-purple-200">
                          <h4 className="text-sm font-semibold text-purple-900 mb-3">
                            Current Terms & Conditions:
                          </h4>
                          <ol className="space-y-2">
                            {(terms.length ? terms : filled?.terms || []).map(
                              (t: string, index: number) => (
                                <li
                                  key={t}
                                  className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-white rounded-lg border border-purple-200"
                                >
                                  <span className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 bg-purple-600 text-white text-xs font-bold rounded-full flex items-center justify-center mt-0.5">
                                    {index + 1}
                                  </span>
                                  <p className="flex-1 text-xs sm:text-sm text-gray-900 leading-relaxed whitespace-pre-wrap">
                                    {t}
                                  </p>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 p-0 hover:bg-red-100 rounded-full"
                                    onClick={() => onRemoveTerm(t)}
                                  >
                                    <X className="w-3 h-3 text-red-500" />
                                  </Button>
                                </li>
                              )
                            )}
                          </ol>
                        </div>
                      )}
                    </div>

                    {/* Form Actions */}
                    <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-gray-200">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsEditDialogOpen(false)}
                        disabled={saveMutation.isPending}
                        className="px-4 sm:px-6 py-2 sm:py-3 border-gray-300 text-gray-700 hover:bg-gray-50 order-2 sm:order-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={saveMutation.isPending}
                        className="px-6 sm:px-8 py-2 sm:py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold order-1 sm:order-2"
                      >
                        {saveMutation.isPending ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            {data ? "Update Settings" : "Create Settings"}
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>

          <CardContent className="p-4 sm:p-8 bg-gray-50">
            {filled ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
                {/* Left Column - Basic Info */}
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-center gap-3 sm:gap-4 p-4 sm:p-6 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                    <div className="p-2 sm:p-3 rounded-xl flex-shrink-0">
                      {filled?.logoUrl && !removeCurrentLogo ? (
                        <Image
                          src={filled.logoUrl || "/placeholder.svg"}
                          alt="Business logo"
                          width={42}
                          height={42}
                          className="w-8 h-8 sm:w-10 sm:h-10 object-contain rounded-xl"
                        />
                      ) : (
                        <div className="p-2 sm:p-3 bg-purple-100 rounded-xl">
                          <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">
                        Business Name
                      </p>
                      <p className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                        {filled.name || "Not set"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 sm:gap-4 p-4 sm:p-6 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                    <div className="p-2 sm:p-3 bg-emerald-100 rounded-xl flex-shrink-0">
                      <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">
                        Primary Phone
                      </p>
                      <p className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                        {filled.primaryPhone || "Not set"}
                      </p>
                    </div>
                  </div>

                  {filled.secondaryPhone && (
                    <div className="flex items-center gap-3 sm:gap-4 p-4 sm:p-6 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                      <div className="p-2 sm:p-3 bg-blue-100 rounded-xl flex-shrink-0">
                        <PhoneCall className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">
                          Secondary Phone
                        </p>
                        <p className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                          {filled.secondaryPhone}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3 sm:gap-4 p-4 sm:p-6 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                    <div className="p-2 sm:p-3 bg-gray-100 rounded-xl flex-shrink-0">
                      {getStatusIcon(filled.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-gray-600 mb-2">
                        Business Status
                      </p>
                      <Badge
                        className={`${getStatusColor(
                          filled.status
                        )} font-semibold px-2 sm:px-3 py-1 text-xs sm:text-sm`}
                      >
                        {BUSINESS_STATUS_OPTIONS.find(
                          (opt) => opt.value === filled.status
                        )?.label || filled.status}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Right Column - Terms */}
                <div className="space-y-4 sm:space-y-6">
                  {filled.terms && filled.terms.length > 0 && (
                    <div className="p-4 sm:p-6 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                      <div className="flex items-start gap-3 sm:gap-4 mb-4">
                        <div className="p-2 sm:p-3 bg-purple-100 rounded-xl flex-shrink-0">
                          <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs sm:text-sm font-medium text-gray-600">
                            Terms & Conditions
                          </p>
                        </div>
                      </div>
                      <ol className="space-y-2 sm:space-y-3">
                        {filled.terms.map((term: string, index: number) => (
                          <li
                            key={term}
                            className="flex items-start gap-2 sm:gap-3"
                          >
                            <span className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 bg-purple-600 text-white text-xs font-bold rounded-full flex items-center justify-center mt-0.5">
                              {index + 1}
                            </span>
                            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                              {term}
                            </p>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 sm:py-16">
                <div className="p-3 sm:p-4 bg-purple-100 rounded-2xl w-fit mx-auto mb-4 sm:mb-6">
                  <Building2 className="w-12 h-12 sm:w-16 sm:h-16 text-purple-600" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">
                  No Business Settings
                </h3>
                <p className="text-gray-600 mb-6 sm:mb-8 text-base sm:text-lg max-w-md mx-auto px-4">
                  Get started by creating your business profile and setting up
                  your information
                </p>
                <Button
                  onClick={openEditDialog}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 sm:px-8 py-2 sm:py-3 text-base sm:text-lg font-semibold"
                >
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Create Business Profile
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
