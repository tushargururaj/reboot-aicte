-- AI Upload Feature: Add ai_extracted column to all relevant tables
-- PostgreSQL Version
-- Run this SQL script to add the column for tracking AI-extracted entries

-- FDP table
ALTER TABLE fdp
ADD COLUMN IF NOT EXISTS ai_extracted BOOLEAN DEFAULT FALSE;

-- Resource Person table
ALTER TABLE resource_person
ADD COLUMN IF NOT EXISTS ai_extracted BOOLEAN DEFAULT FALSE;

-- Professional Memberships table
ALTER TABLE prof_memberships
ADD COLUMN IF NOT EXISTS ai_extracted BOOLEAN DEFAULT FALSE;

-- MOOC Course table
ALTER TABLE mooc_course
ADD COLUMN IF NOT EXISTS ai_extracted BOOLEAN DEFAULT FALSE;

-- Add comments for documentation
COMMENT ON COLUMN fdp.ai_extracted IS 'Flag indicating if this entry was created via AI upload';
COMMENT ON COLUMN resource_person.ai_extracted IS 'Flag indicating if this entry was created via AI upload';
COMMENT ON COLUMN prof_memberships.ai_extracted IS 'Flag indicating if this entry was created via AI upload';
COMMENT ON COLUMN mooc_course.ai_extracted IS 'Flag indicating if this entry was created via AI upload';
