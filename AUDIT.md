# AUDIT.md

Site: https://hjyi2027.github.io/ (repo `hjyi2027/hjyi2027.github.io`, 6 commits, last `603c67c`)
Audit date: 2026-09-20
Scope: every tracked file, the three live pages, the `/jun-yi-math-research/` sub-site, and every external URL the site links or the brief proposes.

Method. I read all eight tracked files, fetched each live page and the sub-site, resolved every external URL with curl, listed the public repos on both GitHub accounts, downloaded the seven AIscend paper PDFs and the LambdaMath book PDF and read their title pages, pulled the live YIMO JS bundles to read the numbers the SPA renders, and read the `sampler-confound` README on GitHub. Nothing below rests on the site's own claims about itself.

Governing finding first. The site's biggest problem is not any single stale line. It is that the site asserts and never links. Almost every number on it turns out to be real and already public in a PDF or README that the site does not point to. The fix is mostly plumbing, not deletion. The exceptions are listed under P0.

---

## P0. Actively damaging credibility now

| # | Item | Verdict | Finding |
|---|------|---------|---------|
| P0-1 | `index.html` tag "in review" and `research.html` / `cv.html` "under review at math-ai 2026" on the sampler paper | CHANGE | False. The public README at github.com/hjyi2027/sampler-confound says, verbatim, "That deadline passed on 2026-09-06 and the sweep was never run." A reviewer who clicks through reads that the paper was never submitted. Reword to what is true: design and infrastructure public, full sweep not yet run. This is the most dangerous line on the site because it is a checkable false status claim about the flagship item. |
| P0-2 | Homepage title line "head of ai research, aiscend" and the linked aiscend-research.github.io | CHANGE or ASK | The lab's own team page lists you as "Jun Yi", based in Seoul, "interested in mathematics, particularly the optimization and linear algebra that power modern AI systems." No title. A skeptical reader clicks your one affiliation link and finds a bio that does not say what your site says. Either the lab team page gets the title, or the site softens to a phrasing the lab page supports. I cannot fix this from this repo. |
| P0-3 | `cv.html` "next contest august 29–30, 2026" | CHANGE | Three weeks stale. The live YIMO site still shows the same dates, so a reader who clicks sees the olympiad's own site is stale too. Replace with the past-tense fact and a link to the YIMO results/archive page. |
| P0-4 | Sub-site `/jun-yi-math-research/` | CHANGE (see recommendation section) | Confirmed contradictions: "I am a junior", school email `hyunjun.yi27@stu.siskorea.org`, "seeking for any research opportunities", "currently seeking research mentorship". Last push 2026-05-17. `research.html` links to it as the Basel "writeup". |
| P0-5 | `cv.html` "300k social media impressions" | DELETE | Not on the live YIMO site, not in any repo, not in any PDF. Only source is your pitch deck. Under the editorial rule this cannot stay. |
| P0-6 | Homepage `github` pill → `github.com/AIscend-Research` | CHANGE | A reader looking for your code lands on an org with 31 repos, most by other people. Your own account `github.com/hjyi2027` holds `sampler-confound`, `Restored-Lines`, `erasure`, `unchosen-word`, `compulsory-hope`, `litefno-repro`. Point the pill there. |
| P0-7 | Every quantitative claim on the homepage and research page has no link | CHANGE | Confirmed and now resolvable. Every number checks out against a public artifact I opened: 70% / 13% is in `restored-lines.pdf` and the Restored-Lines README; +0.70 / -0.73 / +0.08 and 1.43 log-odds are in `erasure.pdf` and the erasure README; "$2,500+" is on the live YIMO site ("Over $2,500 in total prize money has been given out"). The work is to link each claim to its artifact, not to remove it. See the artifact table below. |

Artifacts verified for P0-7 (all returned HTTP 200 on 2026-09-20):

