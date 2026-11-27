# hjyi2027.github.io

personal site of hyunjun yi. hand-written html, one stylesheet, one script. no build step, no dependencies, no analytics, no cookies.

## pages

- `index.html`: home. name, a short intro, the venues, one line of honors, and a drawing of the largest isosceles set in nine dimensions
- `research.html`: every paper, one title and one status line each
- `404.html`: not-found page (absolute paths, since it is served from any url)

## files

- `style.css`: tokens, base, frame, homepage, inner pages, research tools, search, motion, print. one light theme: instrument serif headlines, geist text, geist mono labels. copy is in sentence case, paper titles too
- `site.js`: reveals, the search box, the homepage drawing. every part is optional and the pages read the same with it off
- `og.png`: 1200x630 link-preview image
- `sitemap.xml`, `robots.txt`, `.nojekyll`

## when a paper changes status

1. edit its entry in `research.html` (title link, the `.meta` line, position in the list)
2. if a new venue accepts a paper, add it to the `accepted at` line (`.hero-at`) in `index.html`
3. bump `lastmod` in `sitemap.xml`

the search box reads `research.html` directly, so it needs no edits.

## preview

```
python3 -m http.server 4321
```

code: mit. text: all rights reserved.
