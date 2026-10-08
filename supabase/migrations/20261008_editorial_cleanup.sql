-- Narrow corrections for confirmed editorial defects. Preserve material claims.
update public.blog_posts
set title = 'Gypsum Board Partitions Guide',
    seo_title = case when regexp_replace(coalesce(seo_title, ''), '[​‌‍﻿]', '', 'g') = 'gypsum-board-partitions-guide' then 'Gypsum Board Partitions Guide' else seo_title end,
    category = regexp_replace(category, '[​‌‍﻿]', '', 'g'),
    excerpt = regexp_replace(regexp_replace(excerpt, '[​‌‍﻿]', '', 'g'), '"$', ''),
    updated_at = now()
where slug = 'gypsum-board-partitions-guide'
  and regexp_replace(title, '[​‌‍﻿]', '', 'g') = 'gypsum-board-partitions-guide';
update public.projects set location = replace(location, 'Hiranandani Estae', 'Hiranandani Estate'), updated_at = now()
where location like '%Hiranandani Estae%';