| Work | PDF | Code | Authorship on the PDF title page |
|------|-----|------|-------------------------------|
| Restored Lines | aiscend-research.github.io/papers/restored-lines.pdf (6 pp.) | github.com/hjyi2027/Restored-Lines | Hyunjun Yi, sole author |
| Erasure | aiscend-research.github.io/papers/erasure.pdf (7 pp.) | github.com/hjyi2027/erasure | Hyunjun Yi, sole author |
| The Unchosen Word | aiscend-research.github.io/papers/the-unchosen-word.pdf (7 pp.) | github.com/hjyi2027/unchosen-word | Hyunjun Yi, Wenhao Lu |
| Compulsory Hope | aiscend-research.github.io/papers/compulsory-hope.pdf (6 pp.) | github.com/hjyi2027/compulsory-hope | Hyunjun Yi, sole author. Not on the site today. |
| Unauthored by Design | aiscend-research.github.io/papers/unauthored-by-design.pdf (6 pp.) | github.com/AIscend-Research/seed-study-creative | Wenhao Lu, Adithya Balakumar, Hyunjun Yi. Not on the site today. |
| [Re] LiteFNO reproducibility study | aiscend-research.github.io/papers/re-litefno-cnn-ablation.pdf (13 pp., "ReScience C, under review") | github.com/hjyi2027/litefno-repro | Goldstein, Zhou, Lu, Zhang, Deshpande, Hyunjun Yi (sixth of six). DOI 10.5281/zenodo.20793535 resolves (to zenodo.org/records/21856548). |
| SpecScope / litefno-extension | none | github.com/AIscend-Research/litefno-extension | No PDF. README only. |
| The Sampler Is a Confound | none | github.com/hjyi2027/sampler-confound | README states sweep not run. |
| Basel problem writeup | github.com/hjyi2027/jun-yi-math-research/blob/main/projects/basel-sum.md | same | |
| Zeta experiments | github.com/hjyi2027/jun-yi-math-research/blob/main/projects/zeta-experiment.py and zeta-experiment-output.txt | same | Your finding 9 confirmed: the current link goes to your profile, not the file. |
| Taylor series writeup | github.com/hjyi2027/jun-yi-math-research/blob/main/projects/taylor-series-and-convergence.md | same | Not on the main site today. |

One item from your "missing content" list fails the rule outright:

| # | Item | Verdict | Finding |
|---|------|---------|---------|
| P0-8 | LambdaMath Method's Book, "co-authored with Pranav Ramesh, ten chapters" | DO NOT ADD YET | I downloaded `lambdamath.dev/MASTER_COMBINED.pdf` (279 pages, Version 1, 23 Dec 2025). Title page: "Pranav Ramesh" alone. Copyright page: "the original work of Pranav Ramesh". Every chapter footer: "©2025 Pranav Ramesh." Your name appears nowhere in 279 pages; I searched. The site's About page is archived and says author background was removed. You told me the credit is coming. Until it is live, listing this with an authorship claim is exactly the kind of assertion the brief forbids. Blocked on the updated PDF or a credits page going live. |

---

## P1. Wastes the reader's attention or leaves value on the table

