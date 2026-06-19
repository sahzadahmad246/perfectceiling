import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import type { ReactNode } from "react";

import type { InvoicePdfPayload } from "./types";

const styles = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingBottom: 42,
    paddingHorizontal: 40,
    fontSize: 9.5,
    fontFamily: "Helvetica",
    color: "#18181b",
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
    marginBottom: 14,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#d4d4d8",
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    maxWidth: "64%",
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 8,
    objectFit: "cover",
  },
  logoFallback: {
    width: 72,
    height: 72,
    borderRadius: 8,
    backgroundColor: "#18181b",
    alignItems: "center",
    justifyContent: "center",
  },
  logoFallbackText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: 700,
  },
  businessName: {
    fontSize: 14,
    fontWeight: 700,
    marginBottom: 5,
    color: "#18181b",
  },
  businessLine: {
    color: "#52525b",
    fontSize: 8.5,
    lineHeight: 1.55,
  },
  metaBox: {
    alignItems: "flex-end",
    minWidth: 150,
  },
  metaLabel: {
    fontSize: 8,
    color: "#71717a",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 3,
  },
  metaValue: {
    fontSize: 11,
    fontWeight: 700,
    marginBottom: 8,
  },
  metaMuted: {
    color: "#71717a",
    fontSize: 8.5,
    lineHeight: 1.45,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitleDark: {
    fontSize: 10,
    fontWeight: 700,
    color: "#18181b",
    marginBottom: 8,
  },
  accentPanel: {
    flexDirection: "row",
    backgroundColor: "#f4f4f5",
    borderRadius: 6,
    overflow: "hidden",
  },
  accentBorder: {
    width: 4,
    backgroundColor: "#18181b",
  },
  accentContent: {
    flex: 1,
    paddingVertical: 11,
    paddingHorizontal: 12,
  },
  detailLine: {
    fontSize: 9.5,
    lineHeight: 1.5,
    marginBottom: 5,
  },
  detailLineLast: {
    fontSize: 9.5,
    lineHeight: 1.5,
  },
  detailLabel: {
    fontWeight: 700,
    color: "#18181b",
  },
  detailValue: {
    color: "#3f3f46",
  },
  workTitleText: {
    fontSize: 10,
    lineHeight: 1.5,
    color: "#3f3f46",
  },
  bodyText: {
    fontSize: 9.5,
    lineHeight: 1.55,
    color: "#3f3f46",
  },
  table: {
    borderWidth: 1,
    borderColor: "#e4e4e7",
    borderRadius: 10,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#18181b",
    color: "#ffffff",
    paddingVertical: 8,
    paddingHorizontal: 10,
    fontSize: 8,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f1f3",
  },
  colItem: {
    width: "52%",
    paddingRight: 8,
  },
  colQty: {
    width: "28%",
    paddingRight: 8,
  },
  colAmount: {
    width: "20%",
    textAlign: "right",
  },
  itemName: {
    fontSize: 10,
    fontWeight: 700,
    marginBottom: 2,
  },
  itemDescription: {
    fontSize: 8.5,
    color: "#71717a",
    lineHeight: 1.4,
    marginBottom: 2,
  },
  itemNotes: {
    fontSize: 8,
    color: "#52525b",
    lineHeight: 1.35,
  },
  totalsCard: {
    marginTop: 12,
    marginLeft: "auto",
    width: 240,
    borderWidth: 1,
    borderColor: "#e4e4e7",
    borderRadius: 10,
    overflow: "hidden",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f1f3",
  },
  totalRowMuted: {
    color: "#71717a",
  },
  totalRowDiscount: {
    color: "#e11d48",
  },
  totalRowPaid: {
    color: "#15803d",
  },
  totalRowDue: {
    color: "#e11d48",
  },
  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "#18181b",
    color: "#ffffff",
  },
  grandTotalLabel: {
    fontSize: 10,
    fontWeight: 700,
  },
  grandTotalValue: {
    fontSize: 12,
    fontWeight: 700,
  },
  termsList: {
    gap: 6,
  },
  termRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-start",
  },
  termBullet: {
    width: 5,
    height: 5,
    borderRadius: 999,
    backgroundColor: "#18181b",
    marginTop: 4,
  },
  termText: {
    flex: 1,
    fontSize: 9.5,
    lineHeight: 1.5,
    color: "#3f3f46",
  },
  paymentColDate: {
    width: "24%",
    paddingRight: 8,
  },
  paymentColAmount: {
    width: "22%",
    paddingRight: 8,
    textAlign: "right",
  },
  paymentColNotes: {
    width: "54%",
  },
  paymentAmount: {
    fontSize: 9.5,
    fontWeight: 700,
    color: "#15803d",
  },
  paymentNotes: {
    fontSize: 8.5,
    color: "#52525b",
    lineHeight: 1.4,
  },
  footer: {
    position: "absolute",
    left: 40,
    right: 40,
    bottom: 18,
    borderTopWidth: 1,
    borderTopColor: "#f1f1f3",
    paddingTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    color: "#a1a1aa",
    fontSize: 8,
  },
});

function BusinessLogo({ logoDataUri }: { logoDataUri: string | null }) {
  if (logoDataUri) {
    return <Image src={logoDataUri} style={styles.logo} />;
  }

  return (
    <View style={styles.logoFallback}>
      <Text style={styles.logoFallbackText}>PC</Text>
    </View>
  );
}

