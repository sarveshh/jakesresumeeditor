/**
 * API Route: Parse PDF to Text and Structure
 * Extracts structured data from uploaded PDF files
 */

import { NextRequest, NextResponse } from "next/server";
// @ts-expect-error - pdf-parse-fork doesn't have types
import pdf from "pdf-parse-fork";

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

    console.log("=== PDF PARSING START ===");
    console.log("File size:", buffer.length, "bytes");

    // Parse PDF with pdf-parse-fork
    const data = await pdf(buffer);

    console.log("Text extracted, length:", data.text.length);
    console.log("Number of pages:", data.numpages);
    console.log("First 500 chars:", data.text.substring(0, 500));
    console.log("=== PDF PARSING END ===");

    return NextResponse.json({
      text: data.text,
      pages: data.numpages,
      info: data.info,
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
