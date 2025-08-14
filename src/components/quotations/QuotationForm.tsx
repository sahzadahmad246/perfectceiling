// components/QuotationForm.tsx
"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { QuotationSchema, type QuotationSchemaType } from "@/lib/validators/quotationValidator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const QuotationForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<QuotationSchemaType>({
    resolver: zodResolver(QuotationSchema),
    defaultValues: {
      clientInfo: { 
        name: "", 
        phone: "", 
        address: "" 
      },
      workDetails: {
        items: [{ 
          description: "", 
          area: 0, 
          unit: "sqft", 
          rate: 0, 
          total: 0 
        }],
        total: 0,
        discount: 0,
        grandTotal: 0,
        notes: "",
      },
      status: "pending",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "workDetails.items",
  });

  const mutation = useMutation({
    mutationFn: async (data: QuotationSchemaType) => {
      const response = await fetch("/api/quotations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create quotation");
      }
      return response.json() as Promise<{ id: string }>;
    },
    onSuccess: () => {
      toast.success("Quotation created successfully!");
      setIsSubmitting(false);
      reset(); // Reset form after successful submission
    },
    onError: (error: Error) => {
      toast.error(error.message);
      setIsSubmitting(false);
    },
  });

  const onSubmit: SubmitHandler<QuotationSchemaType> = (data) => {
    setIsSubmitting(true);
    mutation.mutate(data);
  };

  // Watch form values to calculate totals
  const items = watch("workDetails.items");
  const discount = watch("workDetails.discount");

  // Auto-calculate item totals when area or rate changes
  useEffect(() => {
    items.forEach((item, index) => {
      const area = item.area || 0;
      const rate = item.rate || 0;
      const calculatedTotal = area * rate;
      
      if (item.total !== calculatedTotal) {
        setValue(`workDetails.items.${index}.total`, calculatedTotal);
      }
    });
  }, [items, setValue]);

  // Auto-calculate grand totals
  useEffect(() => {
    const total = items.reduce((sum, item) => sum + (item.total || 0), 0);
    const grandTotal = total - (discount || 0);
    setValue("workDetails.total", total);
    setValue("workDetails.grandTotal", grandTotal);
  }, [items, discount, setValue]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Create Quotation</h1>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Client Info */}
        <div className="bg-gray-50 p-6 rounded-lg space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">Client Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="clientInfo.name" className="block text-sm font-medium text-gray-700 mb-1">
                Client Name *
              </label>
              <Input
                id="clientInfo.name"
                {...register("clientInfo.name")}
                placeholder="Enter client name"
                className={errors.clientInfo?.name ? "border-red-500" : ""}
              />
              {errors.clientInfo?.name && (
                <p className="text-red-500 text-sm mt-1">{errors.clientInfo.name.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="clientInfo.phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <Input
                id="clientInfo.phone"
                {...register("clientInfo.phone")}
                placeholder="Enter phone number"
                className={errors.clientInfo?.phone ? "border-red-500" : ""}
              />
              {errors.clientInfo?.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.clientInfo.phone.message}</p>
              )}
            </div>
          </div>
          
          <div>
            <label htmlFor="clientInfo.address" className="block text-sm font-medium text-gray-700 mb-1">
              Address *
            </label>
            <Input
              id="clientInfo.address"
              {...register("clientInfo.address")}
              placeholder="Enter client address"
              className={errors.clientInfo?.address ? "border-red-500" : ""}
            />
            {errors.clientInfo?.address && (
              <p className="text-red-500 text-sm mt-1">{errors.clientInfo.address.message}</p>
            )}
          </div>
        </div>

        {/* Work Details - Items */}
        <div className="bg-gray-50 p-6 rounded-lg space-y-6">
          <h2 className="text-xl font-semibold text-gray-800">Work Details</h2>
          
          {fields.map((field, index) => (
            <div key={field.id} className="bg-white border border-gray-200 p-4 rounded-md space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium text-gray-700">Item {index + 1}</h3>
                {fields.length > 1 && (
                  <Button 
                    type="button" 
                    variant="destructive" 
                    size="sm"
                    onClick={() => remove(index)}
                  >
                    Remove
                  </Button>
                )}
              </div>
              
              <div>
                <label
                  htmlFor={`workDetails.items.${index}.description`}
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Description *
                </label>
                <Input
                  id={`workDetails.items.${index}.description`}
                  {...register(`workDetails.items.${index}.description`)}
                  placeholder="Describe the work item"
                  className={errors.workDetails?.items?.[index]?.description ? "border-red-500" : ""}
                />
                {errors.workDetails?.items?.[index]?.description && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.workDetails.items[index]?.description?.message}
                  </p>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label
                    htmlFor={`workDetails.items.${index}.area`}
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Area
                  </label>
                  <Input
                    id={`workDetails.items.${index}.area`}
                    type="number"
                    step="0.01"
                    {...register(`workDetails.items.${index}.area`, { valueAsNumber: true })}
                    placeholder="0"
                    className={errors.workDetails?.items?.[index]?.area ? "border-red-500" : ""}
                  />
                  {errors.workDetails?.items?.[index]?.area && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.workDetails.items[index]?.area?.message}
                    </p>
                  )}
                </div>
                
                <div>
                  <label
                    htmlFor={`workDetails.items.${index}.unit`}
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Unit
                  </label>
                  <Select
                    onValueChange={(value) =>
                      setValue(`workDetails.items.${index}.unit`, value as "sqft" | "runningft")
                    }
                    defaultValue={field.unit}
                  >
                    <SelectTrigger className={errors.workDetails?.items?.[index]?.unit ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select Unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sqft">Square Feet</SelectItem>
                      <SelectItem value="runningft">Running Feet</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.workDetails?.items?.[index]?.unit && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.workDetails.items[index]?.unit?.message}
                    </p>
                  )}
                </div>
                
                <div>
                  <label
                    htmlFor={`workDetails.items.${index}.rate`}
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Rate
                  </label>
                  <Input
                    id={`workDetails.items.${index}.rate`}
                    type="number"
                    step="0.01"
                    {...register(`workDetails.items.${index}.rate`, { valueAsNumber: true })}
                    placeholder="0.00"
                    className={errors.workDetails?.items?.[index]?.rate ? "border-red-500" : ""}
                  />
                  {errors.workDetails?.items?.[index]?.rate && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.workDetails.items[index]?.rate?.message}
                    </p>
                  )}
                </div>
                
                <div>
                  <label
                    htmlFor={`workDetails.items.${index}.total`}
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Total
                  </label>
                  <Input
                    id={`workDetails.items.${index}.total`}
                    type="number"
                    step="0.01"
                    value={watch(`workDetails.items.${index}.total`) || 0}
                    readOnly
                    className="bg-gray-100"
                    {...register(`workDetails.items.${index}.total`, { valueAsNumber: true })}
                  />
                  {errors.workDetails?.items?.[index]?.total && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.workDetails.items[index]?.total?.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          <Button
            type="button"
            variant="outline"
            onClick={() => append({ 
              description: "", 
              area: 0, 
              unit: "sqft", 
              rate: 0, 
              total: 0 
            })}
            className="w-full"
          >
            + Add Item
          </Button>
        </div>

        {/* Work Details - Summary */}
        <div className="bg-gray-50 p-6 rounded-lg space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">Summary</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="workDetails.total" className="block text-sm font-medium text-gray-700 mb-1">
                Subtotal
              </label>
              <Input
                id="workDetails.total"
                type="number"
                step="0.01"
                value={watch("workDetails.total") || 0}
                readOnly
                className="bg-gray-100"
                {...register("workDetails.total", { valueAsNumber: true })}
              />
              {errors.workDetails?.total && (
                <p className="text-red-500 text-sm mt-1">{errors.workDetails.total.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="workDetails.discount" className="block text-sm font-medium text-gray-700 mb-1">
                Discount
              </label>
              <Input
                id="workDetails.discount"
                type="number"
                step="0.01"
                {...register("workDetails.discount", { valueAsNumber: true })}
                placeholder="0.00"
                className={errors.workDetails?.discount ? "border-red-500" : ""}
              />
              {errors.workDetails?.discount && (
                <p className="text-red-500 text-sm mt-1">{errors.workDetails.discount.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="workDetails.grandTotal" className="block text-sm font-medium text-gray-700 mb-1">
                Grand Total
              </label>
              <Input
                id="workDetails.grandTotal"
                type="number"
                step="0.01"
                value={watch("workDetails.grandTotal") || 0}
                readOnly
                className="bg-gray-100 font-semibold"
                {...register("workDetails.grandTotal", { valueAsNumber: true })}
              />
              {errors.workDetails?.grandTotal && (
                <p className="text-red-500 text-sm mt-1">{errors.workDetails.grandTotal.message}</p>
              )}
            </div>
          </div>
          
          <div>
            <label htmlFor="workDetails.notes" className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <Textarea
              id="workDetails.notes"
              {...register("workDetails.notes")}
              placeholder="Additional notes or terms..."
              rows={4}
              className={errors.workDetails?.notes ? "border-red-500" : ""}
            />
            {errors.workDetails?.notes && (
              <p className="text-red-500 text-sm mt-1">{errors.workDetails.notes.message}</p>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => reset()}>
            Reset Form
          </Button>
          <Button type="submit" disabled={isSubmitting} className="px-8">
            {isSubmitting ? "Creating..." : "Create Quotation"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default QuotationForm;