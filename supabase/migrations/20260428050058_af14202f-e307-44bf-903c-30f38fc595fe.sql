DROP POLICY IF EXISTS "Public read match background files" ON storage.objects;
CREATE POLICY "Public read match background files"
ON storage.objects FOR SELECT
USING (bucket_id = 'match-backgrounds');