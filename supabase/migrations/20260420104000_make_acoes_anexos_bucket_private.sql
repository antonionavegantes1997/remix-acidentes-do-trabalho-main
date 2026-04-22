-- Security hardening for attachments:
-- make bucket private and remove public-read access

UPDATE storage.buckets
SET public = false
WHERE id = 'acoes-anexos';

DROP POLICY IF EXISTS "Anyone can view acoes files" ON storage.objects;
DROP POLICY IF EXISTS "Auth users can view acoes files" ON storage.objects;

CREATE POLICY "Auth users can view acoes files"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'acoes-anexos');
