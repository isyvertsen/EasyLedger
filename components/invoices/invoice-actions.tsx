"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Download, Mail, DollarSign, CheckCircle } from "lucide-react";
import {
  generateInvoicePDF,
  sendInvoice,
  updateInvoiceStatus,
} from "~/lib/actions/invoices";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { RegisterPaymentDialog } from "./register-payment-dialog";

interface InvoiceActionsProps {
  invoiceId: string;
  status: string;
  customerEmail?: string | null;
}

export function InvoiceActions({
  invoiceId,
  status,
  customerEmail,
}: InvoiceActionsProps) {
  const router = useRouter();
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      const pdfBuffer = await generateInvoicePDF(invoiceId);
      // Convert Buffer to Uint8Array for Blob
      const uint8Array = new Uint8Array(pdfBuffer);
      const blob = new Blob([uint8Array], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `faktura-${invoiceId}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("PDF lastet ned");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Kunne ikke laste ned PDF"
      );
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSendEmail = async () => {
    if (!customerEmail) {
      toast.error("Kunde mangler e-postadresse");
      return;
    }

    setIsSending(true);
    try {
      await sendInvoice(invoiceId);
      toast.success("Faktura sendt på e-post");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Kunne ikke sende e-post"
      );
    } finally {
      setIsSending(false);
    }
  };

  const handleActivate = async () => {
    setIsActivating(true);
    try {
      await updateInvoiceStatus(invoiceId, "SENT");
      toast.success("Faktura aktivert");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Kunne ikke aktivere faktura"
      );
    } finally {
      setIsActivating(false);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {/* Download PDF - tilgjengelig for alle statuser unntatt DRAFT */}
      {status !== "DRAFT" && (
        <Button
          variant="outline"
          onClick={handleDownloadPDF}
          disabled={isDownloading}
        >
          <Download className="h-4 w-4 mr-2" />
          {isDownloading ? "Laster ned..." : "Last ned PDF"}
        </Button>
      )}

      {/* Aktivér faktura - kun for DRAFT */}
      {status === "DRAFT" && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button disabled={isActivating}>
              <CheckCircle className="h-4 w-4 mr-2" />
              {isActivating ? "Aktiverer..." : "Aktiver faktura"}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Aktiver faktura?</AlertDialogTitle>
              <AlertDialogDescription>
                Når du aktiverer fakturaen endres statusen til "Sendt". Du kan
                deretter laste ned PDF og sende den på e-post. Fakturaen kan
                ikke lenger redigeres etter aktivering.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Avbryt</AlertDialogCancel>
              <AlertDialogAction onClick={handleActivate}>
                Aktiver
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Send på e-post - kun for DRAFT og SENT */}
      {(status === "DRAFT" || status === "SENT") && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              disabled={!customerEmail || isSending}
            >
              <Mail className="h-4 w-4 mr-2" />
              {isSending ? "Sender..." : "Send på e-post"}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Send faktura på e-post?</AlertDialogTitle>
              <AlertDialogDescription>
                Fakturaen vil sendes til {customerEmail}.
                {status === "DRAFT" &&
                  " Fakturaen vil automatisk aktiveres og settes til status 'Sendt'."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Avbryt</AlertDialogCancel>
              <AlertDialogAction onClick={handleSendEmail}>
                Send
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Registrer betaling - kun for SENT og OVERDUE */}
      {(status === "SENT" || status === "OVERDUE") && (
        <>
          <Button
            variant="outline"
            onClick={() => setPaymentDialogOpen(true)}
          >
            <DollarSign className="h-4 w-4 mr-2" />
            Registrer betaling
          </Button>
          <RegisterPaymentDialog
            invoiceId={invoiceId}
            open={paymentDialogOpen}
            onOpenChange={setPaymentDialogOpen}
          />
        </>
      )}
    </div>
  );
}
