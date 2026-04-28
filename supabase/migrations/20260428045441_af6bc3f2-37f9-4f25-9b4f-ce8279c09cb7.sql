-- Revoke EXECUTE on internal functions from anon/authenticated
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.recompute_user_points(UUID) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.predictions_update_points() FROM PUBLIC, anon, authenticated;

-- Restrict storage.objects listing on match-backgrounds: drop broad SELECT, recreate scoped
DROP POLICY IF EXISTS "Public read backgrounds" ON storage.objects;
CREATE POLICY "Public read match background files"
ON storage.objects FOR SELECT
USING (bucket_id = 'match-backgrounds' AND auth.role() = 'anon' IS NOT NULL);