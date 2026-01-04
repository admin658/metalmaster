Here is the implementation plan.

### **Goal**
Add an MVP timing and grading results object to the tab player and store these results to a Supabase table after a user's performance.

### **Assumptions**
*   An interactive tab player component exists and is capable of tracking user note inputs against the song's actual notes.
*   A "performance" is defined as a user playing through a tab, and there is a distinct event that signals the end of this performance.
*   The project is already set up with the Supabase client for database interactions.
*   User authentication is in place, and the user's ID is accessible when they are logged in.
*   Environment variables for Supabase (`SUPABASE_URL`, `SUPABASE_ANON_KEY`) are configured for the web application.

### **Plan**
1.  **Create a Supabase migration for the new `performance_results` table.**
    *   **File to create:** `packages/api/supabase/migrations/<TIMESTAMP>_create_performance_results.sql`
    *   **Change:** Define a new SQL schema for a table named `performance_results`. This table will store metrics from a user's practice session. It will include columns for `id`, `user_id`, `tab_id`, `timing_data` (as JSONB to store detailed timing deviations), `grade_data` (as JSONB for metrics like accuracy), and an `overall_score` (as a floating-point number).

2.  **Update shared TypeScript types.**
    *   **File to modify:** `packages/shared-types/src/supabase.ts` (or equivalent type definition file).
    *   **Change:** After applying the database migration, regenerate the Supabase TypeScript types. This will create a new `PerformanceResult` interface that matches the schema of the `performance_results` table, ensuring type safety between the frontend and backend.

3.  **Implement frontend data collection in the tab player.**
    *   **File to modify:** `packages/web/src/components/TabPlayer/TabPlayer.tsx` (or the primary component managing the player state).
    *   **Change:**
        *   At the conclusion of a user's performance, collect the raw timing and accuracy data.
        *   Structure this data into a `timing_data` object (e.g., an array of `{ note: string, deviation: number }`) and a `grade_data` object (e.g., `{ accuracy: number, notes_hit: number, notes_missed: number }`).
        *   Calculate a simple `overall_score` based on the grade.
        *   Assemble these pieces into a single object ready to be sent to the backend.

4.  **Create a new API endpoint to handle saving the performance results.**
    *   **File to create:** `packages/web/src/pages/api/performance/save.ts`
    *   **Change:**
        *   Implement a new API route that listens for POST requests.
        *   This endpoint will receive the performance results object from the frontend.
        *   It will use the Supabase admin client to securely insert a new record into the `performance_results` table, linking it to the authenticated user.

5.  **Trigger the API call from the frontend.**
    *   **File to modify:** `packages/web/src/components/TabPlayer/TabPlayer.tsx`
    *   **Change:** After the performance data is collected and structured (from Plan Step 3), initiate an asynchronous `fetch` request to the newly created `/api/performance/save` endpoint, passing the results object in the request body.

### **Acceptance Criteria**
*   After running the migration, a `performance_results` table with the specified columns (`id`, `user_id`, `tab_id`, `timing_data`, `grade_data`, `overall_score`, `created_at`) exists in the Supabase database.
*   When a logged-in user completes a song in the tab player, a network request is successfully sent to the `/api/performance/save` endpoint.
*   A new row corresponding to the completed performance is successfully inserted into the `performance_results` table in Supabase.
*   The inserted row correctly contains the user's ID, the tab's ID, and the JSON objects for timing and grading data.
*   The API endpoint is secure and cannot be called successfully without proper user authentication.

### **Risks / Edge Cases**
*   **API Failures:** The request to save performance data could fail due to network issues. The frontend should handle this potential failure gracefully (e.g., by logging the error or notifying the user that their score was not saved).
*   **Data Volume:** For very long or dense musical pieces, the `timing_data` JSON object could become large. The API and database column type (JSONB) should be sufficient, but this is a consideration for future scalability.
*   **Security:** The API endpoint must validate the user's session to prevent unauthorized submissions. The `user_id` should be derived from the server-side session, not trusted from the client-side payload.
*   **Initial Grading Logic:** The MVP grading logic will be simplistic. The `grade_data` object should be structured flexibly to allow for the future addition of more sophisticated metrics (e.g., rhythm accuracy, streak bonuses) without requiring schema changes.

### **Commands**
```bash
# 1. Create the new migration file
npx supabase migrations new create_performance_results_table --schema api

# 2. After adding SQL to the migration file, apply it to the local database
npx supabase db push

# 3. Generate TypeScript types from the updated database schema
npx supabase gen types typescript --project-id <your-project-id> --schema public > packages/shared-types/src/supabase.ts

# 4. Run the development server to test the full flow
yarn dev
```
