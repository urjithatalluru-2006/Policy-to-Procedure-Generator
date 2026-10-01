import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Configure pdfjs worker using standard unpkg CDN matching pdfjs version for clean client-side execution
try {
  if (typeof window !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version || '6.3.289'}/build/pdf.worker.min.mjs`;
  }
} catch (e) {
  console.warn('PDF.js worker initialization warning:', e);
}

/**
 * Extracts plain text and basic structural metadata from an uploaded File object.
 * Supports PDF, DOCX, TXT, and Markdown files.
 * 
 * @param {File} file 
 * @returns {Promise<{ rawText: string, pages: number, sections: Array<{ id: string, number: string, title: string, content: string, isHighlighted?: boolean, citationKey?: string, badgeText?: string, note?: string }> }>}
 */
export async function extractTextFromFile(file) {
  const fileName = file.name.toLowerCase();

  if (fileName.endsWith('.pdf')) {
    return extractFromPdf(file);
  } else if (fileName.endsWith('.docx')) {
    return extractFromDocx(file);
  } else {
    // Default to plain text / markdown / csv / json
    return extractFromPlainText(file);
  }
}

/**
 * Extract text from plain text/markdown file
 */
function extractFromPlainText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const rawText = event.target?.result || '';
      const sections = splitTextIntoSections(rawText, file.name);
      resolve({
        rawText,
        pages: Math.max(1, Math.ceil(rawText.length / 2400)),
        sections
      });
    };
    reader.onerror = (err) => reject(new Error('Failed to read text file: ' + err));
    reader.readAsText(file);
  });
}

/**
 * Extract text from DOCX file using mammoth
 */
async function extractFromDocx(file) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    const rawText = result.value || '';
    const sections = splitTextIntoSections(rawText, file.name);
    return {
      rawText,
      pages: Math.max(1, Math.ceil(rawText.length / 2400)),
      sections
    };
  } catch (error) {
    console.error('Error extracting text from docx:', error);
    throw new Error('Unable to extract text from DOCX file: ' + error.message);
  }
}

/**
 * Extract text from PDF using pdfjs-dist
 */
async function extractFromPdf(file) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({
      data: arrayBuffer,
      useSystemFonts: true,
      isEvalSupported: false
    });

    const pdf = await loadingTask.promise;
    const numPages = pdf.numPages;
    let fullText = '';
    const pageTexts = [];

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageString = textContent.items
        .map((item) => ('str' in item ? item.str : ''))
        .join(' ');
      pageTexts.push(pageString);
      fullText += `\n\n--- Page ${pageNum} ---\n` + pageString;
    }

    const trimmedText = fullText.trim();
    const sections = splitTextIntoSections(trimmedText, file.name);

    return {
      rawText: trimmedText,
      pages: numPages,
      sections
    };
  } catch (error) {
    console.warn('PDF extraction with worker encountered issue, trying fallback reader:', error);
    // If pdfjs fails for any reason (e.g. CORS/worker), attempt fallback array buffer string extraction
    try {
      const text = await fallbackBinaryExtract(file);
      const sections = splitTextIntoSections(text, file.name);
      return {
        rawText: text,
        pages: 1,
        sections
      };
    } catch (fallbackError) {
      throw new Error('Failed to parse PDF document: ' + error.message);
    }
  }
}

/**
 * Fallback binary text extractor if worker is restricted in isolated environment
 */
async function fallbackBinaryExtract(file) {
  const text = await file.text();
  // Filter visible readable ASCII strings
  const cleaned = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, ' ');
  return cleaned.slice(0, 50000);
}

/**
 * Splits raw document text into meaningful numbered sections/clauses
 */
export function splitTextIntoSections(rawText, docName = 'Document') {
  if (!rawText || !rawText.trim()) {
    return [
      {
        id: 'sec-1-0',
        number: '1.0',
        title: 'General Policy Provisions',
        content: 'No readable text was found in the provided document.',
        isHighlighted: false,
        citationKey: 'sec-1-0',
        badgeText: 'Sec 1.0'
      }
    ];
  }

  // Attempt to split by standard section headers like "Section 1", "1.0", "Clause 2", or markdown "##"
  const lines = rawText.split('\n');
  const sections = [];
  let currentSection = null;
  let sectionIndex = 1;

  // Regular expression to identify headings
  const headingRegex = /^(\d+(\.\d+)*\s*[-:.)]|Section\s+\d+|Article\s+\d+|Clause\s+\d+|#{1,3}\s+)/i;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    if (headingRegex.test(line) && line.length < 120) {
      if (currentSection && currentSection.content.trim()) {
        sections.push(currentSection);
      }

      const cleanTitle = line.replace(/^[#\s]+/, '').replace(/^(\d+(\.\d+)*\s*[-:.)]|Section\s+\d+|Article\s+\d+|Clause\s+\d+)\s*/i, '').trim() || `Section ${sectionIndex}`;
      const secNum = `${sectionIndex}.0`;

      currentSection = {
        id: `sec-${sectionIndex}-0`,
        number: secNum,
        title: cleanTitle.length > 60 ? cleanTitle.substring(0, 57) + '...' : cleanTitle,
        content: '',
        isHighlighted: false,
        citationKey: `sec-${sectionIndex}-0`,
        badgeText: `Sec ${secNum}`,
        highlightLabel: `Clause ${secNum}: ${cleanTitle}`
      };
      sectionIndex++;
    } else {
      if (!currentSection) {
        currentSection = {
          id: `sec-${sectionIndex}-0`,
          number: `${sectionIndex}.0`,
          title: 'Initial Overview & Purpose',
          content: '',
          isHighlighted: false,
          citationKey: `sec-${sectionIndex}-0`,
          badgeText: `Sec ${sectionIndex}.0`,
          highlightLabel: `Clause ${sectionIndex}.0: Initial Overview`
        };
        sectionIndex++;
      }
      currentSection.content += (currentSection.content ? '\n' : '') + line;
    }
  }

  if (currentSection && currentSection.content.trim()) {
    sections.push(currentSection);
  }

  // If text didn't match heading regex, chunk by double newlines or paragraphs
  if (sections.length <= 1 && rawText.length > 500) {
    const paragraphs = rawText.split(/\n\s*\n/).filter(p => p.trim().length > 40);
    if (paragraphs.length > 1) {
      return paragraphs.slice(0, 15).map((para, idx) => {
        const num = `${idx + 1}.0`;
        const firstSentence = para.trim().split(/[.\n]/)[0].substring(0, 60) || `Policy Clause ${num}`;
        return {
          id: `sec-${idx + 1}-0`,
          number: num,
          title: firstSentence,
          content: para.trim(),
          isHighlighted: false,
          citationKey: `sec-${idx + 1}-0`,
          badgeText: `Sec ${num}`,
          highlightLabel: `Clause ${num}: ${firstSentence}`
        };
      });
    }
  }

  return sections.length > 0 ? sections : [
    {
      id: 'sec-1-0',
      number: '1.0',
      title: docName.replace(/\.[^/.]+$/, '').replace(/_/g, ' '),
      content: rawText.substring(0, 3000),
      isHighlighted: false,
      citationKey: 'sec-1-0',
      badgeText: 'Sec 1.0',
      highlightLabel: 'General Policy Text'
    }
  ];
}
