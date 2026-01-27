-- Update venues table with new fields

ALTER TABLE venues 
ADD COLUMN IF NOT EXISTS area TEXT,
ADD COLUMN IF NOT EXISTS website_url TEXT,
ADD COLUMN IF NOT EXISTS instagram_url TEXT,
ADD COLUMN IF NOT EXISTS short_description TEXT,
ADD COLUMN IF NOT EXISTS about TEXT,
ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';

-- Migration to move data from old columns if they exist
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='venues' AND column_name='website') THEN
        UPDATE venues SET website_url = website WHERE website_url IS NULL;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='venues' AND column_name='instagram') THEN
        UPDATE venues SET instagram_url = instagram WHERE instagram_url IS NULL;
    END IF;
END $$;
