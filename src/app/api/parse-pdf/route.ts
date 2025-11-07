/**
 * API Route: Parse PDF to Text and Structure
 * Extracts structured data from uploaded PDF files
 */

import { NextRequest, NextResponse } from "next/server";
import PDFParser from "pdf2json";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const pdfFile = formData.get("pdf") as File;

    if (!pdfFile) {
      return NextResponse.json(
        { message: "PDF file is required" },
        { status: 400 }
      );
    }

    // Read PDF file
    const arrayBuffer = await pdfFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Create parser instance
    const pdfParser = new PDFParser();

    // Parse PDF and extract both text and structure
    const result = await new Promise<{ text: string; data: unknown }>(
      (resolve, reject) => {
        pdfParser.on(
          "pdfParser_dataError",
          (errData: Error | { parserError: Error }) => {
            const error =
              errData instanceof Error ? errData : errData.parserError;
            reject(error);
          }
        );

        pdfParser.on("pdfParser_dataReady", (pdfData) => {
          // Extract plain text
          const text = pdfParser.getRawTextContent();

          // Also get structured data for better parsing
          resolve({ text, data: pdfData });
        });

        // Parse the buffer
        pdfParser.parseBuffer(buffer);
      }
    );

    return NextResponse.json({
      text: result.text,
      data: result.data, // Include structured PDF data for better parsing
      pages: 1,
    });
  } catch (error) {
    console.error("PDF parsing error:", error);
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Parsing failed",
      },
      { status: 500 }
    );
  }
}
