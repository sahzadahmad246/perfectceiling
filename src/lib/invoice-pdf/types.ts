export type InvoicePdfItem = {
  name: string;
  description: string;
  notes: string;
  quantityLabel: string;
  amountLabel: string;
};

export type InvoicePdfPayment = {
  dateLabel: string;
  amountLabel: string;
  notes: string;
};

export type InvoicePdfPayload = {
  invoiceNumber: string;
  workTitle: string;
  workSubtitle: string;
  dateLabel: string;
  dueDateLabel: string | null;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerNotes: string;
  items: InvoicePdfItem[];
  subtotalLabel: string;
  discountLabel: string | null;
  discountAmountLabel: string | null;
  grandTotalLabel: string;
  paidAmountLabel: string;
  balanceAmountLabel: string;
  payments: InvoicePdfPayment[];
  terms: string[];
  business: {
    businessName: string;
    logoDataUri: string | null;
    phone: string;
    whatsapp: string;
    email: string;
    address: string;
    city: string;
    gstNumber: string;
    bankDetails: string;
  };
};