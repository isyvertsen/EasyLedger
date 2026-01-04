import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendInvoiceEmail({
  to,
  customerName,
  invoiceNumber,
  amount,
  dueDate,
  pdfBuffer,
  fromEmail,
  companyName,
}: {
  to: string;
  customerName: string;
  invoiceNumber: string;
  amount: number;
  dueDate: Date;
  pdfBuffer: Buffer;
  fromEmail: string;
  companyName: string;
}) {
  return resend.emails.send({
    from: `${companyName} <${fromEmail}>`,
    to,
    subject: `Faktura ${invoiceNumber} fra ${companyName}`,
    html: `
      <h1>Faktura ${invoiceNumber}</h1>
      <p>Hei ${customerName},</p>
      <p>Vedlagt finner du faktura ${invoiceNumber} på kr ${amount.toLocaleString("nb-NO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}.</p>
      <p>Forfallsdato: ${dueDate.toLocaleDateString("nb-NO", { year: "numeric", month: "long", day: "numeric" })}</p>
      <p>Vennlig hilsen,<br>${companyName}</p>
    `,
    attachments: [
      {
        filename: `faktura-${invoiceNumber}.pdf`,
        content: pdfBuffer,
      },
    ],
  });
}