| # | Item | Verdict | Finding |
|---|------|---------|---------|
| P1-1 | Three homepage "selected work" titles all link to bare `research.html` | CHANGE | Confirmed. No `id` attributes exist on `research.html`. Add per-item ids and anchor links. |
| P1-2 | No research item title is a link | CHANGE | Confirmed. Each title should link to its PDF where one exists, else its repo. |
| P1-3 | Both `code` links on `research.html` → org landing page | CHANGE | Confirmed. Per-project repos exist (table above). |
| P1-4 | `cv.html` is a link dead end | CHANGE | Confirmed. Only mailto and ORCID. Add YIMO, AIscend, GitHub, LinkedIn, and a link back to research. |
| P1-5 | `research.html` gives no year on six of eight items | CHANGE | Confirmed. Repo push dates give a floor: Restored-Lines 2026-08-09, erasure 2026-08-10, unchosen-word 2026-08-10, compulsory-hope 2026-08-10, litefno-repro 2026-08-11, litefno-extension 2026-08-25, sampler-confound 2026-09-17. I will use "2026" unless you give me month-level dates from the PDFs. |
| P1-6 | `partitions and q-series` stub | DELETE | Confirmed. One generic sentence, no link, "in progress". Fold into a single line under the number theory heading with no claim, or drop. Your September 2026 papers (P1-15) decide this. |
| P1-7 | Bare CV leadership titles: `executive director, align gsoc`, `deputy executive director, stemise` | CHANGE, blocked on you | Confirmed. The live YIMO site independently states you are "Deputy Executive Director at STEMise", so that title is backed. ALIGN GSOC appears nowhere public that I could find. Each needs one sentence from you. AIscend's footer says the lab is "Run by NXT Horizon and STEMise", which is the only public description of STEMise I found. |
| P1-8 | `founder and president, applied research club` | CHANGE, blocked on you | One sentence needed, or delete. |
| P1-9 | YIMO title | CHANGE | The site says "director, yimo". The live YIMO site lists you as one of five "Competition Directors" (Wenhao Lu, Hyunjun Yi, Daniel Edouard, Kristen Zhou, Abhiram Jetty), with the address `jun.yi@yimo-official.org`. "competition director" matches the source. "director" alone reads as sole director and a reader who checks will notice. |
| P1-10 | YIMO numbers | CHANGE | Live site, 2026-09-20: prize money "Over $2,500 ... given out across both divisions". Registrations by division and window, YIMO II: 404, 363, 921, 946 (sum 2,634); YIMO I: 50, 52, 100, 100 (sum 302). Combined 2,936 registrants. Countries per window range 20 to 104, footnoted "self-disclosed, so undercounted". So "3,000 competitors" is approximately right if it means registrants across both contests and both windows, and should say so or say "2,900+ registrations". Sponsors on the live site: HRT (Platinum), PiMath (Silver), AoPS (Bronze). Partners: USAMOguide, Saintly, Solvefire, Euler Circle. Footer contact is `info@nxthorizon.org`. "Two nonprofits" and "staff across 17 countries" are not stated anywhere on the YIMO site. I will use the HRT and AoPS sponsorship because it is on the page; the nonprofit and 17-country claims need a public source or they stay off. |
| P1-11 | Olympiad stats duplicated on homepage and CV with different wording | CHANGE | Confirmed. Homepage keeps one sentence with a link. CV carries the full entry. |
| P1-12 | No PDF on a page titled "cv" | ASK | No build step means no generator. Options: (a) rename the nav item to "about" and drop the expectation, (b) you export a PDF and commit `cv.pdf`, (c) I add `@media print` styles so the page prints cleanly and the "download" link is "print this page". I recommend (c) plus (b) if you have one. |
| P1-13 | No Open Graph / Twitter Card | CHANGE | Confirmed. `photo.jpg` (440x440) works as a square `og:image` for LinkedIn and iMessage. A 1200x630 card would render better on X and Slack; I can hand-make one as a second image if you want it. |
| P1-14 | `<meta description>` identical on two pages, missing on `cv.html` | CHANGE | Confirmed. |
| P1-15 | Eight September 2026 number theory papers | ASK | None are public that I can find. Rule says no preprint URL, no listing. At most one line naming the area. |
| P1-16 | Deflated Sharpe Ratio correction | ASK | No public artifact found. Same rule. |
| P1-17 | Q.E.D. magazine | ASK | No URL given. Same rule. |
| P1-18 | Missing works that already pass the rule | ADD | `compulsory-hope` (sole author, PDF + repo), `unauthored-by-design` (third author, PDF + repo), the LiteFNO reproducibility study (sixth author, PDF + DOI + repo). All three are more verifiable than half of what is on the site today. The AIscend paper "Does the Decoding Algorithm Have a Voice?" is by Lu and Rajesh; you are not on it and it stays off. |
| P1-19 | Homepage says "70 percent" against "13 percent"; research page gives only 70 | CHANGE | Confirmed. Research page gets the pair. |
| P1-20 | "highest honor roll" twice on CV | CHANGE | Confirmed. Keep it once, under awards. |
| P1-21 | Malformed CV dates: "– 2025", "summer", "2 summers" | CHANGE, partially blocked | Stanford year and AwesomeMath years are needed from you. You said Penn was spring 2026; that one I can write. ASH start year needed or the row becomes "through 2025". |
| P1-22 | Two published emails | CHANGE | Confirmed. Sub-site carries the school address. Resolved by the sub-site decision. |

