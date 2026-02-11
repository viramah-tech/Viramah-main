-- ============================================================
-- Migration 006: Storage Buckets & Policies
-- Run this in Supabase SQL Editor AFTER all previous migrations
-- ============================================================

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES ('id-documents', 'id-documents', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-photos', 'profile-photos', false)
ON CONFLICT (id) DO NOTHING;

-- ==================== ID DOCUMENTS POLICIES ====================

-- Allow authenticated users to upload to their own folder
CREATE POLICY "id_docs_insert_own" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'id-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow users to view their own documents
CREATE POLICY "id_docs_select_own" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'id-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow users to update their own documents
CREATE POLICY "id_docs_update_own" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'id-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow users to delete their own documents
CREATE POLICY "id_docs_delete_own" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'id-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ==================== PROFILE PHOTOS POLICIES ====================

-- Allow authenticated users to upload to their own folder
CREATE POLICY "photos_insert_own" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'profile-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow anyone authenticated to view profile photos (public within app)
CREATE POLICY "photos_select_all" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'profile-photos');

-- Allow users to update their own photos
CREATE POLICY "photos_update_own" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'profile-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow users to delete their own photos
CREATE POLICY "photos_delete_own" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'profile-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
