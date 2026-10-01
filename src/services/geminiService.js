import { GoogleGenAI } from '@google/genai';

/**
 * Initializes and invokes the Google Gemini API to transform an uploaded
 * policy document into an actionable, cited Standard Operating Procedure (SOP) or Checklist.
 */
export async function generateSOPWithGemini({
  policyText,
  targetAudience = 'Technical Support',
  procedureFormat = 'Step-by-Step',
  fileName = 'Policy_Document.pdf',
  extractedSections = []
}) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
    throw new Error('Missing VITE_GEMINI_API_KEY. Please verify your .env file contains a valid Gemini API key.');
  }

  const ai = new GoogleGenAI({ apiKey });

  // Truncate policy text if overly huge to stay well within token bounds while retaining high fidelity
  const cleanPolicyText = policyText ? policyText.substring(0, 45000) : 'No policy text provided.';

  // Structured prompt for Gemini
  const prompt = `
You are an expert Enterprise Compliance Officer and Senior Technical Writer.
Your task is to convert the following actual uploaded enterprise policy document into a highly structured, operational Standard Operating Procedure (SOP) or Checklist.

INPUT DOCUMENT DETAILS:
- File Name: "${fileName}"
- Target Audience: "${targetAudience}"
- Procedure Format: "${procedureFormat}"

POLICY CONTENT:
"""
${cleanPolicyText}
"""

CRITICAL REQUIREMENTS:
1. Strict Grounding & Inline Citations: Every single step MUST be directly derived from the policy text above. Never invent facts not present in or implied by the policy. Include an inline citation badge for every step (e.g. "[Sec 1.0]", "[Sec 2.1]", "[Clause 3]").
2. Target Audience Alignment: Write instructions and tone specifically tailored for "${targetAudience}".
3. Procedure Format: Format the procedure as a "${procedureFormat}" (e.g., if "Checklist", emphasize concise verifiable check items; if "Step-by-Step", include detailed substeps, roles, warnings, and pro-tips).
4. Extract Real Document Sections: Segment the policy text into 3 to 8 logical sections/clauses (using the actual text/excerpts from the uploaded document). Mark sections as "isHighlighted: true" if a procedural step cites them, and provide a "citationKey" (e.g. "sec-1-0", "sec-2-1") that matches the step's "citation".

OUTPUT FORMAT:
You MUST respond with a single, valid JSON object (no markdown surrounding ticks, or inside \`\`\`json) with this exact schema:

{
  "policyAnalysis": {
    "title": "Title of the Policy Document",
    "version": "v1.0",
    "pages": 1,
    "compliance": "Relevant standard or compliance framework (e.g., ISO 27001, Internal Policy, etc.)",
    "documentHeader": {
      "org": "Organization name found in document or Enterprise Operations",
      "docRef": "SOP-REF-CODE",
      "classification": "Confidential // Internal",
      "effectiveDate": "Month Year or Today"
    },
    "sections": [
      {
        "id": "sec-1-0",
        "number": "1.0",
        "title": "Section Title",
        "content": "Actual verbatim or faithful excerpt text from the policy document for this section...",
        "isHighlighted": true,
        "citationKey": "sec-1-0",
        "badgeText": "Sec 1.0",
        "highlightLabel": "Clause 1.0: Section Title",
        "note": "Grounding rationale for why this clause forms the basis of the procedure"
      }
    ]
  },
  "procedure": {
    "meta": {
      "docId": "SOP-GENERATED-01",
      "title": "Clear Action-Oriented SOP Title (e.g., SOP: Incident Escalation & Response)",
      "version": "1.0-GENERATED",
      "effectiveDate": "Current Date",
      "targetAudience": "${targetAudience}",
      "estimatedDuration": "e.g., 15 - 30 minutes",
      "riskLevel": "Low | Medium | High"
    },
    "objective": "Clear, concise 1-2 sentence purpose and scope of this operating procedure based on the policy.",
    "prerequisites": [
      "Prerequisite 1 required by policy",
      "Prerequisite 2 required by policy"
    ],
    "steps": [
      {
        "id": 1,
        "stepNumber": "01",
        "title": "Clear action verb step title",
        "role": "Assigned Role (e.g. Employee, Team Lead, SysAdmin, Officer)",
        "description": "Clear explanation of what must be done.",
        "substeps": [
          "Actionable micro-step A",
          "Actionable micro-step B"
        ],
        "citation": "sec-1-0",
        "citationBadge": "[Sec 1.0]",
        "warning": "Optional compliance hazard or warning if applicable",
        "tip": "Optional operational best practice or pro-tip"
      }
    ],
    "governanceNotes": [
      "Governance note or audit log retention rule derived from policy",
      "Mandatory review period or compliance sign-off detail"
    ]
  }
}
`;

  // Resilient model fallback list: try fast active models to prevent 503 high-demand or 404 deprecation errors
  const modelsToTry = [
    'gemini-3.5-flash',
    'gemini-3.8-flash',
    'gemini-3-flash-preview',
    'gemini-2.5-flash',
    'gemini-flash-latest'
  ];

  let rawResponseText = '';
  let lastError = null;

  for (const modelName of modelsToTry) {
    // Up to 2 attempts per model with slight delay for 503/429
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        console.log(`[Gemini RAG] Generating SOP with model: ${modelName} (attempt ${attempt + 1})`);
        const response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.2
          }
        });

        if (response && response.text) {
          rawResponseText = response.text;
          break; // Successfully received response
        }
      } catch (err) {
        lastError = err;
        const msg = err?.message || String(err);
        console.warn(`[Gemini RAG] Model ${modelName} attempt ${attempt + 1} error:`, msg);

        // If it's a 503 (high demand) or 429 (rate limit), wait 800ms before retry or next model
        if (msg.includes('503') || msg.includes('429') || msg.includes('UNAVAILABLE')) {
          await new Promise(r => setTimeout(r, 800));
        } else {
          // If 404 or invalid model, break immediately to try next candidate
          break;
        }
      }
    }

    if (rawResponseText) break;
  }

  if (!rawResponseText) {
    let cleanMessage = lastError?.message || 'Failed to receive a response from Gemini API.';
    try {
      // If error message is a JSON string, extract the human readable message
      const parsedErr = JSON.parse(cleanMessage);
      if (parsedErr?.error?.message) {
        cleanMessage = parsedErr.error.message;
      }
    } catch {
      // already a string
    }

    throw new Error(cleanMessage);
  }

  // Parse JSON response safely
  try {
    const cleanedJsonStr = rawResponseText
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/, '')
      .trim();

    const parsedData = JSON.parse(cleanedJsonStr);

    // Validate and fill in any missing structures
    return sanitizeGeminiOutput(parsedData, fileName, targetAudience, cleanPolicyText, extractedSections);
  } catch (parseError) {
    console.error('Failed to parse Gemini JSON output:', parseError, rawResponseText);
    throw new Error('Received malformed response from Gemini. Please retry generating the procedure.');
  }
}

