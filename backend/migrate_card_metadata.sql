-- Add image_url column to cards table
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='cards' AND column_name='image_url') THEN
        ALTER TABLE cards ADD COLUMN image_url TEXT;
    END IF;
END $$;

-- Update existing cards with metadata from mockData.ts
UPDATE cards SET 
    description = '5% cashback on online spends',
    image_url = 'https://cd9941cc.delivery.rocketcdn.me/wp-content/uploads/2022/09/Cashback-SBI-Credit-Card.webp'
WHERE slug = 'sbi-cashback' AND (description IS NULL OR image_url IS NULL);

UPDATE cards SET 
    description = 'SBI Card SELECT BLACK',
    image_url = 'https://cd9941cc.delivery.rocketcdn.me/wp-content/uploads/2025/07/PhonePe-SBI-SELECT-BLACK-Credit-Card-1.webp'
WHERE slug = 'phonepe-black' AND (description IS NULL OR image_url IS NULL);

UPDATE cards SET 
    description = '10% cashback on Swiggy',
    image_url = 'https://cd9941cc.delivery.rocketcdn.me/wp-content/uploads/2024/06/Swiggy-HDFC-Bank-Credit-Card.webp'
WHERE slug = 'swiggy-hdfc' AND (description IS NULL OR image_url IS NULL);

UPDATE cards SET 
    description = '5% cashback on Amazon',
    image_url = 'https://cd9941cc.delivery.rocketcdn.me/wp-content/uploads/2021/06/ICICI-Amazon-Pay-Credit-Card.webp'
WHERE slug = 'amazon-pay-icici' AND (description IS NULL OR image_url IS NULL);
