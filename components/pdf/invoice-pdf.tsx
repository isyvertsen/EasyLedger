import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import { Invoice, InvoiceLine, Customer, Settings } from "@prisma/client";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 40,
  },
  companyInfo: {
    flex: 1,
  },
  invoiceInfo: {
    flex: 1,
    alignItems: "flex-end",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 5,
  },
  text: {
    fontSize: 10,
    marginBottom: 3,
  },
  customerSection: {
    marginBottom: 30,
  },
  table: {
    marginTop: 20,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
    padding: 8,
    fontWeight: "bold",
  },
  tableRow: {
    flexDirection: "row",
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  colDescription: {
    flex: 3,
  },
  colQty: {
    flex: 1,
    textAlign: "right",
  },
  colPrice: {
    flex: 1,
    textAlign: "right",
  },
  colVat: {
    flex: 1,
    textAlign: "right",
  },
  colTotal: {
    flex: 1,
    textAlign: "right",
  },
  totals: {
    marginTop: 20,
    alignItems: "flex-end",
  },
  totalRow: {
    flexDirection: "row",
    width: 250,
    justifyContent: "space-between",
    marginBottom: 5,
  },
  totalRowBold: {
    flexDirection: "row",
    width: 250,
    justifyContent: "space-between",
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 2,
    borderTopColor: "#000",
    fontWeight: "bold",
  },
  footer: {
    marginTop: 40,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
});

type InvoiceWithRelations = Invoice & {
  lines: InvoiceLine[];
  customer: Customer;
};

export function InvoicePDF({
  invoice,
  settings,
}: {
  invoice: InvoiceWithRelations;
  settings: Settings;
}) {
  const subtotal = invoice.lines.reduce(
    (sum, line) => sum + line.quantity * line.unitPrice,
    0
  );

  const vatTotal = invoice.lines.reduce(
    (sum, line) =>
      sum + line.quantity * line.unitPrice * (line.vatRate / 100),
    0
  );

  const total = subtotal + vatTotal;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.companyInfo}>
            <Text style={styles.title}>{settings.companyName || "Firma"}</Text>
            {settings.address && <Text style={styles.text}>{settings.address}</Text>}
            {settings.postalCode && settings.city && (
              <Text style={styles.text}>
                {settings.postalCode} {settings.city}
              </Text>
            )}
            {settings.orgNumber && (
              <Text style={styles.text}>Org.nr: {settings.orgNumber}</Text>
            )}
          </View>
          <View style={styles.invoiceInfo}>
            <Text style={styles.title}>FAKTURA</Text>
            <Text style={styles.text}>Fakturanr: {invoice.invoiceNumber}</Text>
            <Text style={styles.text}>
              Dato: {new Date(invoice.issueDate).toLocaleDateString("nb-NO")}
            </Text>
            <Text style={styles.text}>
              Forfall: {new Date(invoice.dueDate).toLocaleDateString("nb-NO")}
            </Text>
          </View>
        </View>

        <View style={styles.customerSection}>
          <Text style={styles.subtitle}>Faktureres til:</Text>
          <Text style={styles.text}>{invoice.customer.name}</Text>
          {invoice.customer.address && (
            <Text style={styles.text}>{invoice.customer.address}</Text>
          )}
          {invoice.customer.postalCode && invoice.customer.city && (
            <Text style={styles.text}>
              {invoice.customer.postalCode} {invoice.customer.city}
            </Text>
          )}
          {invoice.customer.orgNumber && (
            <Text style={styles.text}>Org.nr: {invoice.customer.orgNumber}</Text>
          )}
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.colDescription}>Beskrivelse</Text>
            <Text style={styles.colQty}>Antall</Text>
            <Text style={styles.colPrice}>Pris</Text>
            <Text style={styles.colVat}>MVA</Text>
            <Text style={styles.colTotal}>Sum</Text>
          </View>
          {invoice.lines.map((line, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.colDescription}>{line.description}</Text>
              <Text style={styles.colQty}>{line.quantity}</Text>
              <Text style={styles.colPrice}>{line.unitPrice.toFixed(2)}</Text>
              <Text style={styles.colVat}>{line.vatRate}%</Text>
              <Text style={styles.colTotal}>
                {(line.quantity * line.unitPrice).toFixed(2)}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text>Sum ekskl. MVA:</Text>
            <Text>{subtotal.toFixed(2)} kr</Text>
          </View>
          <View style={styles.totalRow}>
            <Text>MVA:</Text>
            <Text>{vatTotal.toFixed(2)} kr</Text>
          </View>
          <View style={styles.totalRowBold}>
            <Text>Totalt:</Text>
            <Text>{total.toFixed(2)} kr</Text>
          </View>
        </View>

        {invoice.notes && (
          <View style={{ marginTop: 20 }}>
            <Text style={styles.subtitle}>Merknad:</Text>
            <Text style={styles.text}>{invoice.notes}</Text>
          </View>
        )}

        <View style={styles.footer}>
          <Text style={styles.subtitle}>Betalingsinformasjon:</Text>
          {settings.bankAccount && (
            <Text style={styles.text}>
              Kontonummer: {settings.bankAccount}
            </Text>
          )}
          <Text style={styles.text}>
            Merk betaling med fakturanummer {invoice.invoiceNumber}
          </Text>
          <Text style={styles.text}>
            Forfall: {new Date(invoice.dueDate).toLocaleDateString("nb-NO")}
          </Text>
        </View>
      </Page>
    </Document>
  );
}
