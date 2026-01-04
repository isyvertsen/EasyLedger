import { pdf } from "@react-pdf/renderer";
import { InvoicePDF } from "~/components/pdf/invoice-pdf";
import { Invoice, InvoiceLine, Customer, Settings } from "@prisma/client";
import { createElement } from "react";

type InvoiceWithRelations = Invoice & {
  lines: InvoiceLine[];
  customer: Customer;
};

export async function generateInvoicePDFBuffer(
  invoice: InvoiceWithRelations,
  settings: Settings
): Promise<Buffer> {
  // Create the PDF element using createElement instead of JSX
  const pdfDoc = createElement(InvoicePDF, { invoice, settings });
  const asPdf = pdf(pdfDoc);
  const blob = await asPdf.toBlob();
  const buffer = Buffer.from(await blob.arrayBuffer());

  return buffer;
}
