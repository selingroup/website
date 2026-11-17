# Selin Group website — guide for AI assistants (and humans)

This is a static site built with [Eleventy](https://www.11ty.dev/). Content lives in plain
Markdown and YAML files; GitHub Actions builds it and publishes to GitHub Pages on every push
to `main`. **Most edits only touch files under `src/`, never templates or CSS.**

## Where things live

| To change…                         | Edit                                             |
|-----------------------------------|--------------------------------------------------|
| Add/update a person               | `src/people/<first-last>.md`                     |
| Add a publication                 | `src/_data/publications.yml` (add at the **top**) |
| Add a news item                   | `src/news/YYYY-MM-DD-short-slug.md`              |
| Research page text                | `src/research.md`                                |
| Join Us / prospective students    | `src/join.md`                                    |
| Home page hero + 3 theme cards, nav, footer | `src/_data/site.yml`                   |
| Colors / fonts                    | `:root` block at top of `src/assets/css/style.css` |
| Old-URL redirects                 | `src/_data/redirects.yml`                        |
| Noelle's CV (published PDF)       | `src/files/Selin-CV.pdf` (keep this file name)   |
| Noelle's CV (editable, NOT published) | `cv/Selin-CV.docx` — see `cv/README.md`     |

If someone has no photo yet, leave out the `photo:` line and a neutral placeholder is shown.
Images go in `src/assets/images/people/`, `.../news/` or `.../site/`. Square photos (~600×600)
work best for people. PDFs and other files go in `src/files/` and are linked as `/files/name.pdf`.

## Recipes

**New group member** — create `src/people/jane-doe.md`:
```markdown
---
name: "Jane Doe"
role: "PhD Student, Earth, Atmospheric, and Planetary Sciences"
group: student          # one of: faculty, postdoc, student, staff, alumni
order: 115              # lower = earlier within its group
photo: /assets/images/people/jane-doe.jpg
website: https://example.com   # optional; also cv, scholar, email, mastodon, bluesky
photo_position: "50% 20%"     # optional: shift the square crop (0% = top of photo)
photo_credit: "Photographer Name"  # optional: shown under the photo on the profile page
---

Jane studies ... (bio in Markdown)
```

**Someone leaves the group** — in their file set `group: alumni`, update `role` to the
degree/position and years, e.g. `"PhD, Social and Engineering Systems (2026)"`, and give a
low `order` so recent alumni appear first (alumni are sorted by `order`). Keep the bio.

**New publication** — add to the top of `src/_data/publications.yml`:
```yaml
- title: "Paper title"
  citation: "A. Author, B. Author, and N. E. Selin. 2026. Journal Name 12, 345-367."
  year: 2026
  url: https://doi.org/10.xxxx/xxxxx
  news: https://news.mit.edu/...      # optional press coverage
```
Keep `"..."` quotes around title and citation. Write titles in **title case**: capitalize the first word, the word after a colon, and all major words; lowercase articles (a, an, the), coordinating conjunctions (and, but, or, nor, for, so, yet), and prepositions of four letters or fewer (e.g., of, in, on, to, for, from, with, into, over, via, vs.). Keep acronyms and formulas as written (GEOS-Chem, NOx, PM2.5, CO2, US). Group members (anyone with a file in
`src/people/`) are bolded automatically in citations. If a member's name appears in an unusual
form (e.g. a nickname), add it to that person's file as `pub_names: ["L. M. Freese"]`. If an
*outside* co-author shares a member's initials and surname, add `not_members: ["C. Chen"]`
to that publication. Year headings are generated automatically.
If given only a DOI, look up the metadata and format the citation like the existing entries.

**News item** — `src/news/2026-11-16-short-slug.md`:
```markdown
---
title: "Headline"
date: 2026-11-16
image: /assets/images/news/short-slug.jpg   # optional
link: https://news.mit.edu/...              # optional "Read the full story" button
---

One or two short paragraphs.
```

**When adding a publication**, also add it to `cv/Selin-CV.docx` and remind the user to export a new
PDF to `src/files/Selin-CV.pdf`. Never copy the Word file into `src/`.

## Checking your work

```bash
npm install        # first time only
npm start          # live preview at http://localhost:8080
npm run build      # must finish without errors before committing
```
Then commit and push to `main`; the site updates in ~1 minute.

## Rules for AI edits
- Edit content files; don't restructure templates unless asked.
- Preserve YAML validity (indentation, quotes). Run `npm run build` to verify.
- Don't invent facts (dates, degrees, citations). Ask if unsure.
- Use descriptive commit messages, e.g. "Add Jane Doe to people".
