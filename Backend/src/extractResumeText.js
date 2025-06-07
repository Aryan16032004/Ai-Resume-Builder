import pdf from 'pdf-parse/lib/pdf-parse.js';
import mammoth from 'mammoth';
import fs from 'fs/promises';
import path from 'path';

export async function extractTextFromPDF(filePath) {
    try {
        const absolutePath = path.resolve(filePath);
        await fs.access(absolutePath); // Verify file exists
        const dataBuffer = await fs.readFile(absolutePath);
        const data = await pdf(dataBuffer);
        return data.text;
    } catch (error) {
        console.error('PDF extraction failed:', error);
        throw new Error(`Failed to process PDF: ${error.message}`);
    }
}

export async function extractTextFromDocx(filePath) {
    try {
        const absolutePath = path.resolve(filePath);
        await fs.access(absolutePath); // Verify file exists
        const result = await mammoth.extractRawText({ path: absolutePath });
        return result.value;
    } catch (error) {
        console.error('DOCX extraction failed:', error);
        throw new Error(`Failed to process DOCX: ${error.message}`);
    }
}