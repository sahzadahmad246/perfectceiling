import React from "react";
import { pdf, Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";

export type QuotationPdfData = {
  business: {
    name: string;
    address?: string | null;
    phone?: string | null;
    secondaryPhone?: string | null;
    logoUrl?: string | null;
  };
  quotation: {
    id: string;
    type: "DETAILED" | "LUMPSUM";
    customerName: string;
    customerPhone: string;
    customerAddress?: string | null;
    items: Array<{
      description: string;
      areaSqft?: number | null;
      ratePerSqft?: number | null;
      quantity?: number | null;
      amount: number;
    }>;
    subtotal: number;
    discountAmount: number;
    total: number;
    notes?: string | null;
    terms: string[];
  };
};

const styles = StyleSheet.create({
  page: { padding: 24 },
  row: { display: "flex", flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  h1: { fontSize: 18, marginBottom: 8 },
  h2: { fontSize: 14, marginTop: 12, marginBottom: 6 },
  text: { fontSize: 10 },
  divider: { marginVertical: 8, borderBottomWidth: 1, borderBottomColor: "#e5e7eb" },
});

export async function generateQuotationPdf(data: QuotationPdfData): Promise<Buffer> {
  const doc = (
    <Document>
      <Page size="A4" style={styles.page}>
        {data.business.logoUrl ? (
          <View style={{ marginBottom: 8, flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Image src={data.business.logoUrl} style={{ width: 64, height: 64, objectFit: "contain" }} />
            <Text style={styles.h1}>{data.business.name}</Text>
          </View>
        ) : (
          <Text style={styles.h1}>{data.business.name}</Text>
        )}
        <View style={styles.row}>
          <Text style={styles.text}>{data.business.address || ""}</Text>
          <Text style={styles.text}>
            {data.business.phone}
            {data.business.secondaryPhone ? ` / ${data.business.secondaryPhone}` : ""}
          </Text>
        </View>
        <View style={styles.divider} />
        <Text style={styles.h2}>Quotation</Text>
        <View style={{ marginBottom: 8 }}>
          <Text style={styles.text}>Customer: {data.quotation.customerName}</Text>
          <Text style={styles.text}>Phone: {data.quotation.customerPhone}</Text>
          {data.quotation.customerAddress ? (
            <Text style={styles.text}>Address: {data.quotation.customerAddress}</Text>
          ) : null}
        </View>
        <Text style={styles.h2}>Items</Text>
        {data.quotation.items.map((item, idx) => (
          <View key={idx} style={styles.row}>
            <Text style={styles.text}>
              {idx + 1}. {item.description}
            </Text>
            <Text style={styles.text}>₹ {item.amount.toFixed(2)}</Text>
          </View>
        ))}
        <View style={styles.divider} />
        <View style={styles.row}>
          <Text style={styles.text}>Subtotal</Text>
          <Text style={styles.text}>₹ {data.quotation.subtotal.toFixed(2)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.text}>Discount</Text>
          <Text style={styles.text}>₹ {data.quotation.discountAmount.toFixed(2)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.text}>Grand Total</Text>
          <Text style={styles.text}>₹ {data.quotation.total.toFixed(2)}</Text>
        </View>
        {data.quotation.notes ? (
          <View>
            <Text style={styles.h2}>Notes</Text>
            <Text style={styles.text}>{data.quotation.notes}</Text>
          </View>
        ) : null}
        {data.quotation.terms.length ? (
          <View>
            <Text style={styles.h2}>Terms & Conditions</Text>
            {data.quotation.terms.map((t, i) => (
              <Text key={i} style={styles.text}>• {t}</Text>
            ))}
          </View>
        ) : null}
      </Page>
    </Document>
  );
  const file = await pdf(doc).toBuffer();
  return file as unknown as Buffer;
}