---

## P2. Polish

| # | Item | Verdict | Finding |
|---|------|---------|---------|
| P2-1 | No favicon | ADD | Confirmed, `favicon.ico` returns 404. An inline SVG data-URI favicon costs ~200 bytes and no extra request. |
| P2-2 | No `rel=canonical`, `author` meta, JSON-LD `Person` with ORCID in `sameAs` | ADD | Confirmed. JSON-LD is inline JSON, not third-party JS, and fits the no-dependency rule. |
| P2-3 | No `sitemap.xml`, `robots.txt`, `404.html` | ADD | Confirmed, `/404.html` returns GitHub's default. |
| P2-4 | No skip link; nav is bare anchors; `.on` without `aria-current` | CHANGE | Confirmed. `aria-current="page"` can replace `.on` in CSS with `nav a[aria-current]`, no new class. |
| P2-5 | Five CV rows with an empty date column | CHANGE | Confirmed. Rows without a date get a single-column variant. Add a `.row.undated` token-level rule rather than empty divs. |
| P2-6 | `&display=swap` unescaped in the Google Fonts `href` | CHANGE | Real validator error on all three pages. Should be `&amp;`. The local `tidy` also flagged `<nav>` and `<footer>` but that is an HTML4-era tidy; those are false positives. Phase 2 will use the W3C Nu validator over HTTP. |
| P2-7 | Google Fonts request | KEEP, noted | Not a tracker and not JS, so it passes your rules. It is the site's only third-party request and it does leak visitor IPs to Google. Self-hosting Newsreader (two woff2 files, ~60 KB) would remove it. Fonts do not count toward the 20 KB CSS+JS budget. Your call. |
| P2-8 | `.claude/launch.json` committed | DELETE from repo | Reviewed. Contents: a python http.server config with the absolute path `/Users/hyunjunyi/jun-yi-site`. Nothing secret, but it exposes your local username and directory layout for no benefit. Remove from the index, add `.claude/` to `.gitignore`. `photo_full.jpg` is untracked already; `CNAME.pending` is untracked. |
| P2-9 | Repo has no description, topics, README, license | ADD | Confirmed via API: all empty. README of three lines, `gh repo edit` for description and topics. License: content is yours; a short "code MIT, text and photo all rights reserved" line in the README is enough. |
| P2-10 | `<title>` casing | KEEP | Lowercase titles match the voice. |
| P2-11 | Inline `style=` on `research.html` and `cv.html` `<h1>` and lede | CHANGE | Two inline styles that belong in `style.css` as a `.page-title` rule. |
| P2-12 | `<hr class="rule">` elements are `display:none` | DELETE | Dead markup left from the first design. Remove the elements. |
| P2-13 | LinkedIn URL | KEEP | curl gets 999 from LinkedIn (bot block); the URL is well-formed and matches your resume. Cannot be script-verified. |
| P2-14 | Photo alt text "hyunjun yi" | KEEP | Correct for a portrait. |
| P2-15 | `research.html` lede "two threads" | CHANGE | With compulsory-hope, seed study, and LiteFNO added, the language-model section splits naturally into poetics, decoding, and reproducibility. Three sub-headings, one lede. |

Things I checked that are fine and should stay: `style.css` token system, dark mode, reduced-motion and reduced-transparency paths, the `js-reveal` gate (with JS disabled every element renders; I confirmed the CSS only hides under `.js-reveal`), CSS+JS weight (10,899 bytes today), fluid type, and the photo crop.

---

