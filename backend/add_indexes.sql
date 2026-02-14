-- Add performance indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_cashback_entries_card_id ON cashback_entries(card_id);
CREATE INDEX IF NOT EXISTS idx_cashback_entries_merchant_id ON cashback_entries(merchant_id);
CREATE INDEX IF NOT EXISTS idx_cashback_entries_status ON cashback_entries(status);
CREATE INDEX IF NOT EXISTS idx_cashback_entries_created_at ON cashback_entries(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_merchant_aliases_text ON merchant_aliases(alias_text);
CREATE INDEX IF NOT EXISTS idx_merchant_aliases_merchant_id ON merchant_aliases(merchant_id);

CREATE INDEX IF NOT EXISTS idx_merchants_canonical_name ON merchants(canonical_name);

CREATE INDEX IF NOT EXISTS idx_entry_comments_entry_id ON entry_comments(entry_id);
CREATE INDEX IF NOT EXISTS idx_entry_comments_created_at ON entry_comments(created_at DESC);

-- Add text search index for faster merchant searches
CREATE INDEX IF NOT EXISTS idx_merchants_canonical_name_trgm ON merchants USING gin(canonical_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_cashback_entries_statement_name_trgm ON cashback_entries USING gin(statement_name gin_trgm_ops);
