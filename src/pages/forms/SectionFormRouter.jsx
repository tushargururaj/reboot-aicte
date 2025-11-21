// src/pages/forms/SectionFormRouter.jsx
import React, { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
// FIX: Corrected path for submissionsClient (now two levels up)
import { getDraftById } from "../../utils/submissionsClient"; 

// FIX: Form imports should be relative to the current directory (./)
import ProfessionalSocietyForm from "./ProfessionalSocietyForm";
import FdpResourcePersonForm from "./FdpResourcePersonForm";
import FdpParticipationForm from "./FdpParticipationForm";
import MoocCertificationForm from "./MoocCertificationForm";

// Helper for when a form is not configured
const FormNotFound = ({ sectionCode }) => (
    <div className="max-w-4xl mx-auto p-8 text-center bg-white rounded-xl shadow-lg mt-10">
        <h2 className="text-3xl font-bold text-red-600">404: Form Not Configured</h2>
        <p className="mt-2 text-gray-700">
          The section code <span className="font-mono bg-gray-100 p-1 rounded text-gray-900">{sectionCode}</span> is not currently mapped to a submission form.
        </p>
    </div>
);

const SectionFormRouter = ({ user }) => {
    const { sectionCode } = useParams();
    const [searchParams] = useSearchParams();
    
    const [draft, setDraft] = useState(null);
    const [loading, setLoading] = useState(true);

    // Read draftId from URL query parameters (e.g., ?draftId=draft-123)
    const draftId = searchParams.get('draftId'); 

    // Effect handles fetching draft data only if an ID is present in the URL
    useEffect(() => {
        setDraft(null);
        setLoading(true); 

        if (draftId) {
            // Fetch the draft using the ID
            const fetchedDraft = getDraftById(draftId);
            
            if (fetchedDraft) {
                // Ensure the draft's internal section code matches the URL
                if (fetchedDraft.sectionCode === sectionCode) {
                    setDraft(fetchedDraft);
                } else {
                    console.warn(`Draft ID ${draftId} belongs to section ${fetchedDraft.sectionCode}, not ${sectionCode}. Loading blank form.`);
                }
            } else {
                console.warn("Draft not found or expired. Loading blank form.");
            }
        }
        
        // Use a slight delay for smoother visual transition
        const timer = setTimeout(() => setLoading(false), 100); 
        return () => clearTimeout(timer);
    }, [draftId, sectionCode]); 

    // --- Component Mapping ---
    let ComponentToRender = () => <FormNotFound sectionCode={sectionCode} />;

    switch (sectionCode) {
        case "6.1.1.1":
            ComponentToRender = ProfessionalSocietyForm;
            break;
        case "6.1.2.1.1":
            ComponentToRender = FdpResourcePersonForm;
            break;
        case "6.1.2.2.1":
            ComponentToRender = FdpParticipationForm;
            break;
        case "6.1.4.1":
            ComponentToRender = MoocCertificationForm;
            break;
    }
    
    // Loading State (shows while fetching draft)
    if (loading) {
        return <div className="p-10 text-center text-xl text-slate-800">Loading Form...</div>; 
    }

    // Render the selected component, passing the draft data
    return (
        <ComponentToRender
            user={user}
            draft={draft} 
        />
    );
};

export default SectionFormRouter;