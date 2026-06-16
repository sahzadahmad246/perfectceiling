"use client";

import { Loader2, Plus, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

import {
  createQuotation,
  type QuotationDefaults,
} from "@/app/admin/quotations/actions";
import {
  calculateGrandTotal,
  calculateLineItemAmount,
  calculateSubtotal,
  createEmptyLineItem,
  formatCurrency,
  formatUnitType,
  type QuotationCustomerDraft,
  type QuotationLineItemDraft,
  type QuotationWorkDraft,
} from "@/lib/quotations";

const inputClass =
  "mt-2 h-11 w-full rounded-md border border-border-strong bg-surface px-3 text-sm outline-none transition focus:border-primary";

const textareaClass =
  "mt-2 w-full rounded-md border border-border-strong bg-surface px-3 py-2 text-sm leading-6 outline-none transition focus:border-primary";

type QuotationCreateModalProps = {
  open: boolean;
  defaults: QuotationDefaults;
  onClose: () => void;
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
  items: [createEmptyLineItem()],
  discount: "",
  quotationTerms: defaults.quotationTerms,
});

export function QuotationCreateModal({
  open,
  defaults,
  onClose,
}: QuotationCreateModalProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [customer, setCustomer] = useState(emptyCustomer);
  const [work, setWork] = useState(() => emptyWork(defaults));
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) {
      return;
    }

    setStep(1);
    setCustomer(emptyCustomer());
    setWork(emptyWork(defaults));
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [defaults, open]);

  const subtotal = useMemo(() => calculateSubtotal(work.items), [work.items]);
  const grandTotal = useMemo(
    () => calculateGrandTotal(subtotal, work.discount),
    [subtotal, work.discount],
  );

  if (!open) {
    return null;
  }

  function updateCustomer<K extends keyof QuotationCustomerDraft>(
    key: K,
    value: QuotationCustomerDraft[K],
  ) {
    setCustomer((current) => ({ ...current, [key]: value }));
  }

  function updateWork<K extends keyof QuotationWorkDraft>(
    key: K,
    value: QuotationWorkDraft[K],
  ) {
    setWork((current) => ({ ...current, [key]: value }));
  }

  function updateItem(
    id: string,
    patch: Partial<QuotationLineItemDraft>,
  ) {
    setWork((current) => ({
      ...current,
      items: current.items.map((item) =>
        item.id === id ? { ...item, ...patch } : item,
      ),
    }));
  }

  function addItem() {
    setWork((current) => ({
      ...current,
      items: [...current.items, createEmptyLineItem()],
    }));
  }

  function removeItem(id: string) {
    setWork((current) => ({
      ...current,
      items:
        current.items.length === 1
          ? [createEmptyLineItem()]
          : current.items.filter((item) => item.id !== id),
    }));
  }

  function validateStep(currentStep: number) {
    if (currentStep === 1) {
      if (!customer.name.trim()) {
        toast.error("Enter customer name.");
        return false;
      }

      if (!customer.phone.trim()) {
        toast.error("Enter customer phone.");
        return false;
      }
    }

    if (currentStep === 2) {
      const validItems = work.items.filter((item) => item.name.trim());

      if (validItems.length === 0) {
        toast.error("Add at least one work item.");
        return false;
      }

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

  function handleCreate() {
    startTransition(async () => {
      const result = await createQuotation({ customer, work });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success("Quotation created.");
      onClose();
      router.push(`/admin/quotations/${result.id}`);
      router.refresh();
    });
  }

  return (
    <div className="fixed inset-0 z-[9990] flex flex-col bg-surface">
      <header className="flex items-center justify-between border-b border-border-soft px-4 py-3">
        <div>
          <p className="text-xs text-muted">Step {step} of 3</p>
          <h2 className="font-primary text-lg font-medium">
            {step === 1
              ? "Customer details"
              : step === 2
                ? "Work & pricing"
                : "Preview"}
          </h2>
        </div>
        <button
          aria-label="Close quotation form"
          className="inline-flex items-center justify-center text-foreground transition hover:text-primary"
          disabled={isPending}
          onClick={onClose}
          type="button"
        >
          <X size={22} strokeWidth={2.5} />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-5">
        {step === 1 ? (
          <div className="space-y-4">
            <label className="block text-sm font-medium">
              Customer name
              <input
                className={inputClass}
                onChange={(event) => updateCustomer("name", event.target.value)}
                value={customer.name}
              />
            </label>
            <label className="block text-sm font-medium">
              Mobile number
              <input
                className={inputClass}
                onChange={(event) => updateCustomer("phone", event.target.value)}
                value={customer.phone}
              />
            </label>
            <label className="block text-sm font-medium">
              WhatsApp
              <input
                className={inputClass}
                onChange={(event) =>
                  updateCustomer("whatsapp", event.target.value)
                }
                placeholder="Optional"
                value={customer.whatsapp}
              />
            </label>
            <label className="block text-sm font-medium">
              Email
              <input
                className={inputClass}
                onChange={(event) => updateCustomer("email", event.target.value)}
                placeholder="Optional"
                type="email"
                value={customer.email}
              />
            </label>
            <label className="block text-sm font-medium">
              Address
              <textarea
                className={`${textareaClass} min-h-20`}
                onChange={(event) =>
                  updateCustomer("address", event.target.value)
                }
                placeholder="Optional"
                value={customer.address}
              />
            </label>
            <label className="block text-sm font-medium">
              City
              <input
                className={inputClass}
                onChange={(event) => updateCustomer("city", event.target.value)}
                placeholder="Optional"
                value={customer.city}
              />
            </label>
            <label className="block text-sm font-medium">
              Notes
              <textarea
                className={`${textareaClass} min-h-20`}
                onChange={(event) => updateCustomer("notes", event.target.value)}
                placeholder="Optional"
                value={customer.notes}
              />
            </label>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="space-y-5">
            <label className="block text-sm font-medium">
              Work title
              <input
                className={inputClass}
                onChange={(event) => updateWork("workTitle", event.target.value)}
                placeholder="e.g. POP false ceiling for hall"
                value={work.workTitle}
              />
            </label>

            <div className="space-y-4">
              {work.items.map((item, index) => (
                <article
                  className="rounded-md border border-border-soft bg-surface-raised/60 p-4"
                  key={item.id}
                >
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="text-sm font-medium">Item {index + 1}</p>
                    <button
                      aria-label={`Remove item ${index + 1}`}
                      className="inline-flex size-8 items-center justify-center rounded-full border border-border-strong text-muted transition hover:border-primary hover:text-foreground"
                      onClick={() => removeItem(item.id)}
                      type="button"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <label className="block text-sm font-medium">
                    Item name
                    <input
                      className={inputClass}
                      onChange={(event) =>
                        updateItem(item.id, { name: event.target.value })
                      }
                      value={item.name}
                    />
                  </label>

                  <label className="mt-3 block text-sm font-medium">
                    Item description
                    <textarea
                      className={`${textareaClass} min-h-16`}
                      onChange={(event) =>
                        updateItem(item.id, { description: event.target.value })
                      }
                      placeholder="Optional"
                      value={item.description}
                    />
                  </label>

                  <label className="mt-3 flex items-center gap-2 text-sm">
                    <input
                      checked={item.isLumpSum}
                      className="size-4 rounded border-border-strong"
                      onChange={(event) =>
                        updateItem(item.id, {
                          isLumpSum: event.target.checked,
                          unitType: event.target.checked
                            ? "lump_sum"
                            : item.unitType === "lump_sum"
                              ? "sq_ft"
                              : item.unitType,
                        })
                      }
                      type="checkbox"
                    />
                    Lump sum only (no area/rate)
                  </label>

                  {!item.isLumpSum ? (
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      <label className="block text-sm font-medium">
                        Area
                        <input
                          className={inputClass}
                          inputMode="decimal"
                          onChange={(event) =>
                            updateItem(item.id, { quantity: event.target.value })
                          }
                          value={item.quantity}
                        />
                      </label>
                      <label className="block text-sm font-medium">
                        Unit
                        <select
                          className={inputClass}
                          onChange={(event) =>
                            updateItem(item.id, {
                              unitType: event.target
                                .value as QuotationLineItemDraft["unitType"],
                            })
                          }
                          value={item.unitType}
                        >
                          <option value="sq_ft">sq.ft</option>
                          <option value="running_ft">running ft</option>
                          <option value="piece">piece</option>
                        </select>
                      </label>
                      <label className="col-span-2 block text-sm font-medium">
                        Rate
                        <input
                          className={inputClass}
                          inputMode="decimal"
                          onChange={(event) =>
                            updateItem(item.id, { rate: event.target.value })
                          }
                          value={item.rate}
                        />
                      </label>
                    </div>
                  ) : (
                    <label className="mt-3 block text-sm font-medium">
                      Total amount
                      <input
                        className={inputClass}
                        inputMode="decimal"
                        onChange={(event) =>
                          updateItem(item.id, { amount: event.target.value })
                        }
                        value={item.amount}
                      />
                    </label>
                  )}

                  <label className="mt-3 block text-sm font-medium">
                    Notes
                    <textarea
                      className={`${textareaClass} min-h-14`}
                      onChange={(event) =>
                        updateItem(item.id, { notes: event.target.value })
                      }
                      placeholder="Optional"
                      value={item.notes}
                    />
                  </label>

                  <p className="mt-3 text-sm text-muted">
                    Line total:{" "}
                    <span className="font-medium text-foreground">
                      {formatCurrency(calculateLineItemAmount(item))}
                    </span>
                  </p>
                </article>
              ))}
            </div>

            <button
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-full border border-border-strong text-sm font-medium transition hover:border-primary"
              onClick={addItem}
              type="button"
            >
              <Plus size={16} />
              Add item
            </button>

            <div className="rounded-md border border-border-soft bg-surface-muted/70 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">Subtotal</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              <label className="mt-3 block text-sm font-medium">
                Discount
                <input
                  className={inputClass}
                  inputMode="decimal"
                  onChange={(event) => updateWork("discount", event.target.value)}
                  placeholder="0"
                  value={work.discount}
                />
              </label>
              <div className="mt-3 flex items-center justify-between border-t border-border-soft pt-3 text-sm">
                <span className="font-medium">Grand total</span>
                <span className="font-primary text-lg font-medium">
                  {formatCurrency(grandTotal)}
                </span>
              </div>
            </div>

            <label className="block text-sm font-medium">
              Quotation terms
              <textarea
                className={`${textareaClass} min-h-28`}
                onChange={(event) =>
                  updateWork("quotationTerms", event.target.value)
                }
                value={work.quotationTerms}
              />
            </label>

            {defaults.bankDetails ? (
              <div className="rounded-md border border-border-soft bg-surface-raised/60 p-4">
                <p className="text-sm font-medium">Payment / bank details</p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted">
                  {defaults.bankDetails}
                </p>
              </div>
            ) : null}
          </div>
        ) : null}

        {step === 3 ? (
          <div className="space-y-5">
            <section className="rounded-md border border-border-soft bg-surface-raised/60 p-4">
              <p className="text-sm font-medium">Customer</p>
              <p className="mt-2 text-sm text-foreground">{customer.name}</p>
              <p className="text-sm text-muted">{customer.phone}</p>
              {customer.address ? (
                <p className="mt-2 whitespace-pre-wrap text-sm text-muted">
                  {customer.address}
                </p>
              ) : null}
            </section>

            <section className="rounded-md border border-border-soft bg-surface-raised/60 p-4">
              <p className="text-sm font-medium">Work</p>
              {work.workTitle ? (
                <p className="mt-2 text-sm text-foreground">{work.workTitle}</p>
              ) : null}
              <ul className="mt-3 space-y-3">
                {work.items
                  .filter((item) => item.name.trim())
                  .map((item) => (
                    <li
                      className="border-b border-border-soft pb-3 last:border-b-0 last:pb-0"
                      key={item.id}
                    >
                      <p className="text-sm font-medium">{item.name}</p>
                      {item.description ? (
                        <p className="mt-1 text-sm text-muted">
                          {item.description}
                        </p>
                      ) : null}
                      <p className="mt-1 text-sm text-muted">
                        {item.isLumpSum
                          ? "Lump sum"
                          : `${item.quantity} ${formatUnitType(item.unitType)} × ${item.rate}`}
                      </p>
                      <p className="mt-1 text-sm font-medium">
                        {formatCurrency(calculateLineItemAmount(item))}
                      </p>
                    </li>
                  ))}
              </ul>
              <div className="mt-4 space-y-2 border-t border-border-soft pt-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted">Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Discount</span>
                  <span>{formatCurrency(Number(work.discount) || 0)}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Grand total</span>
                  <span>{formatCurrency(grandTotal)}</span>
                </div>
              </div>
            </section>

            {work.quotationTerms ? (
              <section className="rounded-md border border-border-soft bg-surface-raised/60 p-4">
                <p className="text-sm font-medium">Quotation terms</p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted">
                  {work.quotationTerms}
                </p>
              </section>
            ) : null}

            {defaults.bankDetails ? (
              <section className="rounded-md border border-border-soft bg-surface-raised/60 p-4">
                <p className="text-sm font-medium">Payment / bank details</p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted">
                  {defaults.bankDetails}
                </p>
              </section>
            ) : null}
          </div>
        ) : null}
      </div>

      <footer className="border-t border-border-soft px-4 py-3">
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
              className="h-11 flex-1 rounded-full bg-primary text-sm font-medium text-primary-foreground"
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
              onClick={handleCreate}
              type="button"
            >
              {isPending ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Creating...
                </>
              ) : (
                "Create quotation"
              )}
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}