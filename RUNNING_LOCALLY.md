# How to Run Skill Scout AI Locally

This application consists of four main components that need to run simultaneously for the full experience:
1.  **Frontend**: React + Vite (Port 8080)
2.  **AI Engine**: Python + FastAPI (Port 8000)
3.  **Database & Functions**: Supabase Local Stack (Port 54321)
4.  **LLM Provider**: Ollama (Port 11434)

## Prerequisites
-   **Node.js**: [Download](https://nodejs.org/)
-   **Python 3.10+**: [Download](https://www.python.org/)
-   **Docker Desktop**: [Download](https://www.docker.com/) (Required for Supabase)
-   **Supabase CLI**: `npm install -g supabase` (or via Scoop/Homebrew)
-   **Ollama**: [Download](https://ollama.com/)

---

## Step 1: Start Ollama (AI Model)
The application currently defaults to using the `phi3` model.

1.  Open **Terminal 1**.
2.  Start Ollama:
    ```powershell
    ollama serve
    ```
3.  In a strict separate terminal window, pull the required model:
    ```powershell
    ollama pull phi3
    ```
    *(Note: If you intended to use `mistral:7b-instruct-q4`, you must edit `supabase/functions/_shared/ollama-client.ts` line 19 to change the default model).*

---

## Step 2: Start Python AI Engine (Backend)
This server calculates semantic similarity for the resumes.

1.  Open **Terminal 2**.
2.  Navigate to the directory:
    ```powershell
    cd ai-engine
    ```
3.  Create a virtual environment (recommended):
    ```powershell
    python -m venv venv
    .\venv\Scripts\activate
    ```
4.  Install dependencies:
    ```powershell
    pip install -r requirements.txt
    ```
5.  Start the server:
    ```powershell
    python main.py
    ```
    *You should see: `Uvicorn running on http://0.0.0.0:8000`*

---

## Step 3: Start Supabase (Database & Edge Functions)
The Edge Functions act as the glue between the Frontend and the AI Engine.

1.  Open **Terminal 3**.
2.  Ensure **Docker Desktop** is running.
3.  Start the local Supabase stack:
    ```powershell
    supabase start
    ```
4.  **IMPORTANT**: Keep the output visible. You will see a section called **"API URLs"**.
    -   Copy the `API URL` (e.g., `http://127.0.0.1:54321`)
    -   Copy the `anon key` (a long string starting with `ey...`)

---

## Step 4: Configure Frontend
You need to point the frontend to your LOCAL Supabase instead of the remote production one.

1.  In the project root folder (`e:\backend\backend\skill-scout-ai`), create a new file named `.env.local`.
2.  Paste the values you copied from Step 3:

    ```env
    VITE_SUPABASE_PROJECT_ID="local-project"
    VITE_SUPABASE_URL="http://127.0.0.1:54321" 
    VITE_SUPABASE_PUBLISHABLE_KEY="<PASTE_YOUR_ANON_KEY_HERE>"
    ```
    *(Replace `<PASTE_YOUR_ANON_KEY_HERE>` with the real key from Terminal 3)*

---

## Step 5: Start Frontend
1.  Open **Terminal 4**.
2.  Install dependencies:
    ```powershell
    npm install
    ```
3.  Start the dev server:
    ```powershell
    npm run dev
    ```
4.  Open the URL shown (usually `http://localhost:8080`) in your browser.

## Troubleshooting
-   **"Model not found"**: Ensure you ran `ollama pull phi3`.
-   **"Connection refused (Supabase)"**: Ensure Docker is running and `supabase start` completed successfully.
-   **"SBERT Service unreachable"**: Ensure the Python window (Terminal 2) is running and shows no errors.
