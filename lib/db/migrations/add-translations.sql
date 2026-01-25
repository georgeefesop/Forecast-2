-- Add translations column to events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS translations JSONB;

-- Example structure of translations column:
-- {
--   "en": {
--     "title": "English Title",
--     "description": "English Description"
--   },
--   "el": {
--     "title": "Greek Title",
--     "description": "Greek Description"
--   },
--   "ru": {
--     "title": "Russian Title",
--     "description": "Russian Description"
--   }
-- }
