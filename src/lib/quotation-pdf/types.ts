export type QuotationPdfBusinessInfo = {
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

export type QuotationPdfItem = {
  name: string;
  description: string;
  notes: string;
  quantityLabel: string;
  amountLabel: string;
};

export type QuotationPdfImage = {
  itemName: string;
  label: string;
  dataUri: string;
};

export type QuotationPdfPayload = {
  quotationNumber: string;
  workTitle: string;
  workSubtitle: string;
  dateLabel: string;
  validUntilLabel: string | null;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerNotes: string;
  items: QuotationPdfItem[];
  subtotalLabel: string;
  discountLabel: string | null;
  discountAmountLabel: string | null;
  grandTotalLabel: string;
  terms: string[];
  images: QuotationPdfImage[];
  business: QuotationPdfBusinessInfo;
};