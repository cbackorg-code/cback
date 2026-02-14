-- Recovery Migration Script
-- Run this in your Supabase SQL Editor

-- 1. Drop types if they exist (CASCADE will remove the columns using them, so be careful? NO! CASCADE drops dependent columns!)
-- WAIT! CASCADE on a type drops the COLUMNS that use it. We do NOT want that if the columns already using it partially?
-- But the columns are currently varchar (text). They are NOT using the enum yet. 
-- The user said "failed to run... while running query". So the ALTER likely failed.
-- So the columns are likely still TEXT.
-- So dropping the type is safe IF the columns are still TEXT.

DROP TYPE IF EXISTS entry_status CASCADE;
DROP TYPE IF EXISTS suggestion_status CASCADE;
DROP TYPE IF EXISTS vote_type CASCADE;

-- 2. Create Types Explicitly (No DO block, to see errors)
CREATE TYPE entry_status AS ENUM ('pending', 'verified', 'disputed', 'rejected');
CREATE TYPE suggestion_status AS ENUM ('pending', 'accepted', 'rejected');
CREATE TYPE vote_type AS ENUM ('up', 'down');

-- 3. Alter Tables
-- CashbackEntry
ALTER TABLE cashback_entries 
  ALTER COLUMN status TYPE entry_status 
  USING status::entry_status;

-- RateSuggestion
ALTER TABLE rate_suggestions 
  ALTER COLUMN status TYPE suggestion_status 
  USING status::suggestion_status;

-- EntryVote
ALTER TABLE entry_votes 
  ALTER COLUMN vote_type TYPE vote_type 
  USING vote_type::vote_type;

-- RateSuggestionVote
ALTER TABLE rate_suggestion_votes 
  ALTER COLUMN vote_type TYPE vote_type 
  USING vote_type::vote_type;