function AccentPanel({ children }: { children: ReactNode }) {
  return (
    <View style={styles.accentPanel}>
      <View style={styles.accentBorder} />
      <View style={styles.accentContent}>{children}</View>
    </View>
  );
}

function DetailLine({
  label,
  value,
  isLast = false,
}: {
  label: string;
  value: string;
  isLast?: boolean;
}) {
  if (!value.trim()) {
    return null;
  }

  return (
    <Text style={isLast ? styles.detailLineLast : styles.detailLine}>
      <Text style={styles.detailLabel}>{label}: </Text>
      <Text style={styles.detailValue}>{value}</Text>
    </Text>
  );
}

export function InvoicePdfDocument({ data }: { data: InvoicePdfPayload }) {
  const businessLines = [
    data.business.phone,
    data.business.whatsapp,
    data.business.email,
    [data.business.address, data.business.city].filter(Boolean).join(", "),
    data.business.gstNumber ? `GST: ${data.business.gstNumber}` : "",
  ].filter(Boolean);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.brandRow}>
            <BusinessLogo logoDataUri={data.business.logoDataUri} />
            <View>
              <Text style={styles.businessName}>{data.business.businessName}</Text>
              {businessLines.map((line, index) => (
                <Text key={`business-line-${index}`} style={styles.businessLine}>
                  {line}
                </Text>
              ))}
            </View>
          </View>

          <View style={styles.metaBox}>
            <Text style={styles.metaLabel}>Invoice</Text>
            <Text style={styles.metaValue}>{data.invoiceNumber}</Text>
            <Text style={styles.metaMuted}>Date: {data.dateLabel}</Text>
            {data.dueDateLabel ? (
              <Text style={styles.metaMuted}>Due: {data.dueDateLabel}</Text>
            ) : null}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitleDark}>Work details</Text>
          <AccentPanel>
            <Text style={styles.workTitleText}>{data.workSubtitle}</Text>
          </AccentPanel>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitleDark}>Customer details</Text>
          <AccentPanel>
            <DetailLine label="Name" value={data.customerName} />
            <DetailLine label="Mobile" value={data.customerPhone} />
            <DetailLine isLast label="Address" value={data.customerAddress} />
          </AccentPanel>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitleDark}>Work items</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.colItem}>Item</Text>
              <Text style={styles.colQty}>Quantity</Text>
              <Text style={styles.colAmount}>Amount</Text>
            </View>

            {data.items.map((item, index) => (
              <View key={`item-${index}`} style={styles.tableRow}>
                <View style={styles.colItem}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  {item.description ? (
                    <Text style={styles.itemDescription}>{item.description}</Text>
                  ) : null}
                  {item.notes ? (
                    <Text style={styles.itemNotes}>Note: {item.notes}</Text>
                  ) : null}
                </View>
                <Text style={styles.colQty}>{item.quantityLabel}</Text>
                <Text style={styles.colAmount}>{item.amountLabel}</Text>
              </View>
            ))}
          </View>

          <View style={styles.totalsCard}>
            <View style={styles.totalRow}>
              <Text style={styles.totalRowMuted}>Subtotal</Text>
              <Text>{data.subtotalLabel}</Text>
            </View>
            {data.discountLabel && data.discountAmountLabel ? (
              <View style={styles.totalRow}>
                <Text style={styles.totalRowDiscount}>{data.discountLabel}</Text>
                <Text style={styles.totalRowDiscount}>
                  {data.discountAmountLabel}
                </Text>
              </View>
            ) : null}
            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalLabel}>Grand total</Text>
              <Text style={styles.grandTotalValue}>{data.grandTotalLabel}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalRowPaid}>Paid</Text>
              <Text style={styles.totalRowPaid}>{data.paidAmountLabel}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalRowDue}>Due</Text>
              <Text style={styles.totalRowDue}>{data.balanceAmountLabel}</Text>
            </View>
          </View>
        </View>

        {data.customerNotes ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitleDark}>Notes</Text>
            <AccentPanel>
              <Text style={styles.bodyText}>{data.customerNotes}</Text>
            </AccentPanel>
          </View>
        ) : null}

        {data.payments.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitleDark}>Payment history</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={styles.paymentColDate}>Date</Text>
                <Text style={styles.paymentColAmount}>Amount</Text>
                <Text style={styles.paymentColNotes}>Notes</Text>
              </View>

              {data.payments.map((payment, index) => (
                <View key={`payment-${index}`} style={styles.tableRow}>
                  <Text style={styles.paymentColDate}>{payment.dateLabel}</Text>
                  <Text style={[styles.paymentColAmount, styles.paymentAmount]}>
                    {payment.amountLabel}
                  </Text>
                  <Text style={[styles.paymentColNotes, styles.paymentNotes]}>
                    {payment.notes || "—"}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {data.business.bankDetails ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitleDark}>Payment details</Text>
            <AccentPanel>
              <Text style={styles.bodyText}>{data.business.bankDetails}</Text>
            </AccentPanel>
          </View>
        ) : null}

        {data.terms.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitleDark}>Invoice terms</Text>
            <AccentPanel>
              <View style={styles.termsList}>
                {data.terms.map((term, index) => (
                  <View key={`term-${index}`} style={styles.termRow}>
                    <View style={styles.termBullet} />
                    <Text style={styles.termText}>{term}</Text>
                  </View>
                ))}
              </View>
            </AccentPanel>
          </View>
        ) : null}

        <View fixed style={styles.footer}>
          <Text>{data.business.businessName}</Text>
          <Text>{data.invoiceNumber}</Text>
        </View>
      </Page>
    </Document>
  );
}