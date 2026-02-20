-- ============================================================
-- Supabase Storage: media 버킷 설정
-- Supabase SQL Editor에서 실행
-- ============================================================

-- 1. public 버킷 생성
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media',
  'media',
  true,
  10485760, -- 10MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- 2. Storage RLS 정책

-- 누구나 public 파일 조회 가능
create policy "media_public_read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'media');

-- 로그인 사용자만 업로드 가능
create policy "media_auth_insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'media');

-- admin만 삭제 가능
create policy "media_admin_delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'media'
    and exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- admin만 업데이트 가능
create policy "media_admin_update"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'media'
    and exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );
