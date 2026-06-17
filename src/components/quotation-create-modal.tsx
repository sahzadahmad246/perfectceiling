"use client";

import { Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { toast } from "sonner";

import {
  createQuotation,
  getQuotationEditData,
  listQuotationDrafts,
  saveQuotationDraft,
  updateQuotation,
  type QuotationDefaults,
} from "@/app/admin/quotations/actions";
import { CustomerDetailsStep } from "@/components/customer-details-step";
import { QuotationDraftPicker } from "@/components/quotation-draft-picker";
import { QuotationPreviewStep } from "@/components/quotation-preview-step";
import { WorkPricingStep } from "@/components/work-pricing-step";
import {
  validateQuotationCustomer,
  type CustomerFieldErrors,
} from "@/lib/customer-validation";
import {
  calculateDiscountAmount,
  calculateGrandTotal,
  calculateLineItemAmount,
  calculateSubtotal,
  formatRelativeTime,
  formatTimeOfDay,
  hasDraftContent,
  type CreateQuotationInput,
  type QuotationCustomerDraft,
  type QuotationDraftListItem,
  type QuotationLineItemDraft,
  type QuotationWorkDraft,
} from "@/lib/quotations";

type QuotationCreateModalProps = {
  open: boolean;
  defaults: QuotationDefaults;
  onClose: () => void;
  quotationId?: string;
  initialData?: CreateQuotationInput;
};

const emptyCustomer = (): QuotationCustomerDraft => ({
  name: "",
  phone: "",
  whatsapp: "",
  email: "",
  address: "",
  city: "",
  notes: "",
});

const emptyWork = (defaults: QuotationDefaults): QuotationWorkDraft => ({
  workTitle: "",
  items: [],
  discount: "",
  discountType: "fixed",
  quotationTerms: defaults.quotationTerms,
});

export function QuotationCreateModal({
  open,
  defaults,
  onClose,
  quotationId,
  initialData,
}: QuotationCreateModalProps) {
  const router = useRouter();
  const isEditing = Boolean(quotationId && initialData);
  const [step, setStep] = useState(1);
  const [customer, setCustomer] = useState(emptyCustomer);
  const [work, setWork] = useState(() => emptyWork(defaults));
  const [customerErrors, setCustomerErrors] = useState<CustomerFieldErrors>({});
  const [itemsError, setItemsError] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();
  const [activeDraftId, setActiveDraftId] = useState<string | null>(null);
  const [draftPickerOpen, setDraftPickerOpen] = useState(false);
  const [draftChoiceMade, setDraftChoiceMade] = useState(false);
  const [drafts, setDrafts] = useState<QuotationDraftListItem[]>([]);
  const [loadingDrafts, setLoadingDrafts] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [draftSaveStatus, setDraftSaveStatus] = useState<
    "idle" | "saving" | "saved"
  >("idle");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [relativeNow, setRelativeNow] = useState(() => Date.now());
  const activeDraftIdRef = useRef<string | null>(null);
  const lastSavedAtRef = useRef<Date | null>(null);

  useEffect(() => {
    activeDraftIdRef.current = activeDraftId;
  }, [activeDraftId]);

  useEffect(() => {
    lastSavedAtRef.current = lastSavedAt;
  }, [lastSavedAt]);

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

    setStep(1);
    setCustomerErrors({});
    setItemsError(undefined);
    setActiveDraftId(null);
    activeDraftIdRef.current = null;
    setDraftChoiceMade(false);
    setDraftPickerOpen(false);
    setDrafts([]);
    setDraftSaveStatus("idle");
    setLastSavedAt(null);

    if (isEditing && initialData) {
      setCustomer(initialData.customer);
      setWork({
        ...initialData.work,
        discountType: initialData.work.discountType ?? "fixed",
      });
      setDraftChoiceMade(true);
      return;
    }

    setCustomer(emptyCustomer());
    setWork(emptyWork(defaults));

    setLoadingDrafts(true);

    listQuotationDrafts()
      .then((fetchedDrafts) => {
        setDrafts(fetchedDrafts);

        if (fetchedDrafts.length > 0) {
          setDraftPickerOpen(true);
        } else {
          setDraftChoiceMade(true);
        }
      })
      .catch(() => {
        setDraftChoiceMade(true);
      })
      .finally(() => {
        setLoadingDrafts(false);
      });
  }, [defaults, initialData, isEditing, open]);

  const persistDraft = useCallback(async () => {
    if (isEditing || !draftChoiceMade) {
      return;
    }

    const input = { customer, work };

    if (!hasDraftContent(input)) {
      return;
    }

    setDraftSaveStatus("saving");

    const result = await saveQuotationDraft(activeDraftIdRef.current, input);

    if (result.success) {
      setActiveDraftId(result.id);
      activeDraftIdRef.current = result.id;
      const savedAt = new Date();
      setLastSavedAt(savedAt);
      setRelativeNow(savedAt.getTime());
      setDraftSaveStatus("saved");
      return;
    }

    setDraftSaveStatus(lastSavedAtRef.current ? "saved" : "idle");
  }, [customer, draftChoiceMade, isEditing, work]);

  useEffect(() => {
    if (!open || isEditing || !draftChoiceMade) {
      return;
    }

    const input = { customer, work };

    if (!hasDraftContent(input)) {
      return;
    }

    const timer = window.setTimeout(() => {
      void persistDraft();
    }, 1500);

    return () => window.clearTimeout(timer);
  }, [customer, draftChoiceMade, isEditing, open, persistDraft, work]);

  useEffect(() => {
    if (!open || isEditing || !draftChoiceMade) {
      return;
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "hidden") {
        void persistDraft();
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [draftChoiceMade, isEditing, open, persistDraft]);

  useEffect(() => {
    if (!lastSavedAt) {
      return;
    }

    const timer = window.setInterval(() => {
      setRelativeNow(Date.now());
    }, 30000);

    return () => window.clearInterval(timer);
  }, [lastSavedAt]);

  const showDraftSaveStatus =
    !isEditing && draftChoiceMade && hasDraftContent({ customer, work });

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

  async function refreshDrafts() {
    const fetchedDrafts = await listQuotationDrafts();
    setDrafts(fetchedDrafts);

    if (fetchedDrafts.length === 0) {
      setDraftPickerOpen(false);
      setDraftChoiceMade(true);
    }
  }

  async function handleRestoreDraft(draftId: string) {
    const data = await getQuotationEditData(draftId);

    if (!data) {
      toast.error("Could not load draft.");
      return;
    }

    setCustomer(data.customer);
    setWork({
      ...data.work,
      discountType: data.work.discountType ?? "fixed",
    });
    setActiveDraftId(draftId);
    activeDraftIdRef.current = draftId;
    setDraftPickerOpen(false);
    setDraftChoiceMade(true);

    const restoredDraft = drafts.find((draft) => draft.id === draftId);

    if (restoredDraft?.updatedAt) {
      const restoredAt = new Date(restoredDraft.updatedAt);
      setLastSavedAt(restoredAt);
      setRelativeNow(restoredAt.getTime());
      setDraftSaveStatus("saved");
    }
  }

  function handleStartNew() {
    setCustomer(emptyCustomer());
    setWork(emptyWork(defaults));
    setActiveDraftId(null);
    activeDraftIdRef.current = null;
    setDraftPickerOpen(false);
    setDraftChoiceMade(true);
    setDraftSaveStatus("idle");
    setLastSavedAt(null);
  }

  async function handleClose() {
    if (!isEditing && draftChoiceMade && hasDraftContent({ customer, work })) {
      setIsSavingDraft(true);
      await persistDraft();
      setIsSavingDraft(false);
    }

    onClose();
  }

  function updateCustomer<K extends keyof QuotationCustomerDraft>(
    key: K,
    value: QuotationCustomerDraft[K],
  ) {
    setCustomer((current) => ({ ...current, [key]: value }));

    if (key === "name" || key === "phone" || key === "address") {
      setCustomerErrors((current) => ({ ...current, [key]: undefined }));
    }
  }

  function updateWork<K extends keyof QuotationWorkDraft>(
    key: K,
    value: QuotationWorkDraft[K],
  ) {
    setWork((current) => ({ ...current, [key]: value }));
  }

  function setWorkItems(items: QuotationLineItemDraft[]) {
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
        ? await updateQuotation(quotationId!, { customer, work })
        : await createQuotation({ customer, work }, activeDraftIdRef.current);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success(isEditing ? "Quotation updated." : "Quotation created.");
      onClose();
      router.push(`/admin/quotations/${result.id}`);
      router.refresh();
    });
  }

  const isBusy = isPending || isSavingDraft || loadingDrafts;

  return (
    <>
      <div className="fixed inset-0 z-[9990] flex justify-center bg-background/80 backdrop-blur-sm">
        <div className="flex h-full w-full max-w-[560px] flex-col border-x border-border-soft bg-surface shadow-popover">
          <header className="flex items-center justify-between border-b border-border-soft px-4 py-3 sm:px-8">
            <div>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted">
                <span>Step {step} of 3</span>
                {showDraftSaveStatus ? (
                  <>
                    <span aria-hidden>·</span>
                    {draftSaveStatus === "saving" || isSavingDraft ? (
                      <span className="inline-flex items-center gap-1.5 text-primary">
                        <Loader2 className="animate-spin" size={12} />
                        Saving...
                      </span>
                    ) : lastSavedAt ? (
                      <span>
                        Last saved {formatRelativeTime(lastSavedAt, relativeNow)}{" "}
                        · {formatTimeOfDay(lastSavedAt)}
                      </span>
                    ) : null}
                  </>
                ) : null}
              </div>
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
              aria-label="Close quotation form"
              className="inline-flex items-center justify-center text-foreground transition hover:text-primary"
              disabled={isBusy}
              onClick={() => void handleClose()}
              type="button"
            >
              <X size={22} strokeWidth={2.5} />
            </button>
          </header>

          <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-8">
            {loadingDrafts && !isEditing ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="animate-spin text-muted" size={28} />
                <p className="mt-3 text-sm text-muted">Checking for saved drafts...</p>
              </div>
            ) : (
              <>
                {step === 1 ? (
                  <CustomerDetailsStep
                    customer={customer}
                    errors={customerErrors}
                    onChange={updateCustomer}
                  />
                ) : null}

                {step === 2 ? (
                  <WorkPricingStep
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
                  <QuotationPreviewStep
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
              </>
            )}
          </div>

          <footer className="border-t border-border-soft px-4 py-3 sm:px-8">
            <div className="flex gap-2">
              {step > 1 ? (
                <button
                  className="h-11 flex-1 rounded-full border border-border-strong text-sm font-medium disabled:opacity-70"
                  disabled={isBusy}
                  onClick={() => setStep((current) => current - 1)}
                  type="button"
                >
                  Back
                </button>
              ) : (
                <button
                  className="h-11 flex-1 rounded-full border border-border-strong text-sm font-medium"
                  disabled={isBusy}
                  onClick={() => void handleClose()}
                  type="button"
                >
                  Cancel
                </button>
              )}

              {step < 3 ? (
                <button
                  className="h-11 flex-1 rounded-full bg-primary text-sm font-medium text-primary-foreground disabled:opacity-70"
                  disabled={isBusy || loadingDrafts}
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
                  disabled={isBusy}
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
                    "Create quotation"
                  )}
                </button>
              )}
            </div>
          </footer>
        </div>
      </div>

      {draftPickerOpen ? (
        <QuotationDraftPicker
          drafts={drafts}
          onClose={handleStartNew}
          onRefresh={() => void refreshDrafts()}
          onRestore={(draftId) => void handleRestoreDraft(draftId)}
          onStartNew={handleStartNew}
        />
      ) : null}
    </>
  );
}