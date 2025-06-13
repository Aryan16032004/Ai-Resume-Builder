import pdf from 'pdf-parse/lib/pdf-parse.js';
import mammoth from 'mammoth';


export async function extractTextFromPDF(buffer) {
    try {
        // const absolutePath = path.resolve(filePath);
        // await fs.access(absolutePath); // Verify file exists
        // const dataBuffer = await fs.readFile(absolutePath);
        const data = await pdf(buffer);
        return data.text;
    } catch (error) {
        console.error('PDF extraction failed:', error);
        throw new Error(`Failed to process PDF: ${error.message}`);
    }
}

export async function extractTextFromDocx(buffer) {
    try {
        // const absolutePath = path.resolve(filePath);
        // await fs.access(absolutePath); // Verify file exists
        const result = await mammoth.extractRawText({ buffer });
        return result.value;
    } catch (error) {
        console.error('DOCX extraction failed:', error);
        throw new Error(`Failed to process DOCX: ${error.message}`);
    }
}