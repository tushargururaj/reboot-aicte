// src/utils/submissionsClient.js

// Unified client for drafts + sending submissions to backend.
// Exports:
//   - submitSubmission({ userId, sectionCode, payload, file })
//   - submitFormFromState({ user, sectionCode, formState, file })
//   - saveDraft, getDraftById, getDraftsForUser, deleteDraft
//   - commonHandleSubmit({ user, sectionCode, formState, file, callbacks })
//   - flushSubmissionQueue()

const DRAFTS_KEY = "aicte_drafts_v1";
const QUEUE_KEY = "aicte_submission_queue_v1";

/* -------------------- localStorage helpers -------------------- */
const safeParse = (s) => {
    try { return JSON.parse(s); } catch { return null; }
};

const getLocal = (key) => {
    try { return safeParse(localStorage.getItem(key)) || []; } catch { return []; }
};
const setLocal = (key, val) => {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { console.error("localStorage set error", e); }
};

/* -------------------- Draft helpers (unchanged api semantics) -------------------- */
const getLocalDrafts = () => getLocal(DRAFTS_KEY);

export const saveDraft = (draftData) => {
    const drafts = getLocal(DRAFTS_KEY);
    const now = new Date().toISOString();

    if (draftData.existingId) {
        const idx = drafts.findIndex((d) => d.id === draftData.existingId);
        if (idx > -1) {
            drafts[idx] = { ...drafts[idx], ...draftData, id: draftData.existingId, updatedAt: now };
            setLocal(DRAFTS_KEY, drafts);
            return drafts[idx];
        }
    }

    const newId = `draft-${Date.now()}`;
    const newDraft = { id: newId, ...draftData, createdAt: now, updatedAt: now };
    drafts.push(newDraft);
    setLocal(DRAFTS_KEY, drafts);
    return newDraft;
};

export const getDraftById = (draftId) => {
    const drafts = getLocal(DRAFTS_KEY);
    return drafts.find((d) => d.id === draftId) || null;
};

export const getDraftsForUser = (userId) => {
    const drafts = getLocal(DRAFTS_KEY);
    if (!userId) return [];
    return drafts.filter((d) => d.userId === userId);
};

export const deleteDraft = (draftId) => {
    const drafts = getLocal(DRAFTS_KEY);
    const filtered = drafts.filter((d) => d.id !== draftId);
    setLocal(DRAFTS_KEY, filtered);
    return drafts.length !== filtered.length;
};

/* -------------------- Queue helpers -------------------- */
const getQueue = () => getLocal(QUEUE_KEY);
const setQueue = (q) => setLocal(QUEUE_KEY, q);

// enqueue a fallback submission (used when network fails)
const enqueueSubmission = (queued) => {
    const q = getQueue();
    q.push({ ...queued, id: `q-${Date.now()}`, createdAt: new Date().toISOString() });
    setLocal(QUEUE_KEY, q);
    return q[q.length - 1];
};

// flush queue: attempt to send queued items (skips items with file objects - those need manual retry)
export async function flushSubmissionQueue() {
    const q = getQueue();
    if (!q.length) return { ok: true, processed: 0 };

    const processed = [];
    for (const item of [...q]) {
        try {
            // only JSON payload queue entries (no files) are auto-sent here
            if (item.fileMeta) {
                // skip items with file metadata (can't attach actual file from localStorage)
                continue;
            }
            await submitSubmission({
                userId: item.userId,
                sectionCode: item.sectionCode,
                payload: item.payloadObj,
                file: null,
                retrying: true,
            });
            processed.push(item.id);
        } catch (err) {
            console.warn("Queue item failed to send, will keep it:", item.id, err);
        }
    }
    // remove processed
    const remaining = q.filter((it) => !processed.includes(it.id));
    setQueue(remaining);
    return { ok: true, processed: processed.length, remaining: remaining.length };
}

/* -------------------- network submit (single entry) -------------------- */
/**
 * submitSubmission
 * - userId: string
 * - sectionCode: string
 * - payload: plain object (form fields)
 * - file: File | null  (if provided, uses multipart/form-data)
 *
 * Returns: server JSON (resolved on res.ok) or throws Error on network / server non-ok
 */