## Recommendation on `/jun-yi-math-research/`

Recommendation: replace, do not delete, do not update in place.

Argument. The URL is printed on your resume PDF and is the link the old site's GitHub README carries, so a hard 404 breaks links you have already handed people. Updating the Jekyll site in place means maintaining two sites with two voices, and the second one will go stale again. Folding it in is the right end state: the four artifacts (Basel writeup, zeta code and output, Taylor writeup, open questions) live in the `jun-yi-math-research` repo and are worth linking from `research.html` directly as GitHub files.

Concrete steps, in that repo (not this one):

1. Replace `index.html` with a single static page: one line, `<meta http-equiv="refresh" content="0; url=https://hjyi2027.github.io/research.html#number-theory">`, a `<link rel="canonical">` to the same target, and a visible fallback link. No Jekyll layout, so the school email and "junior" text are gone from the web.
2. Leave the markdown and Python files where they are. `research.html` on the main site links to them by file URL.
3. Update that repo's README to point at the main site.

Effect: old links land on the current research page, the contradictory prose disappears, nothing is lost, and there is one site to maintain. I can do steps 1 to 3 in Phase 2 if you authorize me to push to `hjyi2027/jun-yi-math-research`.

---

## Proposed information architecture

Three pages, same nav, plus four support files. No new pages.

**`index.html`**
- nav: home · research · cv · contact (mailto)
- hero: photo, name, one-line role that the AIscend team page can back (P0-2)
- three-sentence bio: school and year, the one question the LM work asks, number theory and YIMO in one sentence each
- pills: email · github (hjyi2027) · orcid · linkedin · cv
- selected work, three items, each title → `research.html#id`, each meta line carrying `pdf` and `code` links inline: restored lines, erasure, and either the LiteFNO study or unchosen word. The sampler paper drops out of "selected" until the sweep runs; a reader should not meet the site's weakest artifact first.
- footer

**`research.html`**
- `#language-models` with three sub-heads: `#poetics` (restored lines, erasure, unchosen word, compulsory hope), `#decoding` (unauthored by design, the sampler is a confound with honest status), `#reproducibility` (LiteFNO study with DOI, specscope with repo)
- `#number-theory`: one line on the area if you want it, then basel, zeta experiments, taylor series, each linking to its GitHub file. Partitions stub removed.
- every item: `id`, title link, meta line with year · role (sole author / with X / sixth author) · pdf · code · doi where each exists

**`cv.html`**
- header line with all five links plus a link back to research
- education with full dates
- research: one entry linking to `research.html`, no duplication of the list
- leadership: yimo (competition director, sponsors named, registrations figure with link to the YIMO stats page), stemise, align gsoc, applied research club, each with one sentence
- awards with years
- skills and languages
- print stylesheet so "print this page" produces a usable PDF

**Support files**: `404.html`, `robots.txt`, `sitemap.xml`, `README.md`. Favicon inline as SVG data-URI. OG tags and JSON-LD in each `<head>`.

---

## Open questions

Each one blocks the change named.

