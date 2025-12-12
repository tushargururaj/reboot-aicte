// src/pages/forms/ProfessionalSocietyForm.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FormLayout from "../../components/faculty/FormLayout";
import { saveDraft, commonHandleSubmit } from "../../utils/submissionsClient";
import SubmissionResultModal from "../../components/common/SubmissionResultModal";
import { getAcademicYearOptions } from "../../utils/dateUtils";

// small helpers
const Label = ({ children }) => (
  <label className="text-xs uppercase tracking-wide text-gray-600 font-medium block mb-1">{children}</label>
);
const Input = ({ name, value, onChange, placeholder, type = "text", min = null, ...props }) => (
  <input type={type} name={name} value={value} min={min} onChange={onChange} placeholder={placeholder} {...props}
    className={`w-full rounded-lg border px-4 py-2.5 text-base focus:outline-none transition-colors ${props.disabled ? "bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed" : "bg-white border-gray-300 text-gray-800 focus:ring-2 focus:ring-indigo-500/70"} ${props.className || ""}`} />
);
const Select = ({ name, value, onChange, children }) => (
  <select name={name} value={value} onChange={onChange}
    className="w-full rounded-lg bg-white border border-gray-300 px-4 py-2.5 text-base text-gray-800 focus:ring-2 focus:ring-indigo-500/70 focus:outline-none transition-colors">
    {children}
  </select>
);


