-- AI Upload Feature: Add metadata columns to fdp_attended table
-- PostgreSQL Version
-- Run this SQL script to add the necessary columns for AI-extracted certificates

ALTER TABLE fdp_attended
ADD COLUMN IF NOT EXISTS ai_extracted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS extraction_confidence DECIMAL(3,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS certificate_file_path VARCHAR(500) DEFAULT '',
ADD COLUMN IF NOT EXISTS raw_ocr_text TEXT;

-- Add comments for documentation
COMMENT ON COLUMN fdp_attended.ai_extracted IS 'Flag indicating if this entry was created via AI upload';
COMMENT ON COLUMN fdp_attended.extraction_confidence IS 'Overall confidence score from AI extraction (0.00-1.00)';
COMMENT ON COLUMN fdp_attended.certificate_file_path IS 'Path to uploaded certificate file';
COMMENT ON COLUMN fdp_attended.raw_ocr_text IS 'Original OCR extracted text for debugging';

-- Verify the columns were added
\d fdp_attended;
