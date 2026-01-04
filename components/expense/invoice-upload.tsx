"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Upload, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { createExpenseFromInvoice } from "~/lib/actions/invoice-upload";
import { Category } from "@prisma/client";
import { useRouter } from "next/navigation";

interface InvoiceUploadProps {
  categories: Category[];
}

interface ExtractedData {
  supplierName: string | null;
  description: string;
  amount: number;
  vatAmount: number | null;
  date: string;
  invoiceNumber: string | null;
  confidence: "high" | "medium" | "low";
}

export function InvoiceUpload({ categories }: InvoiceUploadProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const expenseCategories = categories.filter((c) => c.type === "EXPENSE");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setExtractedData(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Vennligst velg en fil");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload-invoice", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Kunne ikke laste opp faktura");
      }

      setExtractedData(result.data);
      toast.success("Faktura analysert!");
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Kunne ikke laste opp faktura");
    } finally {
      setUploading(false);
    }
  };

  const handleCreateExpense = async () => {
    if (!extractedData) return;

    setUploading(true);
    try {
      await createExpenseFromInvoice(
        extractedData,
        selectedCategory || undefined
      );

      toast.success("Utgift opprettet!");
      setOpen(false);
      setFile(null);
      setExtractedData(null);
      setSelectedCategory("");
      router.refresh();
    } catch (error: any) {
      console.error("Create expense error:", error);
      toast.error(error.message || "Kunne ikke opprette utgift");
    } finally {
      setUploading(false);
    }
  };

  const confidenceColor = {
    high: "text-green-600",
    medium: "text-yellow-600",
    low: "text-red-600",
  };

  const confidenceLabel = {
    high: "Høy",
    medium: "Medium",
    low: "Lav",
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Upload className="h-4 w-4 mr-2" />
          Last opp faktura
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Last opp faktura</DialogTitle>
          <DialogDescription>
            Last opp et bilde eller PDF av fakturaen. AI vil automatisk
            ekstrahere informasjon.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="file">Velg fil</Label>
            <Input
              id="file"
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
              onChange={handleFileChange}
              disabled={uploading}
            />
            <p className="text-xs text-muted-foreground">
              Støttede formater: JPG, PNG, WebP, PDF (maks 10MB)
            </p>
          </div>

          {file && !extractedData && (
            <Button onClick={handleUpload} disabled={uploading}>
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyserer...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Analyser faktura
                </>
              )}
            </Button>
          )}

          {extractedData && (
            <div className="space-y-4 border rounded-lg p-4 bg-muted/50">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Ekstraerte data
                </h3>
                <span
                  className={`text-xs font-medium ${
                    confidenceColor[extractedData.confidence]
                  }`}
                >
                  Sikkerhet: {confidenceLabel[extractedData.confidence]}
                </span>
              </div>

              <div className="grid gap-3 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div className="font-medium">Leverandør:</div>
                  <div>{extractedData.supplierName || "Ikke funnet"}</div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="font-medium">Fakturanummer:</div>
                  <div>{extractedData.invoiceNumber || "Ikke funnet"}</div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="font-medium">Dato:</div>
                  <div>
                    {new Date(extractedData.date).toLocaleDateString("nb-NO")}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="font-medium">Beløp:</div>
                  <div>
                    {extractedData.amount.toLocaleString("nb-NO", {
                      style: "currency",
                      currency: "NOK",
                    })}
                  </div>
                </div>

                {extractedData.vatAmount && (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="font-medium">MVA:</div>
                    <div>
                      {extractedData.vatAmount.toLocaleString("nb-NO", {
                        style: "currency",
                        currency: "NOK",
                      })}
                    </div>
                  </div>
                )}

                <div className="grid gap-2">
                  <div className="font-medium">Beskrivelse:</div>
                  <div className="text-muted-foreground">
                    {extractedData.description}
                  </div>
                </div>
              </div>

              {extractedData.confidence === "low" && (
                <div className="flex items-start gap-2 text-xs text-yellow-600 bg-yellow-50 p-2 rounded">
                  <AlertCircle className="h-4 w-4 mt-0.5" />
                  <span>
                    Lav sikkerhet på dataene. Vennligst dobbelsjekk
                    informasjonen før du oppretter utgiften.
                  </span>
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="category">Kategori (valgfritt)</Label>
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Velg kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {expenseCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setOpen(false);
              setFile(null);
              setExtractedData(null);
              setSelectedCategory("");
            }}
          >
            Avbryt
          </Button>
          {extractedData && (
            <Button onClick={handleCreateExpense} disabled={uploading}>
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Oppretter...
                </>
              ) : (
                "Opprett utgift"
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
