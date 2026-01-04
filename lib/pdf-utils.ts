import { renderToBuffer } from "@react-pdf/renderer";
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
  const pdfDoc = createElement(InvoicePDF, { invoice, settings }) as any;
  const buffer = await renderToBuffer(pdfDoc);

  return buffer;
}
