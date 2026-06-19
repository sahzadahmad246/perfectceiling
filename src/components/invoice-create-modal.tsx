"use client";

import { Loader2, X } from "lucide-react";
import { useAppRouter } from "@/hooks/use-app-router";
import { useEffect, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

import {
  createInvoice,
  updateInvoice,
  type InvoiceDefaults,
} from "@/app/admin/invoices/actions";
import { CustomerDetailsStep } from "@/components/customer-details-step";
import { InvoicePreviewStep } from "@/components/invoice-preview-step";
import { InvoiceWorkPricingStep } from "@/components/invoice-work-pricing-step";
import {
  validateQuotationCustomer,
  type CustomerFieldErrors,
} from "@/lib/customer-validation";
import {
  calculateDiscountAmount,
  calculateGrandTotal,
  calculateLineItemAmount,
  calculateSubtotal,
  defaultInvoiceDueDate,
  type CreateInvoiceInput,
  type InvoiceCustomerDraft,
  type InvoiceLineItemDraft,
  type InvoiceWorkDraft,
} from "@/lib/invoices";

type InvoiceCreateModalProps = {
  open: boolean;
  defaults: InvoiceDefaults;
  onClose: () => void;
  invoiceId?: string;
  initialData?: CreateInvoiceInput;
  quotationId?: string;
  initialStep?: number;
};

const emptyCustomer = (): InvoiceCustomerDraft => ({
  name: "",
  phone: "",
  whatsapp: "",
  email: "",
  address: "",
  city: "",
  notes: "",
});

const emptyWork = (defaults: InvoiceDefaults): InvoiceWorkDraft => ({
  workTitle: "",
  items: [],
  discount: "",
  discountType: "fixed",
  invoiceTerms: defaults.invoiceTerms,
  dueDate: defaultInvoiceDueDate(),
});

export function InvoiceCreateModal({
  open,
  defaults,
  onClose,
  invoiceId,
  initialData,
  quotationId,
  initialStep = 1,
}: InvoiceCreateModalProps) {
  const router = useAppRouter();
  const isEditing = Boolean(invoiceId && initialData);
  const [step, setStep] = useState(initialStep);
  const [customer, setCustomer] = useState(emptyCustomer);
  const [work, setWork] = useState(() => emptyWork(defaults));
  const [customerErrors, setCustomerErrors] = useState<CustomerFieldErrors>({});
  const [itemsError, setItemsError] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) {
      return;
    }

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    setStep(initialStep);
    setCustomerErrors({});
    setItemsError(undefined);

    if (initialData) {
      setCustomer(initialData.customer);
      setWork({
        ...initialData.work,
        discountType: initialData.work.discountType ?? "fixed",
      });
      return;
    }

    setCustomer(emptyCustomer());
    setWork(emptyWork(defaults));
  }, [defaults, initialData, initialStep, open]);

  const subtotal = useMemo(() => calculateSubtotal(work.items), [work.items]);
  const discountAmount = useMemo(
    () => calculateDiscountAmount(subtotal, work.discountType, work.discount),
    [subtotal, work.discount, work.discountType],
  );
  const grandTotal = useMemo(
    () => calculateGrandTotal(subtotal, work.discount, work.discountType),
    [subtotal, work.discount, work.discountType],
  );

  if (!open) {
    return null;
  }

  function updateCustomer<K extends keyof InvoiceCustomerDraft>(
    key: K,
    value: InvoiceCustomerDraft[K],
  ) {
    setCustomer((current) => ({ ...current, [key]: value }));

    if (key === "name" || key === "phone" || key === "address") {
      setCustomerErrors((current) => ({ ...current, [key]: undefined }));
    }
  }

  function updateWork<K extends keyof InvoiceWorkDraft>(
    key: K,
    value: InvoiceWorkDraft[K],
  ) {
    setWork((current) => ({ ...current, [key]: value }));
  }

  function setWorkItems(items: InvoiceLineItemDraft[]) {
    setWork((current) => ({ ...current, items }));
    setItemsError(undefined);
  }

  function validateStep(currentStep: number) {
    if (currentStep === 1) {
      const customerValidation = validateQuotationCustomer(customer);

      if (!customerValidation.valid) {
        setCustomerErrors(customerValidation.errors);
        return false;
      }

      if (customerValidation.formattedPhone) {
        setCustomer((current) => ({
          ...current,
          phone: customerValidation.formattedPhone!,
        }));
      }

      setCustomerErrors({});
    }

    if (currentStep === 2) {
      const validItems = work.items.filter((item) => item.name.trim());

      if (validItems.length === 0) {
        setItemsError("Add at least one work item.");
        return false;
      }

      setItemsError(undefined);

      for (const item of validItems) {
        const amount = calculateLineItemAmount(item);

        if (amount <= 0) {
          toast.error(`"${item.name.trim()}" needs a valid amount.`);
          return false;
        }

        if (
          !item.isLumpSum &&
          (!item.quantity.trim() || !item.rate.trim())
        ) {
          toast.error(
            `"${item.name.trim()}" needs area and rate, or switch to lump sum.`,
          );
          return false;
        }
      }
    }

    return true;
  }

  function handleSubmit() {
    startTransition(async () => {
      const result = isEditing
        ? await updateInvoice(invoiceId!, { customer, work })
        : await createInvoice({ customer, work }, quotationId);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success(isEditing ? "Invoice updated." : "Invoice created.");
      router.replace(`/admin/invoices/${result.id}`);
      router.refresh();
    });
  }

  return (
    <div className="fixed inset-0 z-[9990] flex justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex h-full w-full max-w-[560px] flex-col border-x border-border-soft bg-surface shadow-popover">
        <header className="flex items-center justify-between border-b border-border-soft px-4 py-3 sm:px-8">
          <div>
            <div className="text-xs text-muted">Step {step} of 3</div>
            <h2 className="font-primary text-lg font-medium">
              {step === 1
                ? isEditing
                  ? "Edit customer details"
                  : "Customer details"
                : step === 2
                  ? isEditing
                    ? "Edit work & pricing"
                    : "Work & pricing"
                  : isEditing
                    ? "Review changes"
                    : "Preview"}
            </h2>
          </div>
          <button
            aria-label="Close invoice form"
            className="inline-flex items-center justify-center text-foreground transition hover:text-primary"
            disabled={isPending}
            onClick={onClose}
            type="button"
          >
            <X size={22} strokeWidth={2.5} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-8">
          {step === 1 ? (
            <CustomerDetailsStep
              customer={customer}
              errors={customerErrors}
              onChange={updateCustomer}
            />
          ) : null}

          {step === 2 ? (
            <InvoiceWorkPricingStep
              defaults={defaults}
              grandTotal={grandTotal}
              itemsError={itemsError}
              onItemsChange={setWorkItems}
              onWorkChange={updateWork}
              subtotal={subtotal}
              work={work}
            />
          ) : null}

          {step === 3 ? (
            <InvoicePreviewStep
              customer={customer}
              defaults={defaults}
              discountAmount={discountAmount}
              grandTotal={grandTotal}
              onGoToStep={setStep}
              onItemsChange={setWorkItems}
              onWorkChange={updateWork}
              subtotal={subtotal}
              work={work}
            />
          ) : null}
        </div>

        <footer className="border-t border-border-soft px-4 py-3 sm:px-8">
          <div className="flex gap-2">
            {step > 1 ? (
              <button
                className="h-11 flex-1 rounded-full border border-border-strong text-sm font-medium disabled:opacity-70"
                disabled={isPending}
                onClick={() => setStep((current) => current - 1)}
                type="button"
              >
                Back
              </button>
            ) : (
              <button
                className="h-11 flex-1 rounded-full border border-border-strong text-sm font-medium"
                disabled={isPending}
                onClick={onClose}
                type="button"
              >
                Cancel
              </button>
            )}

            {step < 3 ? (
              <button
                className="h-11 flex-1 rounded-full bg-primary text-sm font-medium text-primary-foreground disabled:opacity-70"
                disabled={isPending}
                onClick={() => {
                  if (validateStep(step)) {
                    setStep((current) => current + 1);
                  }
                }}
                type="button"
              >
                Next
              </button>
            ) : (
              <button
                aria-busy={isPending}
                className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-primary text-sm font-medium text-primary-foreground disabled:opacity-70"
                disabled={isPending}
                onClick={handleSubmit}
                type="button"
              >
                {isPending ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    {isEditing ? "Saving..." : "Creating..."}
                  </>
                ) : isEditing ? (
                  "Save changes"
                ) : (
                  "Create invoice"
                )}
              </button>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
}