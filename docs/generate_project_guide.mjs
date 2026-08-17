import fs from "node:fs";
import path from "node:path";

const W = 595;
const H = 842;
const M = 42;
const colors = {
  navy: [0.043, 0.161, 0.271],
  dark: [0.027, 0.086, 0.157],
  teal: [0.098, 0.663, 0.612],
  tealDark: [0.031, 0.451, 0.424],
  text: [0.094, 0.149, 0.227],
  muted: [0.39, 0.47, 0.55],
  border: [0.86, 0.90, 0.93],
  soft: [0.953, 0.969, 0.98],
  tealSoft: [0.918, 0.976, 0.969],
  amberSoft: [1, 0.969, 0.89],
  white: [1, 1, 1],
};

const f = (value) => Number(value.toFixed(3));
const rgb = (c) => `${f(c[0])} ${f(c[1])} ${f(c[2])}`;
const esc = (value) =>
  String(value)
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/[\r\n]+/g, " ");

function wrap(text, maxWidth, size, factor = 0.52) {
  const maxChars = Math.max(8, Math.floor(maxWidth / (size * factor)));
  const words = String(text).split(/\s+/);
  const lines = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length <= maxChars) line = next;
    else {
      if (line) lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

class Page {
  constructor(number, title, section) {
    this.ops = [];
    this.number = number;
    if (title) this.standardHeader(title, section);
  }
  fillRect(x, top, width, height, color) {
    this.ops.push(`${rgb(color)} rg ${f(x)} ${f(H - top - height)} ${f(width)} ${f(height)} re f`);
  }
  strokeRect(x, top, width, height, color = colors.border, lineWidth = 0.8) {
    this.ops.push(`${rgb(color)} RG ${lineWidth} w ${f(x)} ${f(H - top - height)} ${f(width)} ${f(height)} re S`);
  }
  line(x1, top1, x2, top2, color = colors.border, lineWidth = 0.8) {
    this.ops.push(`${rgb(color)} RG ${lineWidth} w ${f(x1)} ${f(H - top1)} m ${f(x2)} ${f(H - top2)} l S`);
  }
  text(text, x, top, size = 10, font = "F1", color = colors.text) {
    this.ops.push(`${rgb(color)} rg BT /${font} ${f(size)} Tf 1 0 0 1 ${f(x)} ${f(H - top)} Tm (${esc(text)}) Tj ET`);
  }
  paragraph(text, x, top, width, size = 10, lineHeight = 14, color = colors.text, font = "F1") {
    const lines = wrap(text, width, size, font === "F3" ? 0.6 : 0.52);
    lines.forEach((line, i) => this.text(line, x, top + i * lineHeight, size, font, color));
    return top + lines.length * lineHeight;
  }
  card(x, top, width, height, { fill = colors.white, border = colors.border } = {}) {
    this.fillRect(x, top, width, height, fill);
    this.strokeRect(x, top, width, height, border);
  }
  standardHeader(title, section) {
    this.fillRect(M, 33, 511, 6, colors.teal);
    this.text(section.toUpperCase(), M, 59, 8.5, "F2", colors.tealDark);
    this.text(title, M, 91, 23, "F2", colors.navy);
  }
  footer() {
    this.line(M, 806, W - M, 806, colors.border);
    this.text("ADAP - Simple Working Guide", M, 824, 8, "F1", colors.muted);
    this.text(String(this.number), W - M - 4, 824, 8, "F2", colors.muted);
  }
  stream() {
    return this.ops.join("\n");
  }
}

const pages = [];

{
  const p = new Page(1);
  p.fillRect(0, 0, W, H, colors.dark);
  p.fillRect(0, 600, W, 242, colors.navy);
  p.fillRect(42, 52, 52, 52, colors.teal);
  p.text("A", 59, 89, 25, "F2", colors.dark);
  p.text("SIMPLE PROJECT GUIDE", 42, 225, 10, "F2", [0.5, 0.93, 0.89]);
  p.text("How the ADAP", 42, 287, 35, "F2", colors.white);
  p.text("project works", 42, 331, 35, "F2", colors.white);
  p.paragraph(
    "A beginner-friendly explanation of how synthetic CSV records become searchable timelines, maps, analytics, and reports.",
    42,
    383,
    475,
    15,
    22,
    [0.84, 0.9, 0.95],
  );
  p.text("Application Data Analysis Platform", 42, 790, 9, "F1", [0.7, 0.8, 0.87]);
  p.text("Project snapshot: August 2026", 406, 790, 9, "F1", [0.7, 0.8, 0.87]);
  pages.push(p);
}

{
  const p = new Page(2, "What is ADAP?", "1 - The big idea");
  p.paragraph(
    "ADAP is a demonstration web application. It combines activity records from four synthetic data files and shows them in one simple interface.",
    M,
    122,
    505,
    12,
    18,
    colors.muted,
  );
  const providers = [
    ["Foodpanda", [0.91, 0.35, 0.31]],
    ["Daraz", [0.88, 0.44, 0.17]],
    ["Pathao", [0.11, 0.6, 0.49]],
    ["Uber", [0.15, 0.21, 0.29]],
  ];
  providers.forEach(([label, color], i) => {
    const x = M + i * 130;
    p.fillRect(x, 177, 121, 38, color);
    p.text(label, x + 13, 201, 10.5, "F2", colors.white);
  });
  p.fillRect(M, 234, 511, 48, colors.tealSoft);
  p.fillRect(M, 234, 6, 48, colors.teal);
  p.paragraph(
    "Important: all included records are made-up test data. The project does not connect to real provider accounts or live devices.",
    56,
    253,
    480,
    10,
    14,
  );
  p.text("What a user can do", M, 318, 14, "F2", colors.tealDark);
  const actions = [
    ["1", "Search", "Find a synthetic user using an exact 11-digit phone number."],
    ["2", "Review", "See one combined activity timeline from all four sources."],
    ["3", "Understand", "Use maps, charts, summaries, filters, and a printable report."],
  ];
  actions.forEach(([n, title, body], i) => {
    const x = M + i * 173;
    p.card(x, 337, 164, 116);
    p.fillRect(x + 12, 350, 25, 25, colors.navy);
    p.text(n, x + 21, 368, 10, "F2", colors.white);
    p.text(title, x + 12, 397, 11.5, "F2", colors.text);
    p.paragraph(body, x + 12, 416, 139, 9.2, 13, colors.muted);
  });
  p.text("The project at a glance", M, 492, 14, "F2", colors.tealDark);
  const metrics = [["100", "shared synthetic users"], ["5,708", "included activity records"], ["6 months", "of demonstration data"]];
  metrics.forEach(([value, label], i) => {
    const x = M + i * 173;
    p.card(x, 512, 164, 78, { fill: colors.soft });
    p.text(value, x + 12, 545, 21, "F2", colors.navy);
    p.text(label, x + 12, 570, 8.8, "F1", colors.muted);
  });
  p.fillRect(M, 616, 511, 74, colors.amberSoft);
  p.fillRect(M, 616, 6, 74, [0.84, 0.61, 0.13]);
  p.paragraph(
    "Safety boundary: ADAP does not perform live tracking, facial recognition, criminal prediction, guilt scoring, or autonomous targeting.",
    57,
    644,
    478,
    10,
    15,
  );
  p.footer();
  pages.push(p);
}

{
  const p = new Page(3, "How data moves through the app", "2 - Architecture");
  p.paragraph(
    "The browser never reads the CSV files directly. The server loads, checks, and prepares the data before sending only the requested result to the screen.",
    M,
    122,
    505,
    12,
    18,
    colors.muted,
  );
  const flow1 = [
    ["Browser", "Search, profile, timeline, map and charts"],
    ["Next.js API", "Validates requests and calls the data layer"],
    ["Provider adapters", "Read each source through one interface"],
  ];
  flow1.forEach(([title, body], i) => {
    const x = M + i * 174;
    p.card(x, 185, 150, 78, { fill: colors.soft });
    p.text(title, x + 12, 215, 11.5, "F2", colors.navy);
    p.paragraph(body, x + 12, 235, 126, 8.7, 12, colors.muted);
    if (i < 2) p.text(">", x + 158, 231, 20, "F2", colors.teal);
  });
  const flow2 = [
    ["CSV files", "Stay in the server-side data folder"],
    ["Validation + indexes", "Reject bad rows; index phone and user ID"],
    ["Unified activities", "Common fields for sorting and filtering"],
  ];
  flow2.forEach(([title, body], i) => {
    const x = M + i * 174;
    p.card(x, 278, 150, 78, { fill: colors.tealSoft, border: [0.73, 0.89, 0.87] });
    p.text(title, x + 12, 308, 11, "F2", colors.tealDark);
    p.paragraph(body, x + 12, 328, 126, 8.7, 12, colors.muted);
    if (i < 2) p.text(">", x + 158, 324, 20, "F2", colors.teal);
  });
  p.text("Why there are adapters", M, 401, 14, "F2", colors.tealDark);
  p.paragraph(
    "Each provider CSV has different field names. For example, one source may use an order time while another uses a request time. Each adapter translates its own rows into the same normalized activity shape.",
    M,
    425,
    505,
    10,
    15,
  );
  p.card(M, 487, 248, 122, { fill: colors.soft });
  p.text("Before normalization", 56, 515, 11, "F2", colors.navy);
  ["- Different timestamps", "- Different activity types", "- Different provider details"].forEach((t, i) => p.text(t, 56, 541 + i * 19, 9.5, "F1", colors.muted));
  p.card(306, 487, 247, 122, { fill: colors.soft });
  p.text("After normalization", 320, 515, 11, "F2", colors.navy);
  ["- One occurredAt time", "- One provider label", "- One searchable and sortable model"].forEach((t, i) => p.text(t, 320, 541 + i * 19, 9.5, "F1", colors.muted));
  p.fillRect(M, 636, 511, 68, colors.tealSoft);
  p.fillRect(M, 636, 6, 68, colors.teal);
  p.paragraph(
    "Result: timeline, analytics, map, and report code can work with one model instead of understanding four CSV formats.",
    57,
    663,
    475,
    10,
    15,
  );
  p.footer();
  pages.push(p);
}

{
  const p = new Page(4, "What happens when you search", "3 - Request walkthrough");
  const steps = [
    ["1", "Enter a phone number", "The user enters an exact 11-digit number, such as 01000000001."],
    ["2", "Validate the request", "The API checks the format. Bad input receives a safe error."],
    ["3", "Query all adapters", "The server asks all four provider adapters at the same time."],
    ["4", "Use fast indexes", "Prepared lookups find matching rows by phone or user ID."],
    ["5", "Combine the records", "Rows are normalized, merged, and sorted by event time."],
    ["6", "Return only the result", "The API sends consistent JSON and the page renders it."],
  ];
  steps.forEach(([n, title, body], i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = M + col * 260;
    const top = 120 + row * 132;
    p.card(x, top, 251, 113);
    p.fillRect(x + 13, top + 14, 25, 25, colors.navy);
    p.text(n, x + 22, top + 32, 10, "F2", colors.white);
    p.text(title, x + 50, top + 31, 11, "F2", colors.tealDark);
    p.paragraph(body, x + 13, top + 61, 224, 9.5, 14, colors.muted);
  });
  p.text("Partial failures do not break everything", M, 533, 14, "F2", colors.tealDark);
  p.paragraph(
    "If one provider fails, successful results from the others can still be shown. The failed provider is named in response metadata.",
    M,
    558,
    505,
    10,
    15,
  );
  p.fillRect(M, 610, 511, 38, colors.dark);
  p.text("Search > validate > query 4 sources > normalize > sort > response > screen", 55, 634, 9.2, "F3", colors.white);
  p.fillRect(M, 672, 511, 78, colors.amberSoft);
  p.fillRect(M, 672, 6, 78, [0.84, 0.61, 0.13]);
  p.paragraph(
    "Simple authentication: protected screens use a demonstration session cookie. Replace this with production-grade identity and authorization for real use.",
    57,
    700,
    475,
    10,
    15,
  );
  p.footer();
  pages.push(p);
}

{
  const p = new Page(5, "What each screen does", "4 - Main screens");
  const rows = [
    ["Dashboard", "Search and see provider health, users, and record totals."],
    ["Users", "Browse a summary-only directory."],
    ["Profile", "See identity summary, provider sections, notes, and recent activity."],
    ["Timeline", "Combine and filter activities; export selected data as CSV."],
    ["Map", "Plot historical points and optionally connect them in event order."],
    ["Analytics", "Show descriptive charts, date patterns, and provider counts."],
    ["Report", "Build a printable summary that a browser can save as PDF."],
    ["Geofences", "Simulate whether historical points entered or exited a circle."],
    ["Cases / Audit", "Keep demonstration case and UI-action data in this browser."],
    ["Data sources", "Show adapter status, record counts, and parse health."],
  ];
  p.fillRect(M, 121, 511, 31, colors.navy);
  p.text("SCREEN", 54, 141, 9, "F2", colors.white);
  p.text("SIMPLE PURPOSE", 190, 141, 9, "F2", colors.white);
  rows.forEach(([name, purpose], i) => {
    const top = 152 + i * 40;
    if (i % 2 === 0) p.fillRect(M, top, 511, 40, colors.soft);
    p.line(M, top + 40, 553, top + 40, colors.border);
    p.text(name, 54, top + 24, 9.5, "F2", colors.text);
    p.text(purpose, 190, top + 24, 9.2, "F1", colors.muted);
  });
  p.text("Where work happens", M, 588, 14, "F2", colors.tealDark);
  p.card(M, 610, 248, 135, { fill: colors.soft });
  p.text("On the server", 56, 637, 11, "F2", colors.navy);
  ["- Read and validate CSV files", "- Search and filter activity", "- Normalize provider records", "- Calculate API results"].forEach((t, i) => p.text(t, 56, 660 + i * 18, 9, "F1", colors.muted));
  p.card(306, 610, 247, 135, { fill: colors.soft });
  p.text("In the browser", 320, 637, 11, "F2", colors.navy);
  ["- Display pages and charts", "- Interact with maps", "- Store local demo items", "- Print or Save as PDF"].forEach((t, i) => p.text(t, 320, 660 + i * 18, 9, "F1", colors.muted));
  p.footer();
  pages.push(p);
}

{
  const p = new Page(6, "How the code is organized", "5 - Files and technology");
  const rows = [
    ["data/*.csv", "Four synthetic datasets; not in the public web folder."],
    ["src/lib/data/", "Schemas, parsing, validation, indexes, and normalization."],
    ["src/lib/providers/", "Common adapter interface and four implementations."],
    ["src/app/api/", "Validated route handlers with safe JSON responses."],
    ["src/app/", "Next.js pages and routes."],
    ["src/components/", "Reusable UI for maps, charts, profiles, cases, and more."],
    ["proxy.ts", "Demonstration session-cookie gate."],
  ];
  p.fillRect(M, 121, 511, 31, colors.navy);
  p.text("FOLDER OR FILE", 54, 141, 9, "F2", colors.white);
  p.text("RESPONSIBILITY", 230, 141, 9, "F2", colors.white);
  rows.forEach(([file, purpose], i) => {
    const top = 152 + i * 42;
    if (i % 2 === 0) p.fillRect(M, top, 511, 42, colors.soft);
    p.line(M, top + 42, 553, top + 42, colors.border);
    p.text(file, 54, top + 25, 9, "F3", colors.text);
    p.text(purpose, 230, top + 25, 9.2, "F1", colors.muted);
  });
  p.text("Core technology", M, 480, 14, "F2", colors.tealDark);
  const tech = [
    ["Next.js + React", "Pages, APIs, and interactive UI"],
    ["Zod", "Request and CSV validation"],
    ["csv-parse", "CSV text to records"],
    ["Leaflet", "Historical map points"],
    ["Recharts", "Analytics charts"],
    ["Vitest", "Automated project tests"],
  ];
  tech.forEach(([name, body], i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = M + col * 173;
    const top = 500 + row * 86;
    p.card(x, top, 164, 76, { fill: colors.soft });
    p.text(name, x + 12, top + 29, 10.5, "F2", colors.navy);
    p.text(body, x + 12, top + 51, 8.5, "F1", colors.muted);
  });
  p.text("Caching in simple words", M, 696, 14, "F2", colors.tealDark);
  p.paragraph(
    "The first request in a warm server process reads and validates the files. ADAP keeps prepared datasets in memory so later requests can reuse them. Each serverless instance has its own cache.",
    M,
    720,
    505,
    9.5,
    14,
  );
  p.footer();
  pages.push(p);
}

{
  const p = new Page(7, "How to run the project", "6 - Run and remember");
  p.text("Requirements: Node.js 20.9 or newer and npm.", M, 126, 10.5, "F1", colors.muted);
  p.fillRect(M, 148, 511, 66, colors.dark);
  p.text("npm install", 58, 176, 10, "F3", colors.white);
  p.text("npm run dev", 58, 197, 10, "F3", colors.white);
  p.text("Open http://localhost:3000 and use the demonstration account:", M, 245, 10.5, "F1", colors.text);
  p.card(M, 264, 248, 66, { fill: colors.soft });
  p.text("Username", 56, 289, 9, "F2", colors.muted);
  p.text("analyst", 56, 314, 12, "F3", colors.navy);
  p.card(306, 264, 247, 66, { fill: colors.soft });
  p.text("Password", 320, 289, 9, "F2", colors.muted);
  p.text("adap123", 320, 314, 12, "F3", colors.navy);
  p.text("Useful checks", M, 372, 14, "F2", colors.tealDark);
  p.fillRect(M, 391, 511, 83, colors.dark);
  ["npm test", "npm run lint", "npm run build"].forEach((t, i) => p.text(t, 58, 417 + i * 21, 10, "F3", colors.white));
  p.text("The simplest summary", M, 515, 14, "F2", colors.tealDark);
  p.fillRect(M, 536, 511, 87, colors.tealSoft);
  p.fillRect(M, 536, 6, 87, colors.teal);
  p.paragraph(
    "ADAP reads four private synthetic CSV files, validates them, finds matching user records through adapters, converts them into one common activity format, and shows results through demo pages and APIs.",
    57,
    564,
    472,
    10.3,
    15.5,
    colors.text,
    "F2",
  );
  p.text("Before any real-world use", M, 660, 14, "F2", colors.tealDark);
  const checks = [
    "Replace demo login with real identity, roles, and authorization.",
    "Move local notes, cases, and audit data to protected storage.",
    "Add encryption, retention rules, monitoring, and data agreements.",
    "Keep the safety boundary clear: this is a synthetic demonstration.",
  ];
  checks.forEach((t, i) => {
    p.text("[x]", M, 686 + i * 22, 9.5, "F2", colors.tealDark);
    p.text(t, 68, 686 + i * 22, 9.5, "F1", colors.text);
  });
  p.footer();
  pages.push(p);
}

function buildPdf(pageList) {
  const objects = new Map();
  objects.set(1, "<< /Type /Catalog /Pages 2 0 R >>");
  objects.set(3, "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>");
  objects.set(4, "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>");
  objects.set(5, "<< /Type /Font /Subtype /Type1 /BaseFont /Courier /Encoding /WinAnsiEncoding >>");
  const refs = [];
  let id = 6;
  for (const page of pageList) {
    const contentId = id++;
    const pageId = id++;
    const stream = page.stream();
    objects.set(contentId, `<< /Length ${Buffer.byteLength(stream, "ascii")} >>\nstream\n${stream}\nendstream`);
    objects.set(
      pageId,
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${H}] /Resources << /Font << /F1 3 0 R /F2 4 0 R /F3 5 0 R >> >> /Contents ${contentId} 0 R >>`,
    );
    refs.push(`${pageId} 0 R`);
  }
  objects.set(2, `<< /Type /Pages /Kids [${refs.join(" ")}] /Count ${refs.length} >>`);

  const maxId = Math.max(...objects.keys());
  const chunks = [Buffer.from("%PDF-1.4\n%ADAP\n", "ascii")];
  const offsets = new Array(maxId + 1).fill(0);
  let offset = chunks[0].length;
  for (let n = 1; n <= maxId; n++) {
    const obj = Buffer.from(`${n} 0 obj\n${objects.get(n)}\nendobj\n`, "ascii");
    offsets[n] = offset;
    chunks.push(obj);
    offset += obj.length;
  }
  const xrefOffset = offset;
  let xref = `xref\n0 ${maxId + 1}\n0000000000 65535 f \n`;
  for (let n = 1; n <= maxId; n++) xref += `${String(offsets[n]).padStart(10, "0")} 00000 n \n`;
  xref += `trailer\n<< /Size ${maxId + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
  chunks.push(Buffer.from(xref, "ascii"));
  return Buffer.concat(chunks);
}

const outPath = path.join(process.cwd(), "docs", "ADAP_Project_Working_Guide.pdf");
const pdf = buildPdf(pages);
fs.writeFileSync(outPath, pdf);
console.log(`Created ${outPath} (${pages.length} pages, ${pdf.length} bytes)`);