/**
 * Ensures returned Gemini data conforms strictly to the UI component schema
 */
function sanitizeGeminiOutput(data, fileName, targetAudience, rawPolicyText, extractedSections) {
  const policyAnalysis = data.policyAnalysis || {};
  const procedure = data.procedure || {};

  // Build sanitized sections
  let sections = policyAnalysis.sections || [];
  if (!Array.isArray(sections) || sections.length === 0) {
    sections = extractedSections.length > 0 ? extractedSections : [
      {
        id: 'sec-1-0',
        number: '1.0',
        title: 'Core Policy Directives',
        content: rawPolicyText.substring(0, 2000),
        isHighlighted: true,
        citationKey: 'sec-1-0',
        badgeText: 'Sec 1.0',
        highlightLabel: 'Clause 1.0: Core Policy Directives',
        note: 'Extracted directly from uploaded document.'
      }
    ];
  }

  // Ensure every section has citationKey and badgeText
  sections = sections.map((sec, idx) => {
    const citationKey = sec.citationKey || sec.id || `sec-${idx + 1}-0`;
    const num = sec.number || `${idx + 1}.0`;
    return {
      ...sec,
      id: sec.id || citationKey,
      number: num,
      citationKey,
      badgeText: sec.badgeText || `Sec ${num}`,
      highlightLabel: sec.highlightLabel || `Clause ${num}: ${sec.title || 'Directive'}`,
      isHighlighted: Boolean(sec.isHighlighted)
    };
  });

  // Ensure procedure steps have valid citations
  const sanitizedSteps = (procedure.steps || []).map((step, idx) => {
    const stepNum = step.stepNumber || String(idx + 1).padStart(2, '0');
    // Match citation to a real section if possible
    let citation = step.citation;
    if (!citation || !sections.some(s => s.citationKey === citation)) {
      citation = sections[idx % sections.length]?.citationKey || 'sec-1-0';
    }

    // Mark matching section as highlighted
    const matchingSec = sections.find(s => s.citationKey === citation);
    if (matchingSec) {
      matchingSec.isHighlighted = true;
    }

    return {
      id: step.id || idx + 1,
      stepNumber: stepNum,
      title: step.title || `Execute Step ${stepNum}`,
      role: step.role || targetAudience || 'Operations Team',
      description: step.description || 'Follow standard operating guidelines as outlined in the policy.',
      substeps: Array.isArray(step.substeps) ? step.substeps : [],
      citation: citation,
      citationBadge: step.citationBadge || `[${matchingSec?.badgeText || 'Sec 1.0'}]`,
      warning: step.warning || null,
      tip: step.tip || null
    };
  });

  return {
    policy: {
      id: 'custom-' + Date.now(),
      title: policyAnalysis.title || fileName.replace(/\.[^/.]+$/, '').replace(/_/g, ' '),
      fileName: fileName,
      fileSize: 'Uploaded File',
      pages: policyAnalysis.pages || 1,
      version: policyAnalysis.version || 'v1.0',
      compliance: policyAnalysis.compliance || 'Grounded Policy Standard',
      audience: targetAudience,
      sourceContent: {
        documentHeader: {
          org: policyAnalysis.documentHeader?.org || 'Enterprise Policy Operations',
          docRef: policyAnalysis.documentHeader?.docRef || 'POL-GEN-' + Math.floor(1000 + Math.random() * 9000),
          classification: policyAnalysis.documentHeader?.classification || 'Confidential // Internal',
          effectiveDate: policyAnalysis.documentHeader?.effectiveDate || new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        },
        sections: sections,
        rawText: rawPolicyText
      }
    },
    procedure: {
      meta: {
        docId: procedure.meta?.docId || 'SOP-' + Math.floor(1000 + Math.random() * 9000),
        title: procedure.meta?.title || `SOP: ${fileName.replace(/\.[^/.]+$/, '').replace(/_/g, ' ')}`,
        version: procedure.meta?.version || '1.0-GENERATED',
        effectiveDate: procedure.meta?.effectiveDate || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        targetAudience: procedure.meta?.targetAudience || targetAudience,
        estimatedDuration: procedure.meta?.estimatedDuration || '15 - 30 minutes',
        riskLevel: procedure.meta?.riskLevel || 'Medium'
      },
      objective: procedure.objective || 'Actionable operational procedures synthesized from policy directives.',
      prerequisites: Array.isArray(procedure.prerequisites) && procedure.prerequisites.length > 0
        ? procedure.prerequisites
        : ['Familiarity with standard operating procedures', 'Verified access permissions to relevant enterprise tools'],
      steps: sanitizedSteps,
      governanceNotes: Array.isArray(procedure.governanceNotes) && procedure.governanceNotes.length > 0
        ? procedure.governanceNotes
        : ['All procedures must be logged according to standard audit retention policies.', 'Annual review required by departmental compliance team.']
    }
  };
}
