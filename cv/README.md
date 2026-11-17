# CV source (not published)

`Selin-CV.docx` is the editable Word version of Noelle Selin's CV. This folder is outside `src/`,
so Eleventy never copies it to the website.

The published copy is the PDF at `src/files/Selin-CV.pdf` (served at `/files/Selin-CV.pdf` and
linked from the "CV" button on Noelle's profile page).

To update after adding publications:
1. Add the paper to `src/_data/publications.yml` (see CLAUDE.md).
2. Add the same entry to the Peer-Reviewed Journal Articles list in `Selin-CV.docx`
   (newest first, next number up, title in title case, `*` before supervised students/postdocs).
3. Save the Word file, export it to PDF, and replace `src/files/Selin-CV.pdf` (keep the same file name).
