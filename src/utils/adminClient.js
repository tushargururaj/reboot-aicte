// src/utils/adminClient.js

const API_BASE = "http://localhost:3000/admin";

// Helper for fetch
const fetchJson = async (url) => {
    const res = await fetch(url, { credentials: "include" });
    if (!res.ok) {
        throw new Error(`API Error: ${res.status} ${res.statusText}`);
    }
    return await res.json();
};

// Get all faculty
export const getFacultyList = async () => {
    const data = await fetchJson(`${API_BASE}/all-faculty`);
    return data.faculty || [];
};

// Get single faculty details
// Since there is no direct endpoint for single faculty details (only submissions),
// we fetch the list and find the user.
export const getFacultyById = async (id) => {
    try {
        const list = await getFacultyList();
        // The ID from params might be string, API returns numbers or strings. Compare loosely.
        // eslint-disable-next-line eqeqeq
        return list.find((f) => f.id == id) || null;
    } catch (err) {
        console.error("Error fetching faculty by ID:", err);
        return null;
    }
};

// Get submissions for a specific faculty
export const getFacultySubmissions = async (facultyId) => {
    try {
        const data = await fetchJson(`${API_BASE}/submissions/${facultyId}`);
        // Backend returns array of submission objects directly
        // Map to match the UI expected shape if necessary, but the backend shape seems close.
        // Backend: { id, title, code, date, file, file_name, status }
        // UI expects: { id, title, category, date, docUrl }
        return data.map((sub) => ({
            id: sub.id,
            title: sub.title,
            category: sub.code, // Use code as category
            date: sub.date,
            docUrl: sub.file
                ? `${API_BASE}/download?p=${sub.file}&name=${encodeURIComponent(sub.file_name || "document")}`
                : "#",
            file: sub.file,
            fileName: sub.file_name,
        }));
    } catch (err) {
        console.error("Error fetching faculty submissions:", err);
        return [];
    }
};

// Get report for a specific category (section code)
// Get report for a specific category (section code)
export const getCategoryReport = async (sectionCode) => {
    try {
        const data = await fetchJson(`${API_BASE}/${sectionCode}`);

        // Normalize response:
        // Some endpoints return { report: [...] }
        // Others (like 6.1.2.1.1) return { CAY: [...], CAYm1: [...], CAYm2: [...], CAYm3: [...] }

        let rows = [];

        if (data.report) {
            rows = data.report;
        } else if (data.CAY || data.CAYm1 || data.CAYm2 || data.CAYm3) {
            // Flatten CAY arrays and tag them
            const c0 = (data.CAY || []).map(r => ({ ...r, cayGroup: 'CAY' }));
            const c1 = (data.CAYm1 || []).map(r => ({ ...r, cayGroup: 'CAYm1' }));
            const c2 = (data.CAYm2 || []).map(r => ({ ...r, cayGroup: 'CAYm2' }));
            const c3 = (data.CAYm3 || []).map(r => ({ ...r, cayGroup: 'CAYm3' }));
            rows = [...c0, ...c1, ...c2, ...c3];
        } else if (Array.isArray(data)) {
            rows = data;
        }

        // Map to common shape for SubmissionTable
        // Backend returns: faculty_name, event_name/society_name/course_name, date, file, file_name
        // Plus additional fields like location, organizer, grade_level, agency, grade_obtained
        return rows.map((row, idx) => ({
            id: row.id || `row-${idx}`,
            facultyName: row.faculty_name,
            title: row.event_name || row.society_name || row.course_name || "Untitled",
            date: row.date,
            category: sectionCode,
            cayGroup: row.cayGroup, // Preserve CAY group
            marks: row.marks,       // Preserve marks
            docUrl: row.file
                ? `${API_BASE}/download?p=${row.file}&name=${encodeURIComponent(row.file_name || "document")}`
                : "#",
            file: row.file,
            fileName: row.file_name,
            // Additional fields
            location: row.location,
            organizer: row.organizer,
            grade_level: row.grade_level,
            agency: row.agency,
            grade_obtained: row.grade_obtained
        }));

    } catch (err) {
        console.error(`Error fetching report for ${sectionCode}:`, err);
        return [];
    }
};

// Deprecated: getAllSubmissions was used for mock. 
// We now use getCategoryReport per category.
// If we need a "global" list, we'd have to fetch all categories, which is expensive.
// For compatibility, we can return empty or throw.
export const getAllSubmissions = async () => {
    console.warn("getAllSubmissions is deprecated. Use getCategoryReport(sectionCode).");
    return [];
};