const ProfessionalSocietyForm = ({ user, draft, onBack, onLogout, customSubmitHandler, isMagicLink, lockedName, prefilledData, ...props }) => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    facultyName: lockedName || user?.name || "",
    academicYear: "",
    societyName: "",
    gradeOrPosition: "",
  });

  const [proofFile, setProofFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [draftId, setDraftId] = useState(draft?.id || null);
  const [modal, setModal] = useState({ open: false, type: "success", title: "", message: "" });
  const [academicYearOptions, setAcademicYearOptions] = useState([]);

  const SECTION_CODE = "6.1.1.1";

  // Handle Draft Data
  useEffect(() => {
    if (draft?.payload) setForm((prev) => ({ ...prev, ...draft.payload }));
    setDraftId(draft?.id || null);
  }, [draft]);

  // Handle AI Prefilled Data
  useEffect(() => {
    if (prefilledData) {
      setForm(prev => ({
        ...prev,
        societyName: prefilledData.society_name || prev.societyName,
        gradeOrPosition: prefilledData.membership_grade || prev.gradeOrPosition,
        academicYear: prefilledData.academic_year || prev.academicYear
      }));
    }
  }, [prefilledData]);

  const updateField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleFileChange = (e) => setProofFile(e.target.files?.[0] || null);
  const handleDrop = (e) => { e.preventDefault(); setProofFile(e.dataTransfer.files?.[0] || null); };
  const handleDragOver = (e) => e.preventDefault();

  const handleSaveDraft = async () => {
    if (!user) { alert("You must be logged in to save a draft."); return; }
    setSaving(true);
    const draftData = {
      userId: user.id || user.email,
      sectionCode: SECTION_CODE,
      title: form.societyName || "Untitled Professional Society Draft",
      payload: form,
    };
    if (draftId) draftData.existingId = draftId;

    try {
      const savedDraft = await saveDraft(draftData);
      setDraftId(savedDraft.id);
      setModal({ open: true, type: "info", title: "Draft Saved", message: "Your progress has been saved locally." });
      if (!draftId) navigate(`/new-submission/${SECTION_CODE}?draftId=${savedDraft.id}`, { replace: true });
    } catch (err) {
      console.error(err);
      setModal({ open: true, type: "error", title: "Save Failed", message: "Failed to save draft locally. Check console." });
    } finally { setSaving(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setModal({ open: false, type: "success", title: "", message: "" });

    const payload = {
      ...form,
      level: "National",
      membershipId: "",
      fromDate: null,
      toDate: null,
      contributionSummary: "",
    };

    setSubmitting(true);

    // Custom Handler for Magic Links
    if (customSubmitHandler) {
      const result = await customSubmitHandler(payload, proofFile);
      setSubmitting(false);
      if (!result.success) {
        setModal({ open: true, type: "error", title: "Submission Failed", message: "Failed to submit via secure link." });
      }
      return;
    }

    // Default Handler
    await commonHandleSubmit({
      user,
      sectionCode: SECTION_CODE,
      formState: payload,
      file: proofFile,
      callbacks: {
        setSubmitting,
        onSuccess: (res) => {
          setModal({
            open: true,
            type: res.queued ? "info" : "success",
            title: res.queued ? "Offline Submission" : "Submission Successful",
            message: res.message || "Your submission has been successfully sent for review."
          });
        },
        onError: (err) => {
          setModal({ open: true, type: "error", title: "Submission Failed", message: err.message || "A network or server error occurred." });
        },
        requireFile: true,
      }
    });
  };

  const formContent = (
    <div className={isMagicLink ? "" : "max-w-5xl mx-auto space-y-8 p-6 bg-white rounded-xl shadow-xl border border-gray-100"}>
      <div className="flex items-center justify-between gap-4 border-b border-gray-100 pb-4">
        <div>
          <p className="text-sm text-gray-500 font-mono">Table {SECTION_CODE} · Faculty Contributions</p>
          <h1 className="text-3xl font-semibold text-gray-900">Professional Society Memberships</h1>
          <p className="text-base text-gray-600 mt-1">Capture your active memberships in professional societies.</p>
        </div>
        {!isMagicLink && !customSubmitHandler && (
          <button type="button" onClick={() => navigate("/new-submission")} className="text-sm font-medium text-indigo-700 hover:text-indigo-900 border border-indigo-200 rounded-lg px-4 py-2 hover:bg-indigo-50 transition">← Back to New Submission</button>
        )}
      </div>

      <form onSubmit={handleSubmit} className={isMagicLink ? "space-y-8" : "rounded-xl bg-gray-50 px-8 py-8 space-y-8 shadow-inner border border-gray-200"}>
        {/* top fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label>Faculty Name</Label>
            <Input
              name="facultyName"
              value={form.facultyName}
              onChange={(e) => updateField("facultyName", e.target.value)}
              placeholder="Dr. A. B. Faculty"
              disabled={!!(user?.name || isMagicLink)} // Lock if logged in or magic link
              className={`w-full rounded-lg border px-4 py-2.5 text-base focus:outline-none transition-colors ${(user?.name || isMagicLink)
                ? "bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed"
                : "bg-white border-gray-300 text-gray-800 focus:ring-2 focus:ring-indigo-500/70"
                }`}
            />
          </div>
          <div>
            <Label>Academic Year</Label>
            <Select name="academicYear" value={form.academicYear} onChange={(e) => updateField("academicYear", e.target.value)}>
              <option value="">Select Year</option>
              {academicYearOptions.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </Select>
          </div>
        </div>

        {/* details and upload */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-gray-200">
          <div className="space-y-6">
            <div>
              <Label>Name of Professional Society / Body</Label>
              <Input name="societyName" value={form.societyName} onChange={(e) => updateField("societyName", e.target.value)} placeholder="IEEE, ACM, ISTE..." />
            </div>
            <div>
              <Label>Grade / Level / Position</Label>
              <Input name="gradeOrPosition" value={form.gradeOrPosition} onChange={(e) => updateField("gradeOrPosition", e.target.value)} placeholder="Senior Member, Fellow, Chairperson..." />
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <Label>Proof Document</Label>
              <div onDrop={handleDrop} onDragOver={handleDragOver} onClick={() => document.getElementById("proof-input-society").click()}
                className={`flex flex-col items-center justify-center px-4 py-6 border-2 border-dashed rounded-xl cursor-pointer transition-colors text-indigo-700 ${proofFile ? "border-green-500 bg-green-50" : "border-indigo-300 bg-indigo-50/50 hover:border-indigo-400"}`}>
                <p className="mb-1 font-semibold">Drag & drop file here, or click to browse</p>
                <p className="text-sm text-indigo-500 mb-2">Accepted: PDF, JPG, PNG (Max 5MB)</p>
                <input type="file" name="proofDocument" id="proof-input-society" className="hidden" onChange={handleFileChange} accept=".pdf,.jpg,.jpeg,.png" />
                {proofFile && <p className="mt-2 text-sm text-gray-700 font-medium">✅ Selected: <span className="font-bold">{proofFile.name}</span></p>}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-6 border-t border-gray-200 mt-6">
          <p className="text-sm text-gray-500">Tip: Ensure all required fields are accurate before submission.</p>
          <div className="flex gap-3 justify-end">
            {!isMagicLink && !customSubmitHandler && (
              <button type="button" onClick={handleSaveDraft} disabled={saving || submitting} className="inline-flex items-center rounded-lg border border-gray-300 px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 transition disabled:opacity-60">{saving ? "Saving..." : "Save as Draft"}</button>
            )}
            <button type="submit" disabled={submitting || saving || !proofFile} className="inline-flex items-center rounded-lg bg-indigo-600 px-5 py-2 text-base font-semibold text-white hover:bg-indigo-700 transition shadow-lg disabled:bg-gray-400">{submitting ? "Submitting..." : "Finalize Submission"}</button>
          </div>
        </div>
      </form>
      <SubmissionResultModal {...modal} onClose={() => setModal({ ...modal, open: false })} />
    </div>
  );

  if (isMagicLink) return formContent;

  return (
    <FormLayout title="Professional Society Memberships" user={user} onBack={onBack || (() => navigate("/new-submission"))} onLogout={onLogout || (() => navigate("/"))}>
      {formContent}
    </FormLayout>
  );
};

export default ProfessionalSocietyForm;
