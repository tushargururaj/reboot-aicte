// AI Service using Google Vertex AI (uses service account)
import { VertexAI } from '@google-cloud/vertexai';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();
// Set the environment variable for Google Cloud authentication
// This is the most reliable way to ensure the SDK uses the service account key


// Read project ID from credentials
let projectId = 'desmystify';
let authOptions = {};

try {
  const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
  projectId = credentials.project_id || 'desmystify';
  authOptions = { credentials };
  console.log('Using Vertex AI with project:', projectId);
} catch (error) {
  console.error('Error reading credentials:', error.message);
}

// Initialize Vertex AI
const vertex_ai = new VertexAI({
  project: projectId,
  location: 'us-central1',
  googleAuthOptions: authOptions
});

/**
 * Certificate type configurations with table mappings
 */
const CERTIFICATE_TYPES = {
  FDP: {
    name: 'FDP/Training Program',
    table: 'fdp',
    sectionCode: '6.1.2.2.1',
    description: 'Faculty Development Program, STTP, Workshop, or Training Program',
    fields: [
      { name: 'participant_name', label: 'Name on Certificate' },
      { name: 'program_name', label: 'Program/Event Name' },
      { name: 'organizer', label: 'Organizing Institute' },
      { name: 'date', label: 'Date/Start Date', type: 'date' },
      { name: 'duration_days', label: 'Duration (Days)', type: 'number' },
      { name: 'mode', label: 'Mode (Online/Offline)', options: ['Online', 'Offline'] },
      { name: 'event_type', label: 'Event Type' },
      { name: 'location', label: 'Location' },
      { name: 'certificate_number', label: 'Certificate Number' },
      { name: 'brief_reflection', label: 'Brief Description/Reflection' },
      { name: 'academic_year', label: 'Academic Year' }
    ]
  },
  RESOURCE_PERSON: {
    name: 'Resource Person / Invited Talk',
    table: 'resource_person',
    sectionCode: '6.1.2.1.1',
    description: 'Certificate for being a Speaker, Resource Person, Guest Lecturer',
    fields: [
      { name: 'participant_name', label: 'Name on Certificate' },
      { name: 'event_name', label: 'Event Name' },
      { name: 'role', label: 'Role (Speaker/Resource Person)' },
      { name: 'organizer', label: 'Organizing Institute' },
      { name: 'date', label: 'Date', type: 'date' },
      { name: 'duration_days', label: 'Duration (Days)', type: 'number' },
      { name: 'mode', label: 'Mode (Online/Offline)', options: ['Online', 'Offline'] },
      { name: 'event_type', label: 'Event Type' },
      { name: 'location', label: 'Location' },
      { name: 'brief_description', label: 'Brief Description' },
      { name: 'academic_year', label: 'Academic Year' }
    ]
  },
  MEMBERSHIP: {
    name: 'Professional Membership',
    table: 'prof_memberships',
    sectionCode: '6.1.1.1',
    description: 'Membership certificate for professional bodies (IEEE, ACM, ISTE)',
    fields: [
      { name: 'participant_name', label: 'Name on Card/Certificate' },
      { name: 'society_name', label: 'Society Name' },
      { name: 'grade_level', label: 'Grade/Level (e.g., Senior Member, Life Member)' },
      { name: 'brief_description', label: 'Brief Description' },
      { name: 'academic_year', label: 'Academic Year' }
    ]
  },
  MOOC: {
    name: 'MOOC / Online Course',
    table: 'mooc_course',
    sectionCode: '6.1.4.1',
    description: 'Online course completion (NPTEL, Coursera, Udemy)',
    fields: [
      { name: 'participant_name', label: 'Name on Certificate' },
      { name: 'course_name', label: 'Course Name' },
      { name: 'offering_institute', label: 'Offering Institute' },
      { name: 'duration_weeks', label: 'Duration (Weeks)', type: 'number' },
      { name: 'grade_obtained', label: 'Grade/Score' },
      { name: 'remarks', label: 'Remarks' },
      { name: 'academic_year', label: 'Academic Year' }
    ]
  }
};

/**
 * STEP 1: Build the classification prompt
 */
function buildClassificationPrompt(ocrText) {
  return `You are an expert academic document classifier. Analyze the following text extracted from a certificate or document and IDENTIFY the document type.

Text Content:
"""
${ocrText.substring(0, 3000)}
"""

Classification Categories:
1. FDP: Faculty Development Programs, Short Term Training Programs (STTP), Workshops, or Refresher Courses.
2. RESOURCE_PERSON: Certificates where the person was a Speaker, Guest Lecturer, Resource Person, or gave an Invited Talk.
3. MEMBERSHIP: Membership cards or certificates for professional societies (IEEE, ACM, ISTE, CSI).
4. MOOC: Online course completion certificates (NPTEL, Coursera, Udemy, EdX).

Instructions:
- Look for keywords like "participated in", "successfully completed" (FDP/MOOC) vs "delivered a talk", "served as resource person" (RESOURCE_PERSON).
- If the document is a membership card, select MEMBERSHIP.
- Return a JSON object with the detected type and confidence.

Output JSON:
{
  "detected_type": "FDP" | "RESOURCE_PERSON" | "MEMBERSHIP" | "MOOC" | "UNKNOWN",
  "confidence": 0.0 to 1.0,
  "reason": "Brief explanation of why this type was chosen based on keywords found in the text."
}`;
}

/**
 * STEP 2: Build the targeted extraction prompt
 */
