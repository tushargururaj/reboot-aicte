# AICTE Faculty Submission Portal - Project Documentation

## 1. Project Overview
The **AICTE Faculty Submission Portal** is a web application designed to streamline the process of faculty members submitting their professional achievements, contributions, and activity reports for NBA/NAAC accreditation purposes (specifically aligned with SAR Section 6).

The system allows faculty to:
- Manually fill out detailed forms for various contribution types (Memberships, FDPs, MOOCs, etc.).
- **[NEW] AI Smart Upload**: Upload raw documents (PDFs/Images) and have an AI agent automatically extract data, identify the category, and fill the form.
- Manage drafts and view past submissions.

Admins can:
- View reports across all faculty.
- Download proof documents.
- Manage faculty accounts.

---

## 2. Technology Stack

### Frontend
- **Framework**: React.js (Vite)
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **State Management**: React Hooks (useState, useEffect, useContext)
- **HTTP Client**: Native `fetch` API

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **File Handling**: Multer (Disk storage)

### AI & Processing
- **LLM**: Google Gemini (`gemini-1.5-pro`)
- **OCR (Images)**: Tesseract.js
- **PDF Parsing**: `pdf-parse`
- **Prompt Engineering**: Custom context-aware prompts for data extraction and classification.

---

## 3. System Architecture

### Database Schema (Key Tables)
Based on the application logic, the PostgreSQL database contains the following key tables:

1.  **`users`**: Stores faculty and admin credentials.
    -   `id`, `name`, `email`, `password`, `role` ('faculty' | 'admin')
2.  **`prof_memberships`** (Section 6.1.1.1):
    -   `faculty_id`, `academic_year`, `society_name`, `grade_level`, `brief_description`, `proof_document`
3.  **`resource_person`** (Section 6.1.2.1.1):
    -   `faculty_id`, `academic_year`, `role`, `event_name`, `date`, `organizer`, `location`, `proof_document`
4.  **`fdp`** (Section 6.1.2.2.1):
    -   `faculty_id`, `academic_year`, `program_name`, `duration_days`, `certificate_number`, `proof_document`
5.  **`mooc_course`** (Section 6.1.4.1):
    -   `faculty_id`, `academic_year`, `course_name`, `grade_obtained`, `offering_institute`, `proof_document`

### Folder Structure
```
reboot-aicte/
├── server/
│   ├── config/         # DB connection
│   ├── controllers/    # Logic (e.g., aiController.js)
│   ├── middleware/     # Auth middleware
│   ├── routes/         # API Routes (auth, submission, admin, ai)
│   ├── uploads/        # Stored proof documents
│   └── index.js        # Entry point
├── src/
│   ├── components/     # Reusable UI (Header, Sidebar)
│   ├── pages/          # Page views (NewSubmission, Dashboard, AiUpload)
│   ├── utils/          # Helpers (submissionsClient.js)
│   └── App.jsx         # Frontend Routing
```

---

## 4. Key Features & Modules

### A. Authentication
- Secure login for Faculty and Admins.
- Role-based access control (RBAC) protecting routes.

### B. Manual Submission
- **Dynamic Forms**: Users select a category (e.g., "Professional Society Memberships").
- **Draft System**: Work can be saved as a draft before final submission.
- **File Upload**: Proof documents are uploaded and linked to the record.

### C. AI Smart Upload (Intelligent Document Processing)
This is the core innovation of the platform.
1.  **Upload**: User uploads a file (PDF or Image).
2.  **Text Extraction**:
    -   **PDFs**: Processed using `pdf-parse` to extract raw text.
    -   **Images**: Processed using `tesseract.js` for Optical Character Recognition (OCR).
3.  **AI Analysis (Gemini 1.5 Pro)**:
    -   **Classification**: The AI analyzes the text to determine which SAR table it belongs to (e.g., is this a certificate for an FDP or a membership card?).
    -   **Extraction**: Extracts specific fields (Dates, Names, Roles) based on the schema of the identified table.
    -   **Inference**: Calculates "Academic Year" and generates a "Description" if missing.
4.  **Interactive Chat**:
    -   Users can chat with the AI to refine the extracted data (e.g., "Change the date to 12th Aug").
    -   The AI updates the JSON payload in real-time.
5.  **Submission**: The final validated data is submitted to the database.

### D. Admin Dashboard
- **Faculty List**: View all registered faculty.
- **Reports**: View aggregated data for specific criteria (e.g., "All FDPs in 2023-24").
- **Download**: Direct access to proof documents.
- **Management**: Ability to delete faculty accounts.

---

## 5. API Reference

### Authentication
- `POST /auth/login`: Authenticate user and return JWT.
- `POST /auth/register`: Register new user.

### Submissions (`/submissions`)
- `GET /mysubmissions`: Get all submissions for logged-in user.
- `POST /submit`: Create a new submission (Multipart form data).
- `DELETE /:code/:id`: Delete a specific submission.

### AI (`/ai`)
- `POST /process`: Upload document -> Extract Text -> Analyze with Gemini.
- `POST /chat`: Send message + Context -> Get updated data JSON.

### Admin (`/admin`)
- `GET /all-faculty`: List all faculty.
- `DELETE /faculty/:id`: Delete a faculty member.
- `GET /download`: Download a specific file.
- `GET /:sectionCode`: Get report for a specific section (e.g., 6.1.1.1).

---

## 6. AI Implementation Details

The AI logic is encapsulated in `server/controllers/aiController.js`.

**Prompt Strategy**:
The system uses a "System Prompt" that defines:
1.  **Role**: "Expert document analyst".
2.  **Context**: The JSON schemas of all available tables.
3.  **Rules**:
    -   *Classification*: Keywords to map text to Table Codes.
    -   *Cleaning*: Date standardization (YYYY-MM-DD).
    -   *Inference*: Logic to derive Academic Year.
4.  **Output**: Strictly formatted JSON.

**Model**: `gemini-1.5-pro` is used for its superior reasoning capabilities in handling unstructured document text compared to smaller models.

---

## 7. Setup Instructions

1.  **Prerequisites**: Node.js, PostgreSQL.
2.  **Database**: Import the schema (tables defined in Section 3).
3.  **Environment Variables** (`server/.env`):
    ```
    DB_USER=...
    DB_PASS=...
    DB_HOST=...
    DB_NAME=...
    JWT_SECRET=...
    GEMINI_API_KEY=...
    ```
4.  **Install Dependencies**:
    -   Server: `cd server && npm install`
    -   Client: `npm install`
5.  **Run**:
    -   Server: `cd server && npm start` (Runs on port 3000)
    -   Client: `npm run dev` (Runs on port 5173)
