---
description: database migration for tasks and apiaries
---

To enable Tasks and accurate Acreage reporting, run the following SQL scripts:

1. Update Apiaries Table (for acres):
   - `psql ... -f backend/db/update_apiaries_schema.sql`

2. Create Tasks Table:
   - `psql ... -f backend/db/create_tasks_table.sql`

3. Sync Dashboard Data (Adds user_id and links data):
   - `psql ... -f backend/db/sync_beeyield_data.sql`

4. Verify:
   - `apiaries` table should have `size_acres` and `user_id`.
   - `tasks` and `inspections` tables should exist.
   - Seed data (Timothy Nduva) should be visible in your BeeYield Dashboard.
