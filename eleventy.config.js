import { load as yamlLoad } from "js-yaml";
import { HtmlBasePlugin } from "@11ty/eleventy";

export default function (eleventyConfig) {
  // Lets the site work both at www.selingroup.org (path prefix "/") and at a GitHub Pages
  // project address such as selingroup.github.io/website/ (path prefix "/website/").
  // The deploy workflow passes the right prefix with --pathprefix; links in templates stay "/...".
  eleventyConfig.addPlugin(HtmlBasePlugin);

  // YAML data files in src/_data
  eleventyConfig.addDataExtension("yml,yaml", (contents) => yamlLoad(contents));

  // Static files copied as-is
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy("src/CNAME");
  eleventyConfig.addPassthroughCopy("src/.nojekyll");
  eleventyConfig.addPassthroughCopy({ "src/files": "files" });

  // People sorted by `order`
  eleventyConfig.addCollection("peopleSorted", (api) =>
    api.getFilteredByTag("people").sort((a, b) => (a.data.order ?? 999) - (b.data.order ?? 999))
  );
  // News newest first
  eleventyConfig.addCollection("newsSorted", (api) =>
    api.getFilteredByTag("news").sort((a, b) => b.date - a.date)
  );

  eleventyConfig.addFilter("byGroup", (people, group) => people.filter((p) => p.data.group === group));
  eleventyConfig.addFilter("readableDate", (d) =>
    new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" })
  );
  eleventyConfig.addFilter("isoDate", (d) => new Date(d).toISOString().slice(0, 10));
  eleventyConfig.addFilter("limit", (arr, n) => (arr || []).slice(0, n));
  eleventyConfig.addFilter("featuredFirst", (pubs) => (pubs || []).filter((p) => p.featured));
  // Group publications by year (keeps file order inside each year).
  // Older papers are lumped into ranges; edit YEAR_GROUPS to change them.
  const YEAR_GROUPS = [
    { from: 2004, to: 2007 },
    { from: 1999, to: 2003 },
  ];
  eleventyConfig.addFilter("groupByYear", (pubs) => {
    const map = new Map();
    for (const p of pubs || []) {
      const g = YEAR_GROUPS.find((r) => p.year >= r.from && p.year <= r.to);
      const key = g ? `${g.from}–${g.to}` : String(p.year);
      const sort = g ? g.to : p.year;
      if (!map.has(key)) map.set(key, { year: key, sort, items: [] });
      map.get(key).items.push(p);
    }
    return [...map.values()].sort((a, b) => b.sort - a.sort);
  });
  // Plain-text excerpt from rendered HTML
  eleventyConfig.addFilter("excerpt", (html, n = 220) => {
    const t = String(html || "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
    return t.length > n ? t.slice(0, t.lastIndexOf(" ", n)) + "…" : t;
  });

  // Bold group members (anyone on the People page) in publication citations.
  // Matches "N. E. Selin", "N.E. Selin", "Selin, N. E." etc. built from each person's name,
  // plus any extra spellings listed in that person's `pub_names`. A publication can list
  // `not_members: ["C. Chen"]` to stop a same-named outside co-author from being bolded.
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const reEsc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const plain = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "");
  let memberPatterns = null;
  function buildPatterns(people) {
    const pats = [];
    for (const person of people) {
      const words = plain(person.data.name).split(/\s+/);
      const first = words[0][0].toUpperCase();
      const surnames = new Set([words[words.length - 1]]);
      if (words.length >= 3) {
        const two = words.slice(-2);
        surnames.add(two.join(" ")); surnames.add(two.join("-")); surnames.add(two.join(""));
      }
      for (const sn of surnames) {
        const S = reEsc(sn);
        // Initials first: "N. E. Selin", "N.E. Selin", "P Giani", "C.-T. Li"
        pats.push(new RegExp(`(?<![\\w.])${first}\\.?(?:[\\s-]*[A-Z]\\.?)*\\s+${S}(?![\\w-])`, "g"));
        // Surname first: "Selin, N. E."
        pats.push(new RegExp(`(?<![\\w-])(?<![A-Z]\\.?\\s)${S},\\s*${first}\\.(?:\\s*-?[A-Z]\\.)*`, "g"));
      }
      for (const alt of person.data.pub_names || []) {
        pats.push(new RegExp(`(?<![\\w.])${reEsc(alt)}(?![\\w-])`, "g"));
      }
    }
    return pats;
  }
  eleventyConfig.addFilter("boldMembers", function (citation, people, exclude) {
    memberPatterns ??= buildPatterns(people);
    const text = plain(citation);   // match on accent-free text, same length as original for NFC input
    const ranges = [];
    for (const re of memberPatterns) {
      re.lastIndex = 0;
      for (const m of text.matchAll(re)) {
        const hit = citation.slice(m.index, m.index + m[0].length);
        if ((exclude || []).includes(hit.trim())) continue;
        ranges.push([m.index, m.index + m[0].length]);
      }
    }
    ranges.sort((a, b) => a[0] - b[0]);
    let out = "", pos = 0;
    for (const [a, b] of ranges) {
      if (a < pos) continue;
      out += esc(citation.slice(pos, a)) + "<strong>" + esc(citation.slice(a, b)) + "</strong>";
      pos = b;
    }
    return out + esc(citation.slice(pos));
  });


  // Subscript chemical formulas in page text: CO2, CH4, PM2.5 (NOx is left as is).
  // Runs on every HTML page, only on visible text (not inside tags, <title>, <script> or <style>).
  const SUBSCRIPTS = [
    [/\bCO(?:2|₂)(?![\d.])/g, "CO<sub>2</sub>"],
    [/\bPM2\.5\b/g, "PM<sub>2.5</sub>"],
    [/\bCH(?:4|₄)(?![\d.])/g, "CH<sub>4</sub>"],
  ];
  eleventyConfig.addTransform("subscripts", function (content) {
    if (!(this.page.outputPath || "").endsWith(".html")) return content;
    let skip = 0;
    return content.split(/(<[^>]+>)/).map((part) => {
      if (part.startsWith("<")) {
        if (/^<(title|script|style)\b/i.test(part)) skip++;
        else if (/^<\/(title|script|style)>/i.test(part)) skip = Math.max(0, skip - 1);
        return part;
      }
      if (skip) return part;
      return SUBSCRIPTS.reduce((t, [re, rep]) => t.replace(re, rep), part);
    }).join("");
  });

  eleventyConfig.addFilter("year", () => new Date().getFullYear());

  return {
    dir: { input: "src", output: "_site", includes: "_includes", data: "_data" },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
}
