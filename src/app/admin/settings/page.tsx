"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";
import {
  Loader2,
  Phone,
  Mail,
  MapPin,
  Building2,
  Pencil,
  Upload,
  Plus,
  Trash2,
  ShieldCheck,
  Megaphone,
} from "lucide-react";
import { DashboardPageWrapper } from "@/components/admin/DashboardPageWrapper";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";

import {
  CardContent,
} from "@/components/ui/card";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { BusinessSettingsSchema, BusinessSettingsFormValues } from "@/lib/validators/business";

// --- Components ---

function ReadOnlyField({ label, value, icon: Icon, className }: { label: string; value?: string | null; icon?: React.ElementType; className?: string }) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        {Icon && <Icon className="w-3.5 h-3.5" />}
        {label}
      </div>
      <div className="font-medium text-foreground text-sm pl-0">
        {value || <span className="text-muted-foreground/50 italic">Not set</span>}
      </div>
    </div>
  );
}

function SectionHeader({ title, description, onEdit, icon: Icon }: { title: string; description: string; onEdit: () => void; icon?: React.ElementType }) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div className="space-y-1">
        <h3 className="font-bold text-xl flex items-center gap-2 text-foreground">
          {Icon && (
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Icon className="w-5 h-5" />
            </div>
          )}
          {title}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">{description}</p>
      </div>
      <Button variant="ghost" size="sm" onClick={onEdit} className="h-8 hover:bg-primary/5 hover:text-primary transition-colors">
        <Pencil className="w-4 h-4 mr-2" />
        Edit
      </Button>
    </div>
  );
}

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultValues: BusinessSettingsFormValues;
  mutation: {
    mutate: (data: Partial<BusinessSettingsFormValues>) => void;
    isPending: boolean;
  };
}