function buildExtractionPrompt(ocrText, type) {
  const config = CERTIFICATE_TYPES[type];
  if (!config) return null;

  const fieldsJson = JSON.stringify(config.fields.map(f => f.name));

  return `You are an expert data entry specialist. Extract the following information from the provided academic certificate text.

Target Document Type: "${config.name}"
Fields to Extract: ${fieldsJson}

Document Text:
"""
${ocrText}
"""

Extraction Rules:
1. **participant_name**: Look for the name of the person receiving the certificate. Often follows "This is to certify that", "Presented to", or is printed in a large font.
2. **academic_year**: Inferred from the date. If date is between July 2023 and June 2024, it is "2023-24". Format MUST be YYYY-YY.
3. **date**: Extract the main event date in YYYY-MM-DD format. If a range is given, use the start date.
4. **duration_days**: Calculate the number of days if start and end dates are present. If only duration in weeks is given, convert to days (weeks * 7).
5. **organizer**: The name of the institution or organization conducting the event.
6. **mode**: Infer if the event was "Online" or "Offline" based on context (e.g., location, platform names like Zoom).
7. Return null for any field that is completely missing. Do not guess.

Output Format:
Return a valid JSON object matching this structure:
{
  "extracted_fields": {
    "participant_name": "Name Found",
    "program_name": "...",
    // map all other fields here
  },
  "field_confidence": {
    "participant_name": 0.9,
    // confidence for each field
  },
  "missing_required": ["list", "any", "missing", "critical", "fields"]
}`;
}

/**
 * Parse and process the AI response
 */
// function processAIResponse removed as it is no longer used


/**
 * Helper to wait for a specified time
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Analyze certificate using Vertex AI Gemini
 * Uses service account authentication (no API key needed)
 */

/**
 * Call Vertex AI Model with specific prompt
 */
async function callVertexAI(prompt) {
  const models = [

    'gemini-2.5-pro'
  ];

  let lastError = null;

  for (const modelName of models) {
    try {
      // console.log(`Calling Vertex AI (${modelName})...`); 

      const generativeModel = vertex_ai.preview.getGenerativeModel({
        model: modelName,
        generationConfig: {
          maxOutputTokens: 2048,
          temperature: 0.1,
          responseMimeType: 'application/json'
        }
      });

      const result = await generativeModel.generateContent(prompt);
      const response = await result.response;
      return response.candidates[0].content.parts[0].text;

    } catch (error) {
      lastError = error;
      if (error.message && error.message.includes('429')) {
        await delay(2000);
        continue;
      }
      // If 404 (model not found), try next model
      continue;
    }
  }
  throw lastError || new Error('All AI models failed');
}

/**
 * Clean and parse JSON response
 */
function parseAIJson(text) {
  try {
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch (e) {
    console.error('JSON Parse Error:', e);
    return null;
  }
}

/**
 * Analyze certificate using Two-Pass approach
 */
export async function analyzeCertificateWithAI(ocrText) {
  try {
    // PASS 1: Classification
    console.log('Step 2a: Classifying document type...');
    const classPrompt = buildClassificationPrompt(ocrText);
    const classRaw = await callVertexAI(classPrompt);
    const classResult = parseAIJson(classRaw);

    if (!classResult || !classResult.detected_type || classResult.detected_type === 'UNKNOWN') {
      return {
        success: true,
        detectedType: 'UNKNOWN',
        typeConfidence: 0,
        isRecognized: false,
        reason: 'Could not identify document type',
        extractedFields: {},
        missingRequired: []
      };
    }

    const detectedType = classResult.detected_type;
    console.log(`Step 2b: Detected type ${detectedType} (Confidence: ${classResult.confidence}). Extracting fields...`);

    // PASS 2: Extraction
    const extractPrompt = buildExtractionPrompt(ocrText, detectedType);
    if (!extractPrompt) {
      // Should not happen if type is valid
      return { success: false, error: 'Invalid config for detected type' };
    }

    const extractRaw = await callVertexAI(extractPrompt);
    const extractResult = parseAIJson(extractRaw);

    if (!extractResult) {
      throw new Error('Failed to parse extraction results');
    }

    // Combine results
    const typeConfig = CERTIFICATE_TYPES[detectedType];

    // Normalize extracted fields based on config
    const finalExtracted = {};
    typeConfig.fields.forEach(field => {
      finalExtracted[field.name] = extractResult.extracted_fields?.[field.name] || null;
    });

    return {
      success: true,

      // Type Info
      detectedType: detectedType,
      typeConfidence: classResult.confidence,
      reason: classResult.reason,

      // Config Info
      tableName: typeConfig.table,
      tableDisplayName: typeConfig.name,
      sectionCode: typeConfig.sectionCode,
      isRecognized: true,

      // Data Info
      extractedFields: finalExtracted,
      fieldConfidence: extractResult.field_confidence || {},
      overallConfidence: classResult.confidence, // Simplified
      missingRequired: extractResult.missing_required || []
    };

  } catch (error) {
    console.error('AI Analysis Error:', error);
    // Return a graceful failure object so the UI can still show the OCR text
    return {
      success: false,
      error: error.message,
      detectedType: 'UNKNOWN'
    };
  }
}

/**
 * Get certificate type configuration
 */
export function getCertificateTypeConfig(typeName) {
  return CERTIFICATE_TYPES[typeName] || null;
}

/**
 * Get all supported certificate types
 */
export function getSupportedTypes() {
  return Object.entries(CERTIFICATE_TYPES).map(([key, config]) => ({
    type: key,
    name: config.name,
    table: config.table,
    sectionCode: config.sectionCode,
    description: config.description
  }));
}