export async function submitSubmission({ userId, sectionCode, payload, file, retrying = false }) {
    // Absolute URL is safer than relative
    const url = "/api/submissions/submit";

    try {
        let res;
        if (file) {
            const fd = new FormData();
            fd.append("userId", userId);
            fd.append("sectionCode", sectionCode);
            // payload stringified
            fd.append("payload", JSON.stringify(payload || {}));
            fd.append("file", file, file.name);

            res = await fetch(url, {
                method: "POST",
                credentials: "include",
                body: fd,
            });
        } else {
            res = await fetch(url, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ userId, sectionCode, payload }),
            });
        }

        // handle non-JSON responses as well
        const contentType = res.headers.get("content-type") || "";
        const isJson = contentType.includes("application/json");

        const data = isJson ? await res.json() : { success: res.ok, statusText: res.statusText };

        if (!res.ok) {
            // server returned non-2xx
            const msg = (data && (data.message || data.error)) || `Server responded ${res.status}`;
            const err = new Error(msg);
            err.status = res.status;
            err.payload = data;
            throw err;
        }

        // success
        return data;
    } catch (err) {
        // network or server error
        // If it's a network error (no response), err will likely not have status.
        console.error("submitSubmission failed:", err);

        // If file present, we cannot reliably queue the file payload (can't persist File in localStorage),
        // so propagate error to caller to allow saving as draft or instruct user.
        if (file) throw err;

        // Enqueue JSON-only payload for retry later
        try {
            enqueueSubmission({ userId, sectionCode, payloadObj: payload });
            // return a local-queued marker so UI can inform user
            return { success: true, queued: true, message: "Saved to local queue (offline). Will retry later." };
        } catch (qErr) {
            console.error("Failed to enqueue submission:", qErr);
            throw err;
        }
    }
}

/* -------------------- helper: prepare payload from form state & call submitSubmission -------------------- */
export async function submitFormFromState({ user, sectionCode, formState, file }) {
    if (!user) throw new Error("User not authenticated");
    const userId = user.id || user.email || "anonymous";

    // Here you can transform formState into the shape backend expects.
    // Currently we send formState as-is.
    const payload = { ...formState };

    return await submitSubmission({ userId, sectionCode, payload, file });
}

/* -------------------- commonHandleSubmit ---------- */
/**
 * commonHandleSubmit centralizes submit flow used by forms.
 *
 * Params:
 *  - user
 *  - sectionCode
 *  - formState
 *  - file (File | null)
 *  - callbacks (object) - optional:
 *       - setSubmitting(boolean)        // will be called at start/end if provided
 *       - onSuccess(serverData)        // server returned object OR { queued: true, message }
 *       - onError(error)               // receives Error object
 *       - onSavedAsDraft(draft)        // if saveDraft used as fallback
 *       - requireFile (bool)           // if true, will validate presence of file before submit
 *
 * Usage: import { commonHandleSubmit } and call inside your form's submit handler.
 */
export async function commonHandleSubmit({
    user,
    sectionCode,
    formState,
    file = null,
    callbacks = {},
}) {
    const {
        setSubmitting,
        onSuccess,
        onError,
        // onSavedAsDraft, // Not used here
        requireFile = false,
    } = callbacks || {};

    if (!user) {
        const e = new Error("Please sign in to submit.");
        onError?.(e);
        throw e;
    }

    if (requireFile && !file) {
        const e = new Error("Please attach the required proof file before submitting.");
        onError?.(e);
        throw e;
    }

    try {
        setSubmitting?.(true);

        // Attempt to send
        const response = await submitFormFromState({ user, sectionCode, formState, file });

        // response may be server JSON or queued indicator
        onSuccess?.(response);
        return response;
    } catch (err) {
        // If network error and formState can be saved as draft, optionally save
        // Caller controls whether to call saveDraft separately; we won't auto-save here.
        onError?.(err);
        throw err;
    } finally {
        setSubmitting?.(false);
    }
}