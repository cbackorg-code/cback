-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create Merchant Table
CREATE TABLE IF NOT EXISTS merchant (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    statement_name TEXT,
    cashback_rate TEXT,
    contributor TEXT,
    date TEXT,
    comments TEXT,
    last_tried_date TEXT,
    source_sheet TEXT DEFAULT 'sheet1'
);

-- Create Index on Merchant Name
CREATE INDEX IF NOT EXISTS ix_merchant_name ON merchant (name);

-- Create User Table (Public Profile)
CREATE TABLE IF NOT EXISTS "user" (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT DEFAULT 'user'
);

-- Create Index on User Email
CREATE INDEX IF NOT EXISTS ix_user_email ON "user" (email);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public."user" (id, email, role)
  VALUES (new.id, new.email, 'user');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function on new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Policy for Public Read Access to Merchants
ALTER TABLE merchant ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to merchants"
ON merchant FOR SELECT
USING (true);

-- Policy for Authenticated Insert Access to Merchants
CREATE POLICY "Allow authenticated insert access to merchants"
ON merchant FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy for Admin Update/Delete (Optional, can be refined)
CREATE POLICY "Allow admin full access to merchants"
ON merchant FOR ALL
USING (auth.uid() IN (SELECT id FROM "user" WHERE role = 'admin'));

-- Policy for Users to read their own profile
ALTER TABLE "user" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to read own profile"
ON "user" FOR SELECT
USING (auth.uid() = id);

-- Insert a sample merchant
INSERT INTO merchant (name, statement_name, cashback_rate, source_sheet)
VALUES ('Sample Merchant', 'SAMPLE*STMT', '5%', 'setup_script');
