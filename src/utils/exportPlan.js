/**
 * Export utilities for the SEASplan 4-year planner.
 * Supports CSV, JSON, and browser print-to-PDF.
 */

const YEARS = [1, 2, 3, 4];
const QUARTERS = ['fall', 'winter', 'spring', 'summer'];
const QUARTER_LABELS = { fall: 'Fall', winter: 'Winter', spring: 'Spring', summer: 'Summer' };

/** Build a flat table rows array from the planner state */
function buildRows(planner) {
  const rows = [];
  YEARS.forEach(year => {
    QUARTERS.forEach(quarter => {
      const key = `year-${year}-${quarter}`;
      const courses = planner[key] || [];
      if (courses.length === 0) {
        rows.push({
          Year: `Year ${year}`,
          Quarter: QUARTER_LABELS[quarter],
          'Course Code': '',
          'Course Title': 'Nothing planned',
          Units: 0,
        });
      } else {
        courses.forEach(course => {
          // planner stores full course objects
          const code = course?.code ?? course?.id ?? String(course);
          const title = course?.title ?? '';
          const units = course?.units ?? 4;
          rows.push({
            Year: `Year ${year}`,
            Quarter: QUARTER_LABELS[quarter],
            'Course Code': code,
            'Course Title': title,
            Units: units,
          });
        });
      }
    });
  });
  return rows;
}

/** Download CSV */
export function exportCSV(planner) {
  const rows = buildRows(planner);
  if (rows.length === 0) { alert('Your plan is empty — nothing to export.'); return; }
  const headers = ['Year', 'Quarter', 'Course Code', 'Course Title', 'Units'];
  const csvContent = [
    headers.join(','),
    ...rows.map(row => headers.map(h => `"${String(row[h] ?? '').replace(/"/g, '""')}"`).join(','))
  ].join('\n');
  downloadFile('seasplan.csv', 'text/csv', csvContent);
}

/** Download JSON */
export function exportJSON(planner) {
  const planObj = {};
  YEARS.forEach(year => {
    planObj[`Year ${year}`] = {};
    QUARTERS.forEach(quarter => {
      const key = `year-${year}-${quarter}`;
      const courses = (planner[key] || []).map(courseId => {
        const course = availableCourses.find(c => c.id === courseId);
        return course ? { code: course.code, title: course.title, units: course.units } : { code: courseId };
      });
      if (courses.length) planObj[`Year ${year}`][QUARTER_LABELS[quarter]] = courses;
    });
  });
  downloadFile('seasplan.json', 'application/json', JSON.stringify(planObj, null, 2));
}

/** Open print dialog for PDF */
export function exportPDF(planner) {
  const rows = buildRows(planner);
  if (rows.length === 0) { alert('Your plan is empty — nothing to export.'); return; }

  // Group by year + quarter for a nicer layout
  const grouped = {};
  rows.forEach(r => {
    const key = `${r.Year} — ${r.Quarter}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(r);
  });

  const tableRows = Object.entries(grouped).map(([label, courses]) => `
    <tr class="group-header"><td colspan="3">${label}</td></tr>
    ${courses.map(c => `<tr><td>${c['Course Code']}</td><td>${c['Course Title']}</td><td>${c.Units} units</td></tr>`).join('')}
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>SEASplan — 4-Year Plan</title>
      <style>
        body { font-family: 'Helvetica Neue', sans-serif; font-size: 12px; color: #111; margin: 2rem; }
        h1 { font-size: 20px; color: #2774AE; margin-bottom: 0.25rem; }
        p.subtitle { color: #666; margin-bottom: 1.5rem; font-size: 11px; }
        table { width: 100%; border-collapse: collapse; }
        th { background: #2774AE; color: white; text-align: left; padding: 6px 10px; font-size: 11px; }
        td { padding: 5px 10px; border-bottom: 1px solid #e5e7eb; }
        tr.group-header td { background: #f0f4f8; font-weight: 700; font-size: 12px; color: #2774AE; padding: 8px 10px; border-top: 2px solid #2774AE; }
        @media print { @page { margin: 1.5cm; } }
      </style>
    </head>
    <body>
      <h1>SEASplan — 4-Year Course Plan</h1>
      <p class="subtitle">Generated ${new Date().toLocaleDateString()}</p>
      <table>
        <thead><tr><th>Course Code</th><th>Course Title</th><th>Units</th></tr></thead>
        <tbody>${tableRows}</tbody>
      </table>
    </body>
    </html>
  `;

  const win = window.open('', '_blank');
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 500);
}

function downloadFile(filename, mimeType, content) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Parse a single CSV line, handling quoted fields correctly */
function parseCSVLine(line) {
  const result = [];
  let inQuotes = false;
  let current = '';
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'; i++; // escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

/** Parse a CSV exported by this app and return a planner object */
export function importCSV(file, availableCourses) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const lines = text.trim().split(/\r?\n/);
        if (lines.length < 2) { reject(new Error('CSV appears empty.')); return; }

        // Build empty planner
        const newPlanner = {};
        for (let y = 1; y <= 4; y++) {
          QUARTERS.forEach(q => { newPlanner[`year-${y}-${q}`] = []; });
        }

        const headers = parseCSVLine(lines[0]);
        const yearIdx = headers.indexOf('Year');
        const quarterIdx = headers.indexOf('Quarter');
        const codeIdx = headers.indexOf('Course Code');

        if (yearIdx === -1 || quarterIdx === -1 || codeIdx === -1) {
          reject(new Error('CSV is missing required columns (Year, Quarter, Course Code).'));
          return;
        }

        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue;
          const cols = parseCSVLine(lines[i]);
          const yearLabel = cols[yearIdx];
          const quarterLabel = cols[quarterIdx];
          const code = cols[codeIdx];

          // skip blank rows (empty quarters exported as "Nothing planned")
          if (!yearLabel || !quarterLabel || !code || !code.trim()) continue;

          const yearNum = yearLabel.replace('Year ', '').trim();
          const quarter = quarterLabel.toLowerCase();
          const key = `year-${yearNum}-${quarter}`;

          if (!newPlanner[key]) continue; // skip unknown quarter keys

          // Look up the full course object — the planner stores objects, not IDs
          const course = availableCourses.find(c => c.code === code || c.id === code);
          if (!course) continue; // skip unknown courses

          // Avoid duplicates
          if (!newPlanner[key].some(c => c.id === course.id)) {
            newPlanner[key].push(course);
          }
        }

        resolve(newPlanner);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsText(file);
  });
}
