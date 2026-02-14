-- Migration Script to convert varchar columns to native Postgres Enums
-- Run this in your Supabase SQL Editor

-- 1. Create Enum Types (Safe creation)
DO $$ BEGIN
    CREATE TYPE vote_type AS ENUM ('up', 'down');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE entry_status AS ENUM ('pending', 'verified', 'disputed', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE suggestion_status AS ENUM ('pending', 'accepted', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Alter Tables to use new Types
-- Using USING clause to cast existing text values to the new Enum types

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