export default function BusinessSettingsPage() {
  const queryClient = useQueryClient();
  const [openDialog, setOpenDialog] = useState<string | null>(null);

  const { data: settings, isLoading } = useQuery({
    queryKey: ["business-settings"],
    queryFn: async () => {
      const res = await fetch("/api/business");
      if (!res.ok) throw new Error("Failed to fetch settings");
      const data = await res.json();
      return data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<BusinessSettingsFormValues>) => {
      const res = await fetch("/api/business", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update settings");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Settings updated successfully");
      queryClient.invalidateQueries({ queryKey: ["business-settings"] });
      setOpenDialog(null);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  if (isLoading) {
    return (
      <DashboardPageWrapper title="Settings">
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm animate-pulse">Loading business settings...</p>
        </div>
      </DashboardPageWrapper>
    );
  }

  const defaultValues: BusinessSettingsFormValues = {
    name: settings?.name || "",
    primaryPhone: settings?.primaryPhone || "",
    secondaryPhone: settings?.secondaryPhone || "",
    email: settings?.email || "",
    address: settings?.address || "",
    status: settings?.status || "open",
    terms: settings?.terms || [],
    logoUrl: settings?.logoUrl || "",
    logoPublicId: settings?.logoPublicId || "",
  };

  return (
    <DashboardPageWrapper title="Settings">
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b">
          <div className="space-y-1">
            <h2 className="text-xl font-bold tracking-tight text-foreground">Business Configuration</h2>
            <p className="text-muted-foreground">
              Manage your business profile, contact info, and branding.
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
          {/* General Info */}
          <Card className="h-full border-muted/60 shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardContent className="pt-6">
              <SectionHeader
                title="General Identity"
                description="Basic information about your business entity and current operating status."
                icon={Building2}
                onEdit={() => setOpenDialog("general")}
              />
              <div className="bg-muted/30 rounded-xl p-5 space-y-6">
                <ReadOnlyField label="Business Name" value={settings?.name} />
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Current Status
                  </div>
                  <Badge
                    variant={settings?.status === 'open' ? 'default' : 'secondary'}
                    className={`capitalize px-3 py-1 text-sm ${settings?.status === 'open' ? 'bg-green-100 text-green-700 hover:bg-green-200' : ''
                      }`}
                  >
                    {settings?.status?.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Details */}
          <Card className="h-full border-muted/60 shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardContent className="pt-6">
              <SectionHeader
                title="Contact Information"
                description="How customers can reach you. Used across the website."
                icon={Phone}
                onEdit={() => setOpenDialog("contact")}
              />
              <div className="bg-muted/30 rounded-xl p-5 space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <ReadOnlyField label="Primary Phone" value={settings?.primaryPhone} />
                  <ReadOnlyField label="Secondary Phone" value={settings?.secondaryPhone} />
                </div>
                <Separator className="bg-border/50" />
                <ReadOnlyField label="Email Address" value={settings?.email} icon={Mail} />
              </div>
            </CardContent>
          </Card>

          {/* Location & Brand */}
          <Card className="md:col-span-2 border-muted/60 shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardContent className="pt-6">
              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <SectionHeader
                    title="Branding & Location"
                    description="Your official address and brand assets."
                    icon={MapPin}
                    onEdit={() => setOpenDialog("location")}
                  />
                  <div className="bg-muted/30 rounded-xl p-5 min-h-[140px] flex items-center">
                    <ReadOnlyField label="Office Address" value={settings?.address} className="w-full" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                      <Upload className="w-4 h-4 text-primary" />
                      Business Logo
                    </h4>
                    <Button variant="ghost" size="sm" onClick={() => setOpenDialog("location")} className="h-6 w-6 p-0 hover:bg-transparent">
                      <Pencil className="w-3.5 h-3.5 text-muted-foreground hover:text-primary transition-colors" />
                    </Button>
                  </div>
                  <div className="rounded-xl border border-border bg-card p-4 flex items-center justify-center min-h-[140px] relative overflow-hidden group">
                    {/* Grid pattern background */}
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10" />

                    {settings?.logoUrl ? (
                      <div className="relative w-full h-32 transition-transform duration-500 group-hover:scale-105">
                        <Image
                          src={settings.logoUrl}
                          alt="Business Logo"
                          fill
                          className="object-contain"
                        />
                      </div>
                    ) : (
                      <div className="text-center space-y-2">
                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto">
                          <Upload className="w-5 h-5 text-muted-foreground/50" />
                        </div>
                        <p className="text-xs text-muted-foreground font-medium">No Logo Uploaded</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Terms */}
          <Card className="md:col-span-2 border-muted/60 shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardContent className="pt-6">
              <SectionHeader
                title="Terms & Policies"
                description="Standard terms displayed on your quotations and invoices."
                icon={ShieldCheck}
                onEdit={() => setOpenDialog("terms")}
              />
              <div className="bg-muted/30 rounded-xl p-6">
                {settings?.terms?.length > 0 ? (
                  <ul className="grid gap-3 sm:grid-cols-2">
                    {settings.terms.map((term: string, i: number) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-foreground/80 bg-background/50 p-3 rounded-lg border border-border/50">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold mt-[-2px]">
                          {i + 1}
                        </span>
                        <span className="leading-relaxed">{term}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-8">
                    <Megaphone className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground italic">No terms configured yet.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* --- Dialogs --- */}

        <GeneralDialog
          open={openDialog === "general"}
          onOpenChange={(open) => setOpenDialog(open ? "general" : null)}
          defaultValues={defaultValues}
          mutation={updateMutation}
        />

        <ContactDialog
          open={openDialog === "contact"}
          onOpenChange={(open) => setOpenDialog(open ? "contact" : null)}
          defaultValues={defaultValues}
          mutation={updateMutation}
        />

        <LocationDialog
          open={openDialog === "location"}
          onOpenChange={(open) => setOpenDialog(open ? "location" : null)}
          defaultValues={defaultValues}
          mutation={updateMutation}
        />

        <TermsDialog
          open={openDialog === "terms"}
          onOpenChange={(open) => setOpenDialog(open ? "terms" : null)}
          defaultValues={defaultValues}
          mutation={updateMutation}
        />

      </div>
    </DashboardPageWrapper>
  );
}

// --- Sub-components for Dialogs ---

function GeneralDialog({ open, onOpenChange, defaultValues, mutation }: DialogProps) {
  const GeneralSchema = BusinessSettingsSchema.pick({ name: true, status: true });
  type GeneralFormValues = z.infer<typeof GeneralSchema>;

  const form = useForm<GeneralFormValues>({
    resolver: zodResolver(GeneralSchema),
    defaultValues: {
      name: defaultValues.name || "",
      status: defaultValues.status || "open",
    }
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: defaultValues.name || "",
        status: defaultValues.status || "open",
      });
    }
  }, [open, defaultValues, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>General Information</DialogTitle>
          <DialogDescription>Identity and operating status.</DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-5 py-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-xs font-bold uppercase text-muted-foreground">Business Name</Label>
            <Input id="name" {...form.register("name")} className="font-medium" />
            {form.formState.errors.name && <p className="text-red-500 text-xs font-medium">{form.formState.errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="status" className="text-xs font-bold uppercase text-muted-foreground">Operational Status</Label>
            <Select
              value={form.watch("status")}
              onValueChange={(val) => form.setValue("status", val as BusinessSettingsFormValues["status"])}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
                <SelectItem value="temporary_closed">Temporarily Closed</SelectItem>
                <SelectItem value="busy">Busy</SelectItem>
                <SelectItem value="holiday">Holiday</SelectItem>
                <SelectItem value="by_appointment">By Appointment</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={mutation.isPending || form.formState.isSubmitting}>
              {(mutation.isPending || form.formState.isSubmitting) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ContactDialog({ open, onOpenChange, defaultValues, mutation }: DialogProps) {
  const ContactSchema = BusinessSettingsSchema.pick({ primaryPhone: true, secondaryPhone: true, email: true });
  type ContactFormValues = z.infer<typeof ContactSchema>;

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(ContactSchema),
    defaultValues: {
      primaryPhone: defaultValues.primaryPhone || "",
      secondaryPhone: defaultValues.secondaryPhone || "",
      email: defaultValues.email || "",
    }
  });

  useEffect(() => {
    if (open) {
      form.reset({
        primaryPhone: defaultValues.primaryPhone || "",
        secondaryPhone: defaultValues.secondaryPhone || "",
        email: defaultValues.email || "",
      });
    }
  }, [open, defaultValues, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Contact Details</DialogTitle>
          <DialogDescription>Public contact channels.</DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-5 py-4">
          <div className="space-y-2">
            <Label htmlFor="primaryPhone" className="text-xs font-bold uppercase text-muted-foreground">Primary Phone</Label>
            <Input id="primaryPhone" maxLength={10} {...form.register("primaryPhone")} placeholder="1234567890" />
            {form.formState.errors.primaryPhone && <p className="text-red-500 text-xs font-medium">{form.formState.errors.primaryPhone.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="secondaryPhone" className="text-xs font-bold uppercase text-muted-foreground">Secondary Phone <span className="text-muted-foreground/60 font-normal lowercase">(optional)</span></Label>
            <Input id="secondaryPhone" maxLength={10} {...form.register("secondaryPhone")} placeholder="1234567890" />
            {form.formState.errors.secondaryPhone && <p className="text-red-500 text-xs font-medium">{form.formState.errors.secondaryPhone.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs font-bold uppercase text-muted-foreground">Email Address</Label>
            <Input id="email" {...form.register("email")} placeholder="contact@example.com" />
            {form.formState.errors.email && <p className="text-red-500 text-xs font-medium">{form.formState.errors.email.message}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={mutation.isPending || form.formState.isSubmitting}>
              {(mutation.isPending || form.formState.isSubmitting) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function LocationDialog({ open, onOpenChange, defaultValues, mutation }: DialogProps) {
  const LocationSchema = BusinessSettingsSchema.pick({ address: true, logoUrl: true, logoPublicId: true });
  type LocationFormValues = z.infer<typeof LocationSchema>;

  const form = useForm<LocationFormValues>({
    resolver: zodResolver(LocationSchema),
    defaultValues: {
      address: defaultValues.address || "",
      logoUrl: defaultValues.logoUrl || "",
      logoPublicId: defaultValues.logoPublicId || "",
    }
  });

  useEffect(() => {
    if (open) {
      form.reset({
        address: defaultValues.address || "",
        logoUrl: defaultValues.logoUrl || "",
        logoPublicId: defaultValues.logoPublicId || "",
      });
    }
  }, [open, defaultValues, form]);

  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();

      form.setValue("logoUrl", data.data.url, { shouldDirty: true, shouldValidate: true });
      form.setValue("logoPublicId", data.data.publicId, { shouldDirty: true, shouldValidate: true });
      toast.success("Logo uploaded successfully");
    } catch {
      toast.error("Failed to upload logo");
    } finally {
      setUploading(false);
    }
  };

  const currentLogo = form.watch("logoUrl");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Location & Branding</DialogTitle>
          <DialogDescription>Address and official logo.</DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="address" className="text-xs font-bold uppercase text-muted-foreground">Business Address</Label>
            <Textarea
              id="address"
              {...form.register("address")}
              className="resize-none min-h-[100px] font-medium"
              placeholder="e.g. 123 Business St, Suite 400"
            />
            {form.formState.errors.address && <p className="text-red-500 text-xs font-medium">{form.formState.errors.address.message}</p>}
          </div>

          <div className="space-y-3">
            <Label className="text-xs font-bold uppercase text-muted-foreground">Brand Logo</Label>
            <div className="rounded-lg border border-dashed border-border p-4 bg-muted/20">
              <div className="flex items-center gap-6">
                {currentLogo ? (
                  <div className="relative w-24 h-24 border rounded-lg overflow-hidden bg-white shadow-sm shrink-0">
                    <Image src={currentLogo} alt="Logo Preview" fill className="object-contain p-2" />
                  </div>
                ) : (
                  <div className="w-24 h-24 border border-dashed border-border rounded-lg flex items-center justify-center bg-muted/30 shrink-0">
                    <span className="text-xs text-muted-foreground">No Logo</span>
                  </div>
                )}
                <div className="space-y-3 flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                  />
                  <div className="flex flex-col gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="w-full justify-center"
                    >
                      {uploading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4 mr-2" />
                      )}
                      {currentLogo ? "Change Logo" : "Upload Logo"}
                    </Button>
                    {currentLogo && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="w-full justify-center text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => {
                          form.setValue("logoUrl", "");
                          form.setValue("logoPublicId", "");
                        }}
                      >
                        Remove Logo
                      </Button>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-tight">
                    Recommended: PNG or JPEG, at least 500x500px.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={mutation.isPending || uploading || form.formState.isSubmitting}>
              {(mutation.isPending || form.formState.isSubmitting) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function TermsDialog({ open, onOpenChange, defaultValues, mutation }: DialogProps) {
  const TermsSchema = BusinessSettingsSchema.pick({ terms: true });
  interface TermsFormValues {
    terms: string[];
  }

  const form = useForm<TermsFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(TermsSchema as any),
    defaultValues: { terms: defaultValues.terms || [] }
  });

  useEffect(() => {
    if (open) {
      form.reset({ terms: defaultValues.terms || [] });
    }
  }, [open, defaultValues, form]);

  const { fields, append, remove } = useFieldArray({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    control: form.control as any,
    name: "terms",
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Terms & Conditions</DialogTitle>
          <DialogDescription>Define the policies displayed on your documents.</DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="flex-1 flex flex-col min-h-0 space-y-4 py-4">
          <div className="flex-1 overflow-y-auto pr-2 space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="flex gap-3 group">
                <div className="pt-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-xs font-bold text-muted-foreground">
                    {index + 1}
                  </span>
                </div>
                <div className="flex-1 space-y-1">
                  <Textarea
                    {...form.register(`terms.${index}` as const)}
                    placeholder={`Condition #${index + 1}`}
                    className="min-h-[80px] resize-y"
                    maxLength={200}
                  />
                  <div className="flex justify-between items-center text-xs">
                    {form.formState.errors.terms?.[index] ? (
                      <p className="text-red-500">{form.formState.errors.terms[index]?.message}</p>
                    ) : (<span></span>)}
                    <span className="text-muted-foreground/50">{form.watch(`terms.${index}`)?.length || 0}/200</span>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-50 mt-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}

            {fields.length === 0 && (
              <div className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-muted rounded-xl bg-muted/5">
                <ShieldCheck className="w-10 h-10 text-muted-foreground/20 mb-2" />
                <p className="text-sm text-muted-foreground font-medium">No terms added yet.</p>
                <p className="text-xs text-muted-foreground/60">Add policies to protect your business.</p>
              </div>
            )}
          </div>

          <div className="pt-2 border-t">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full border-dashed border-primary/30 hover:bg-primary/5 hover:text-primary"
              onClick={() => append("")}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Policy
            </Button>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={mutation.isPending || form.formState.isSubmitting}>
              {(mutation.isPending || form.formState.isSubmitting) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
