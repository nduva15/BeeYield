---
description: detailed instructions to set up the precision pollination database schema
---

To enable the Precision Pollination features in the backend, you need to apply the database schema.
Since we cannot execute creating new tables directly via the API, please follow these steps:

1.  **Open the SQL Schema File**
    Open `backend/db/precision_pollination_schema.sql` in your editor.

2.  **Run the SQL**
    -   **Option A: Using Supabase Dashboard**
        1.  Go to your [Supabase Dashboard](https://supabase.com/dashboard/project/ezfccfypwmuvbpujkqrg) (Project ID from your .env).
        2.  Go to the **SQL Editor**.
        3.  Copy the content of `backend/db/precision_pollination_schema.sql`.
        4.  Paste it into the editor and click **Run**.

    -   **Option B: Using CLI (if configured)**
        If you have `psql` or the Supabase CLI configured locally:
        ```bash
        psql -h db.ezfccfypwmuvbpujkqrg.supabase.co -U postgres -f backend/db/precision_pollination_schema.sql
        ```

3.  **Seed the Data (Optional)**
    Once the tables are created, you can seed sample data by running:
    ```bash
    cd backend
    ./venv/Scripts/python scripts/seed_pollination_data.py
    ```

4.  **Verify**
    The `pollination_contracts` table should exist and contain data.