1. **Sampler paper status.** Blocks P0-1. Exact wording you want: "design and code public, sweep not yet run", or is the sweep now running or done? If done, what are the two headline numbers and where are they published?
2. **AIscend title.** Blocks P0-2. Will the lab team page be updated to say "head of ai research"? If not, what title does the lab agree to, or do I drop the title and say "researcher at aiscend"?
3. **YIMO title.** Blocks P1-9. "competition director" (matches the live site) or "director"? If "director", what public page says so?
4. **YIMO backing.** Blocks P1-10. Which two nonprofits, and where is that stated publicly? Same for "staff across 17 countries". Without a URL these stay off.
5. **YIMO figure.** Blocks P1-10 and P1-11. "2,900+ registrations across YIMO I and II" (what the live stats page supports) or a different number with a source?
6. **YIMO results.** Blocks P0-3. Is there a results or archive page for the August 2026 contest I can link in place of the dead date? If YIMO III is scheduled, date and page.
7. **STEMise, ALIGN GSOC, Applied Research Club.** Blocks P1-7 and P1-8. One sentence each: what it is, what you do. If any has no URL, say so and I write the sentence without a link.
8. **Dates.** Blocks P1-21. Stanford coursework year; AwesomeMath years and courses; ASH start year; Stanford Math Tournament year; AMC 12 year is 2025 on the site, confirm.
9. **CV PDF.** Blocks P1-12. Option (a), (b), or (c) from P1-12?
10. **September 2026 number theory papers.** Blocks P1-6 and P1-15. Any with a public preprint URL? If none, do you want the single area line or nothing?
11. **Deflated Sharpe Ratio, Q.E.D. magazine.** Blocks P1-16 and P1-17. URLs or they stay off.
12. **LambdaMath.** Blocks P0-8. Tell me when the credited version is live and I verify it before writing a line.
13. **Sub-site.** Blocks the recommendation above. Authorize a push to `hjyi2027/jun-yi-math-research`, or tell me you will do it.
14. **Fonts.** Blocks P2-7. Keep Google Fonts or self-host?
15. **OG card.** Blocks P1-13. Square `photo.jpg` only, or a hand-made 1200x630 card as well?
16. **Author role wording.** Blocks P1-18. For the LiteFNO study you are sixth of six. I will write "with Goldstein, Zhou, Lu, Zhang and Deshpande" and no ranking. Acceptable, or list it as "contributor"?

---

## Implementation order and effort

Ordered by credibility damage per minute of work. Each row is one commit unless noted.

| Order | Change | Effort |
|-------|--------|--------|
| 1 | Reword sampler status on all three pages (P0-1) | 10 min, after Q1 |
| 2 | Remove "300k impressions", fix contest date line, fix YIMO title and figure, add sponsors (P0-3, P0-5, P1-9, P1-10) | 20 min, after Q3 to Q6 |
| 3 | Add `id`s to research items, anchor homepage titles, make every title a link, per-project code links, PDF and DOI links, year on every item (P0-7, P1-1, P1-2, P1-3, P1-5, P1-19) | 45 min |
| 4 | Add compulsory hope, unauthored by design, LiteFNO study; remove partitions stub; restructure into three sub-heads (P1-6, P1-18, P2-15) | 40 min, after Q10 and Q16 |
| 5 | Github pill to personal account; CV header links; CV dedupe; date fixes (P0-6, P1-4, P1-11, P1-20, P1-21) | 25 min, after Q8 |
| 6 | Sub-site redirect stub in the other repo (P0-4, P1-22) | 15 min, after Q13 |
| 7 | Head metadata: unique descriptions, OG and Twitter tags, canonical, author, JSON-LD Person (P1-13, P1-14, P2-2) | 30 min, after Q15 |
| 8 | Favicon, `404.html`, `robots.txt`, `sitemap.xml` (P2-1, P2-3) | 20 min |
| 9 | Accessibility: skip link, nav as list, `aria-current` replacing `.on`; undated-row variant; move inline styles into tokens; drop dead `<hr>`; fix `&amp;` (P2-4, P2-5, P2-6, P2-11, P2-12) | 35 min |
| 10 | Print stylesheet and CV download path (P1-12) | 20 min, after Q9 |
| 11 | Repo hygiene: untrack `.claude/`, README, description, topics (P2-8, P2-9) | 10 min |
| 12 | Verification pass: W3C Nu validator on all pages, 375/768/1440 in light and dark, reduced-motion forced, JS disabled, every external link curl-checked, CSS+JS weight reported | 45 min |
| 13 | AIscend team page title (P0-2) and LambdaMath (P0-8) | outside this repo, on you |

Total inside this repo: roughly five hours of work across about twelve commits, once the open questions are answered. Items 3, 7, 8, 9, 11 and 12 need no answers and can start on your go.

Phase 1 ends here. Nothing in `index.html`, `research.html`, `cv.html`, `style.css`, or `site.js` was modified. Waiting for your answers before Phase 2.
