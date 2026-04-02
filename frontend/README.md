# Frontend Modernization Migration Module

An AI-powered tool for analyzing and migrating legacy frontend codebases (React, AngularJS) to modern standards. Supports file upload, folder upload, and public GitHub repository migration flows.

--

## ✨ Features

- **React Migration** — Analyze React class components, detect anti-patterns, get migration phases and timeline estimates
- **AngularJS Migration** — Analyze AngularJS codebases (controllers, services, directives, filters) and generate structured migration plans
- **JSP Migration** — Upload ZIP files of JSP projects for backend-powered analysis
- **Public GitHub Repo Migration** — Enter any public GitHub repo URL to fetch and migrate without cloning
- **AI-Powered Conversion** — Convert React class components to functional components with hooks using Gemini AI
- **Download Results** — Download all converted files as a single ZIP
- **Feedback Loop** — Validate and refine converted code via AI

---

## 🛠 Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **AI Service**: Google Gemini (`gemini-2.5-flash`)
- **State Management**: Redux Toolkit
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **ZIP Handling**: JSZip + file-saver

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Yarn or npm
- A Google Gemini API key ([get one here](https://aistudio.google.com))
- A GitHub Personal Access Token (for public repo migration)

### Installation

```bash
# Using Yarn
yarn

# Using npm
npm install
```

### Environment Setup

Create a `.env` file in the `frontend/` directory:

```env
VITE_IS_GEMINI=true
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_GITHUB_TOKEN=your_github_token_here
VITE_API_URL=your_openrouter_api_url        # optional, if not using Gemini
VITE_API_KEY=your_openrouter_api_key        # optional, if not using Gemini
VITE_AI_MODAL=your_openrouter_model         # optional, if not using Gemini
```

> **Note**: The app uses `VITE_IS_GEMINI=true` to switch between Gemini and OpenRouter. Always use `import.meta.env.VITE_GEMINI_API_KEY` — never hardcode keys.

### Run Development Server

```bash
# Using Yarn
yarn dev

# Using npm
npm run dev
```

---

## 📁 Project Structure

```
src/
├── auth/                   # Login & NotFound pages
├── components/
│   ├── analysis/           # React & Angular result sections
│   ├── conversionResultUI  # Converted code viewer + ZIP download
│   ├── TabSection          # File upload / GitHub tab UI
│   └── Navbar
├── pages/
│   ├── git/
│   │   └── repoFiles.tsx   # File selection, analysis & migration trigger
│   ├── react/              # React analysis result page
│   ├── ProjectUpload.tsx   # Framework selection + upload entry point
│   └── PublicRepoMigration.tsx  # Public GitHub URL input flow
├── services/
│   ├── aiService.ts              # Central Gemini / OpenRouter AI service
│   ├── analysisReact.ts          # React codebase analysis prompt + parser
│   ├── analysis_angular.ts       # AngularJS analysis prompt + parser
│   ├── convertReactFile.ts       # Single file class→functional conversion
│   ├── migrationConversionProcess.tsx  # Batch file conversion
│   ├── feedbackLoopService.ts    # AI validation & refinement
│   └── githubPublicRepo.service.ts     # GitHub Contents API fetcher
├── utils/
│   ├── react/
│   │   ├── parseAIResult.ts      # Parses AI text response into structured data
│   │   ├── regexPatterns.ts      # Regex patterns for AI response matching
│   │   ├── constants.ts          # Framework configs, keywords
│   │   └── githubHelpers.ts      # GitHub repo traversal
│   └── angular-parse-AI-result.ts
└── App.tsx                 # Routes configuration
```

---

## 🔄 Migration Flows

### Flow 1 — File / Folder Upload
1. Go to **Project Upload** → select framework (React / Angular / JSP)
2. Upload files, a folder, or a ZIP
3. Lands on **Repo Files** page → select files → **Start Analysis** or **Start Migration**

### Flow 2 — Public GitHub Repository
1. Go to **Public Repo Migration** → enter a GitHub repo URL
2. Files are fetched via GitHub Contents API (base64 decoded, CORS-safe)
3. Lands on the same **Repo Files** page → same analysis/migration flow

---

## 🤖 AI Service Configuration

The AI model is configured in `src/services/aiService.ts`:

```ts
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
```

**Gemini free tier limits** (per API key per day):
| Model | Free Requests/Day |
|---|---|
| gemini-2.5-flash | 20 |
| gemini-2.0-flash | 1500 |
| gemini-2.0-flash-lite | 1500 |

If you hit quota limits, either get a fresh API key or enable billing on your Google Cloud project.

---

## 📦 Build

```bash
# Using Yarn
yarn build

# Using npm
npm run build
```

---

## 🔑 Key Notes

- **File Format Duality**: Uploaded files use the browser File API `{ name, text() }`. Public repo files use `{ path, content, name }`. All services handle both formats.
- **GitHub Contents API**: Uses `/repos/{owner}/{repo}/contents/{path}` with base64 decoding — not `raw.githubusercontent.com` (blocked by CORS with auth headers).
- **Public Routes**: `/repos-files`, `/conversion-migration`, `/public-repo-migration` require no login.
- **TypeScript**: `"types": ["vite/client"]` is set in `tsconfig.app.json` to support `import.meta.env`.
