# BeeYield Dashboard API Documentation

## Overview
The BeeYield Dashboard API provides user-specific endpoints for managing apiaries (places), hives, harvests, tasks, and inspections. All endpoints require authentication and enforce Row-Level Security (RLS) to ensure users can only access their own data or data shared with them.

## Base URL
```
http://localhost:8000/api/v1/beeyield
```

## Authentication
All endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## Endpoints

### 📍 Apiaries (Places)

#### GET /apiaries
Get all apiaries (owned + shared) for the authenticated user.

**Sharing Info:**
Included shared apiaries will have `is_shared: true` and `permission` ("view" or "edit") in the response.

**Query Parameters:**
- `status_filter` (optional): Filter by status (e.g., "active", "inactive")

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Nanyuki North Field",
    "apiary_type": "Permanent",
    "apiary_code": "APY-ABC12345",
    "location_name": "Nanyuki",
    "county": "Laikipia",
    "region": "Central",
    "latitude": -0.0167,
    "longitude": 37.0667,
    "size_acres": 5.5,
    "expected_hives": 50,
    "primary_forage": "Acacia, Sunflowers",
    "status": "active",
    "hive_count": 42,
    "created_at": "2024-01-15T10:30:00Z"
  }
]
```

#### GET /apiaries/{apiary_id}
Get a specific apiary by ID.

**Response:**
```json
{
  "id": "uuid",
  "name": "Nanyuki North Field",
  "apiary_type": "Permanent",
  "hive_count": 42,
  "hives": [
    {
      "id": "uuid",
      "hive_code": "H-001",
      "type": "Langstroth",
      "status": "Active & Healthy"
    }
  ]
}
```

#### POST /apiaries
Create a new apiary.

**Request Body:**
```json
{
  "name": "Nanyuki North Field",
  "apiary_type": "Permanent",
  "location_name": "Nanyuki",
  "county": "Laikipia",
  "region": "Central",
  "latitude": -0.0167,
  "longitude": 37.0667,
  "size_acres": 5.5,
  "expected_hives": 50,
  "primary_forage": "Acacia, Sunflowers",
  "notes": "Near water source"
}
```

**Response:** 201 Created
```json
{
  "id": "uuid",
  "name": "Nanyuki North Field",
  "apiary_code": "APY-ABC12345",
  "user_id": "uuid",
  "created_at": "2024-01-15T10:30:00Z"
}
```

#### PUT /apiaries/{apiary_id}
Update an existing apiary.

**Request Body:** (all fields optional)
```json
{
  "name": "Updated Name",
  "status": "inactive",
  "size_acres": 6.0
}
```

#### DELETE /apiaries/{apiary_id}
Soft delete an apiary (sets status to "inactive").

**Response:** 204 No Content

---

### 🐝 Hives

#### GET /hives
Get all hives for the authenticated user.

**Query Parameters:**
- `apiary_id` (optional): Filter by apiary
- `status_filter` (optional): Filter by status

**Response:**
```json
[
  {
    "id": "uuid",
    "hive_code": "H-001",
    "apiary_id": "uuid",
    "apiary_name": "Nanyuki North Field",
    "type": "Langstroth",
    "status": "Active & Healthy",
    "health_status": "Good",
    "installation_date": "2024-01-01",
    "last_inspection_date": "2024-02-01",
    "notes": "Strong colony"
  }
]
```

#### GET /hives/{hive_id}
Get a specific hive by ID.

#### POST /hives
Create a new hive.

**Request Body:**
```json
{
  "hive_code": "H-042",
  "apiary_id": "uuid",
  "type": "Langstroth",
  "status": "Active & Healthy",
  "installation_date": "2024-01-15",
  "health_status": "Good",
  "notes": "New installation"
}
```

**Hive Types:**
- Langstroth
- KTBH (Kenyan Top Bar Hive)
- Traditional Log

**Status Options:**
- Active & Healthy
- Weak Colony
- Abandoned
- Recently Harvested

#### PUT /hives/{hive_id}
Update an existing hive.

#### DELETE /hives/{hive_id}
Delete a hive.

**Response:** 204 No Content

---

### 🍯 Harvests

#### GET /harvests
Get all harvests for the authenticated user.

**Query Parameters:**
- `apiary_id` (optional): Filter by apiary
- `hive_id` (optional): Filter by hive
- `year` (optional): Filter by year (e.g., 2024)

**Response:**
```json
[
  {
    "id": "uuid",
    "harvest_code": "HRV-XYZ12345",
    "hive_id": "uuid",
    "hive_code": "H-001",
    "apiary_id": "uuid",
    "apiary_name": "Nanyuki North Field",
    "harvest_date": "2024-02-01",
    "quantity_kg": 25.5,
    "honey_type": "Acacia",
    "moisture_content": 17.5,
    "color_grade": "Light Amber",
    "is_verified": true,
    "notes": "Excellent quality"
  }
]
```

#### POST /harvests
Create a new harvest record.

**Request Body:**
```json
{
  "hive_id": "uuid",
  "apiary_id": "uuid",
  "harvest_date": "2024-02-01",
  "quantity_kg": 25.5,
  "honey_type": "Acacia",
  "moisture_content": 17.5,
  "color_grade": "Light Amber",
  "is_verified": false,
  "notes": "Excellent quality"
}
```

**Honey Types:**
- Acacia
- Multi-flower
- Forest
- Rapeseed
- Sunflower

**Color Grades:**
- Water White
- Extra White
- Extra Light Amber
- Light Amber
- Dark Amber

#### PUT /harvests/{harvest_id}
Update an existing harvest.

#### DELETE /harvests/{harvest_id}
Delete a harvest record.

---

### ✅ Tasks

#### GET /tasks
Get all tasks for the authenticated user.

**Query Parameters:**
- `status_filter` (optional): Filter by status (pending, in_progress, completed)
- `apiary_id` (optional): Filter by apiary

**Response:**
```json
[
  {
    "id": "uuid",
    "title": "Inspect Hive H-001",
    "description": "Check for queen and brood pattern",
    "status": "pending",
    "priority": "high",
    "category": "Inspection",
    "due_date": "2024-02-15T10:00:00Z",
    "apiary_id": "uuid",
    "apiary_name": "Nanyuki North Field",
    "hive_id": "uuid",
    "hive_code": "H-001",
    "is_completed": false,
    "created_at": "2024-02-01T10:00:00Z"
  }
]
```

#### POST /tasks
Create a new task.

**Request Body:**
```json
{
  "title": "Inspect Hive H-001",
  "description": "Check for queen and brood pattern",
  "status": "pending",
  "priority": "high",
  "category": "Inspection",
  "due_date": "2024-02-15T10:00:00Z",
  "apiary_id": "uuid",
  "hive_id": "uuid"
}
```

**Status Options:**
- pending
- in_progress
- completed

**Priority Options:**
- low
- medium
- high

**Category Options:**
- Inspection
- Feeding
- Harvest
- General

#### PUT /tasks/{task_id}
Update an existing task.

#### DELETE /tasks/{task_id}
Delete a task.

---

### 🔍 Inspections

#### GET /inspections
Get all inspections for the authenticated user.

**Query Parameters:**
- `apiary_id` (optional): Filter by apiary
- `hive_id` (optional): Filter by hive

**Response:**
```json
[
  {
    "id": "uuid",
    "apiary_id": "uuid",
    "apiary_name": "Nanyuki North Field",
    "hive_id": "uuid",
    "hive_code": "H-001",
    "inspection_date": "2024-02-01",
    "queen_seen": true,
    "eggs_seen": true,
    "larvae_seen": true,
    "capped_brood": true,
    "brood_pattern": "Good",
    "bee_activity": "High",
    "weather": "Sunny",
    "weight": 45.5,
    "queen_cells": false,
    "diagnosis": "Healthy colony",
    "treatment": null,
    "notes": "Strong colony, good brood pattern",
    "created_at": "2024-02-01T14:30:00Z"
  }
]
```

#### POST /inspections
Create a new inspection record.

**Request Body:**
```json
{
  "apiary_id": "uuid",
  "hive_id": "uuid",
  "inspection_date": "2024-02-01",
  "queen_seen": true,
  "eggs_seen": true,
  "larvae_seen": true,
  "capped_brood": true,
  "brood_pattern": "Good",
  "bee_activity": "High",
  "weather": "Sunny",
  "weight": 45.5,
  "queen_cells": false,
  "diagnosis": "Healthy colony",
  "notes": "Strong colony, good brood pattern"
}
```

#### PUT /inspections/{inspection_id}
Update an existing inspection.

#### DELETE /inspections/{inspection_id}
Delete an inspection record.

---

### 🤝 Sharing

#### GET /apiaries/{apiary_id}/shares
Get all users an apiary is shared with. (Owner only)

**Response:**
```json
[
  {
    "id": "uuid",
    "apiary_id": "uuid",
    "shared_with_user_id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "permission": "edit",
    "created_at": "2024-02-01T10:00:00Z"
  }
]
```

#### POST /apiaries/{apiary_id}/share
Share an apiary with another user. (Owner only)

**Request Body:**
```json
{
  "email": "user@example.com",
  "permission": "view"
}
```

**Permission Options:**
- `view`: Read-only access to apiary, hives, harvests, tasks, and inspections.
- `edit`: Can create, update, and delete hives, harvests, tasks, and inspections within the apiary.

#### DELETE /apiaries/{apiary_id}/share/{target_user_id}
Remove a user's access to an apiary. (Owner only)

---

### 📊 Dashboard Stats

#### GET /stats
Get dashboard statistics for the authenticated user (aggregates owned + shared data).

**Response:**
```json
{
  "total_apiaries": 5,
  "total_hives": 42,
  "active_hives": 38,
  "total_harvests": 156,
  "total_honey_kg": 3842.5,
  "total_acres": 27.5,
  "total_tasks": 12,
  "pending_tasks": 5,
  "active_apiaries": 5
}
```

---

## Error Responses

All endpoints may return the following error responses:

### 401 Unauthorized
```json
{
  "detail": "Not authenticated"
}
```

### 403 Forbidden
```json
{
  "detail": "User ID not found in token"
}
```

### 404 Not Found
```json
{
  "detail": "Apiary not found"
}
```

### 500 Internal Server Error
```json
{
  "detail": "Failed to create apiary: <error message>"
}
```

---

## Security Features

### Row-Level Security (RLS)
All data is protected by PostgreSQL Row-Level Security policies. Users can:
- View their own data
- View data shared with them
- Create data linked to their user ID or shared apiaries (if edit permission)
- Update their own data or data in shared apiaries (if edit permission)
- Delete their own data or data in shared apiaries (if edit permission - note: apiaries use soft delete)

### Sharing Logic
When an apiary is shared, the permission level ("view" or "edit") determines the access of the recipient to all related records (Hives, Harvests, Tasks, Inspections).

### Admin Access
Users with `admin` or `superadmin` roles can view all data across all users, but regular users are restricted to their own data.

### Data Validation
All input is validated using Pydantic schemas to ensure data integrity.

---

## Database Migration

To enable user-specific data access, run the migration script:

```bash
psql -h <your-db-host> -U <your-db-user> -d <your-db-name> -f backend/db/migrate_user_specific_data.sql
psql -h <your-db-host> -U <your-db-user> -d <your-db-name> -f backend/db/migrate_sharing_features.sql
```

This will:
1. Add `user_id` columns to all relevant tables
2. Create necessary indexes for performance
3. Enable Row-Level Security
4. Create RLS policies for user-specific access
5. Add admin override policies

---

## Frontend Integration

### Authentication
Use Supabase Auth to get a JWT token:

```typescript
const { data: { session } } = await supabase.auth.getSession();
const token = session?.access_token;
```

### API Calls
Include the token in all API requests:

```typescript
const response = await fetch('http://localhost:8000/api/v1/beeyield/apiaries', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

### Example: Create Apiary
```typescript
const createApiary = async (apiaryData) => {
  const { data: { session } } = await supabase.auth.getSession();
  
  const response = await fetch('http://localhost:8000/api/v1/beeyield/apiaries', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(apiaryData)
  });
  
  return await response.json();
};
```

---

## Testing

### Using cURL

```bash
# Get all apiaries
curl -X GET "http://localhost:8000/api/v1/beeyield/apiaries" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Create a new apiary
curl -X POST "http://localhost:8000/api/v1/beeyield/apiaries" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Apiary",
    "apiary_type": "Permanent",
    "county": "Laikipia",
    "size_acres": 5.0
  }'
```

### Using Swagger UI
Navigate to `http://localhost:8000/docs` to access the interactive API documentation and test endpoints directly.

---

## Best Practices

1. **Always authenticate**: All endpoints require a valid JWT token
2. **Validate input**: Use the provided schemas for data validation
3. **Handle errors**: Check response status codes and handle errors appropriately
4. **Use filters**: Leverage query parameters to filter data efficiently
5. **Batch operations**: When fetching related data, use the enriched responses to minimize API calls
6. **Soft deletes**: Apiaries use soft deletes (status = "inactive") to preserve data integrity

---

## Support

For issues or questions:
- Email: timothy.mathuva@strathmore.edu
- GitHub: [BeeYield Repository](https://github.com/nduva15/BeeYield)
