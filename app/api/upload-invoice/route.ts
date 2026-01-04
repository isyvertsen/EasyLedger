import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { extractInvoiceData, extractInvoiceDataFromText } from "~/lib/openai";
import { extractTextFromPDF } from "~/lib/pdf-extractor";

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get form data
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error:
            "Invalid file type. Please upload a JPG, PNG, WebP, or PDF file.",
        },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size exceeds 10MB limit" },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let extractedData;

    if (file.type === "application/pdf") {
      // For PDF: Extract text and use regular GPT-4o (cheaper!)
      const text = await extractTextFromPDF(buffer);
      extractedData = await extractInvoiceDataFromText(text);
    } else {
      // For images: Use Vision API
      const base64 = buffer.toString("base64");
      extractedData = await extractInvoiceData(base64, file.type);
    }

    return NextResponse.json({
      success: true,
      data: extractedData,
    });
  } catch (error: any) {
    console.error("Error processing invoice upload:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process invoice" },
      { status: 500 }
    );
  }
}
