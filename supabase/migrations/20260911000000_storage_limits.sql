-- Begrens opplastinger til media-bucketen: maks 8 MB og kun bildeformater.

update storage.buckets
   set file_size_limit = 8388608,
       allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
 where id = 'media';
