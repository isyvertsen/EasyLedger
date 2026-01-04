import OpenAI from "openai";

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

export interface ExtractedInvoiceData {
  supplierName: string | null;
  description: string;
  amount: number;
  vatAmount: number | null;
  date: string; // ISO date string
  invoiceNumber: string | null;
  confidence: "high" | "medium" | "low";
}

export async function extractInvoiceData(
  imageBase64: string,
  mimeType: string
): Promise<ExtractedInvoiceData> {
  if (!openai) {
    throw new Error(
      "OpenAI API key is not configured. Please add OPENAI_API_KEY to .env.local"
    );
  }

  const prompt = `Analyser dette fakturabildetet og ekstrahér følgende informasjon på norsk:

1. Leverandørnavn (firma som sender fakturaen)
2. Fakturanummer
3. Fakturadato (i ISO format YYYY-MM-DD)
4. Totalt beløp (inkludert MVA)
5. MVA-beløp (hvis oppgitt)
6. Beskrivelse av varer/tjenester

Svar BARE med valid JSON i dette formatet (ingen annen tekst):
{
  "supplierName": "Leverandør AS",
  "invoiceNumber": "FAK-123",
  "date": "2024-01-15",
  "amount": 1250.00,
  "vatAmount": 250.00,
  "description": "Beskrivelse av varer/tjenester",
  "confidence": "high|medium|low"
}

Hvis du ikke finner en verdi, bruk null. Sett confidence basert på hvor sikker du er på dataene.`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: prompt,
          },
          {
            type: "image_url",
            image_url: {
              url: `data:${mimeType};base64,${imageBase64}`,
            },
          },
        ],
      },
    ],
    max_tokens: 500,
    temperature: 0.1, // Low temperature for more consistent extraction
  });

  const content = response.choices[0].message.content;
  if (!content) {
    throw new Error("No response from OpenAI");
  }

  // Parse JSON response (strip markdown code blocks if present)
  try {
    let jsonContent = content.trim();

    // Remove markdown code blocks if present
    if (jsonContent.startsWith("```")) {
      jsonContent = jsonContent.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    const data = JSON.parse(jsonContent) as ExtractedInvoiceData;
    return data;
  } catch (error) {
    console.error("Failed to parse OpenAI response:", content);
    throw new Error("Failed to parse invoice data from OpenAI response");
  }
}

export async function extractInvoiceDataFromText(
  text: string
): Promise<ExtractedInvoiceData> {
  if (!openai) {
    throw new Error(
      "OpenAI API key is not configured. Please add OPENAI_API_KEY to .env.local"
    );
  }

  const prompt = `Analyser denne fakturateksten og ekstrahér følgende informasjon på norsk:

1. Leverandørnavn (firma som sender fakturaen)
2. Fakturanummer
3. Fakturadato (i ISO format YYYY-MM-DD)
4. Totalt beløp (inkludert MVA)
5. MVA-beløp (hvis oppgitt)
6. Beskrivelse av varer/tjenester

Svar BARE med valid JSON i dette formatet (ingen annen tekst):
{
  "supplierName": "Leverandør AS",
  "invoiceNumber": "FAK-123",
  "date": "2024-01-15",
  "amount": 1250.00,
  "vatAmount": 250.00,
  "description": "Beskrivelse av varer/tjenester",
  "confidence": "high|medium|low"
}

Hvis du ikke finner en verdi, bruk null. Sett confidence basert på hvor sikker du er på dataene.

Fakturatekst:
${text}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    max_tokens: 500,
    temperature: 0.1,
  });

  const content = response.choices[0].message.content;
  if (!content) {
    throw new Error("No response from OpenAI");
  }

  // Parse JSON response (strip markdown code blocks if present)
  try {
    let jsonContent = content.trim();

    // Remove markdown code blocks if present
    if (jsonContent.startsWith("```")) {
      jsonContent = jsonContent.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    const data = JSON.parse(jsonContent) as ExtractedInvoiceData;
    return data;
  } catch (error) {
    console.error("Failed to parse OpenAI response:", content);
    throw new Error("Failed to parse invoice data from OpenAI response");
  }
}
