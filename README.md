# hjyi2027.github.io

personal site of hyunjun yi. hand-written html, one stylesheet, one script. no build step, no dependencies, no analytics, no cookies.

## pages

- `index.html`: home. hero, about, three small instruments, selected research, yimo, contact
- `research.html`: every paper with its status and links. the source of truth for the counts
- `cv.html`: curriculum vitae, with a print stylesheet
- `404.html`: not-found page (absolute paths, since it is served from any url)

## files

- `style.css`: tokens, base, frame, homepage, inner pages, research tools, search, motion, print. one light theme: instrument serif headlines, geist text, geist mono labels. copy is in sentence case, paper titles too
- `site.js`: reveals, the search box, the research filter and rail, the homepage instruments. every part is optional and the pages read the same with it off
- `og.png`: 1200x630 link-preview image
- `sitemap.xml`, `robots.txt`, `.nojekyll`

## when a paper changes status

1. edit its entry in `research.html` (title link, the `.meta` line, position in the list)
2. update the counts strip at the top of `research.html`, the two description metas, and the `updated` stamp. the ten highlight cards under the counts repeat a status line each; keep them in step with their entries
3. update the counts strip, the `all 46 papers` button, the about paragraph and the `latest` timeline in `index.html` (one `.tl-day` per date, one row per result, newest first), and the counts strip, the research paragraphs (printed only), the figure strips above them (`.cv-figs`), the selected papers (`.cv-pubs`, each with a page-one thumbnail in `thumbs/`, rendered from its public PDF) and results list (`.cv-res`), the workshop venue bar (`.vb`), and the repository cards (`.cv-code`) and methods list (`.cv-meth`) under skills in `cv.html` if the paper or the totals they quote moved
4. bump `lastmod` in `sitemap.xml`

the homepage hero names the venues with acceptances (`.hero-at`); add a venue there when a new one accepts.

the search box and the filter chips read `research.html` directly, so they need no edits.

## preview

```
python3 -m http.server 4321
```

code: mit. text: all rights reserved.
