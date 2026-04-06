use actix_files::NamedFile;
use actix_web::{web, HttpRequest, HttpResponse, Result};
use base64::engine::general_purpose::URL_SAFE_NO_PAD;
use base64::Engine;
use chrono::Utc;
use printpdf::{BuiltinFont, Mm, PdfDocument};
use rust_xlsxwriter::Workbook;
use serde::Deserialize;
use serde_json::{json, Map, Value};
use std::collections::{HashMap, HashSet};
use std::fs::{self, File};
use std::io::BufWriter;
use std::path::PathBuf;

use crate::handlers::AppState;
use crate::models::{
    DbDeleteRequest, DbGetByIdRequest, DbInsertRequest, DbSelectRequest, DbUpdateRequest,
    DbUpsertRequest,
};

const USER_OWNED_TABLES: &[&str] = &[
    "apiaries",
    "hives",
    "devices",
    "harvests",
    "notes",
    "requests",
    "tasks",
    "inspections",
    "sensor_alerts",
    "generated_reports",
    "scheduled_reports",
    "user_preferences",
    "user_notification_settings",
    "global_iot_settings",
    "profiles",
];

#[derive(Debug, Deserialize)]
struct ReportGenerateRequest {
    #[serde(default, alias = "type")]
    report_type: Option<String>,
    #[serde(default)]
    file_format: Option<String>,
    #[serde(default)]
    parameters: Option<Value>,
}

pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/api/v1")
            .route(
                "/beeyield/alerts/{id}/resolve",
                web::patch().to(resolve_sensor_alert),
            )
            .route(
                "/beeyield/alerts/{id}/resolve",
                web::post().to(resolve_sensor_alert),
            )
            .route(
                "/meters/events/{id}/resolve",
                web::patch().to(resolve_meter_event),
            )
            .route(
                "/meters/events/{id}/resolve",
                web::post().to(resolve_meter_event),
            )
            .route("/iot/alerts/{id}", web::patch().to(resolve_sensor_alert))
            .route("/beeyield/readings", web::get().to(list_sensor_readings))
            .route("/iot/readings", web::get().to(list_sensor_readings))
            .route("/iot/gateways", web::get().to(list_iot_gateways))
            .route("/iot/client-hives", web::get().to(list_client_hives))
            .route(
                "/iot/devices/{device_id}/audit-logs",
                web::get().to(list_device_audit_logs),
            )
            .route(
                "/iot/devices/{device_id}/audit-logs",
                web::post().to(create_device_audit_log),
            )
            .route(
                "/meters/readings/{meter_id}",
                web::get().to(list_meter_readings_by_meter),
            )
            .route("/settings/full", web::get().to(get_full_settings))
            .route("/settings/preferences", web::put().to(update_preferences))
            .route("/settings/preferences", web::patch().to(update_preferences))
            .route(
                "/settings/notifications",
                web::get().to(get_notification_settings),
            )
            .route(
                "/settings/notifications",
                web::patch().to(update_notification_settings),
            )
            .route("/settings/iot", web::get().to(get_iot_settings))
            .route("/settings/iot", web::patch().to(update_iot_settings))
            .route("/settings/hives", web::get().to(list_hive_settings))
            .route(
                "/settings/hives/{hive_id}/thresholds",
                web::post().to(update_hive_thresholds),
            )
            .route("/reports/generate", web::post().to(generate_report))
            .route("/reports/status/{id}", web::get().to(get_report_status))
            .route(
                "/reports/download/{file_name}",
                web::get().to(download_report),
            ),
    );

    register_crud_scope(cfg, "/api/v1/beeyield/apiaries", "apiaries");
    register_crud_scope(cfg, "/api/v1/beeyield/hives", "hives");
    register_crud_scope(cfg, "/api/v1/beeyield/devices", "devices");
    register_crud_scope(cfg, "/api/v1/beeyield/harvests", "harvests");
    register_crud_scope(cfg, "/api/v1/beeyield/notes", "notes");
    register_crud_scope(cfg, "/api/v1/beeyield/requests", "requests");
    register_crud_scope(cfg, "/api/v1/beeyield/tasks", "tasks");
    register_crud_scope(cfg, "/api/v1/beeyield/alerts", "sensor_alerts");
    register_crud_scope(cfg, "/api/v1/iot/devices", "devices");
    register_crud_scope(cfg, "/api/v1/iot/alerts", "sensor_alerts");
    register_crud_scope(cfg, "/api/v1/inspections", "inspections");

    register_crud_scope(cfg, "/api/v1/meters/buildings", "meters_buildings");
    register_crud_scope(cfg, "/api/v1/meters/apartments", "meters_apartments");
    register_crud_scope(cfg, "/api/v1/meters/devices", "meters_devices");
    register_crud_scope(cfg, "/api/v1/meters/readings", "meters_readings");
    register_crud_scope(cfg, "/api/v1/meters/events", "meters_events");
    register_crud_scope(cfg, "/api/v1/meters/billing-rates", "meters_billing_rates");

    register_crud_scope(cfg, "/api/v1/reports", "generated_reports");
    register_crud_scope(cfg, "/api/v1/reports/scheduled", "scheduled_reports");
}

fn register_crud_scope(cfg: &mut web::ServiceConfig, path: &'static str, table: &'static str) {
    cfg.service(
        web::scope(path)
            .route(
                "",
                web::get().to(
                    move |state: web::Data<AppState>,
                          req: HttpRequest,
                          query: web::Query<HashMap<String, String>>| async move {
                        list_rows(state, req, table, query.into_inner()).await
                    },
                ),
            )
            .route(
                "",
                web::post().to(
                    move |state: web::Data<AppState>,
                          req: HttpRequest,
                          body: web::Json<Value>| async move {
                        create_row(state, req, table, body.into_inner()).await
                    },
                ),
            )
            .route(
                "/{id}",
                web::get().to(
                    move |state: web::Data<AppState>,
                          req: HttpRequest,
                          path: web::Path<String>| async move {
                        get_row(state, req, table, path.into_inner()).await
                    },
                ),
            )
            .route(
                "/{id}",
                web::put().to(
                    move |state: web::Data<AppState>,
                          req: HttpRequest,
                          path: web::Path<String>,
                          body: web::Json<Value>| async move {
                        update_row(state, req, table, path.into_inner(), body.into_inner()).await
                    },
                ),
            )
            .route(
                "/{id}",
                web::patch().to(
                    move |state: web::Data<AppState>,
                          req: HttpRequest,
                          path: web::Path<String>,
                          body: web::Json<Value>| async move {
                        update_row(state, req, table, path.into_inner(), body.into_inner()).await
                    },
                ),
            )
            .route(
                "/{id}",
                web::delete().to(
                    move |state: web::Data<AppState>,
                          req: HttpRequest,
                          path: web::Path<String>| async move {
                        delete_row(state, req, table, path.into_inner()).await
                    },
                ),
            ),
    );
}

fn request_token(req: &HttpRequest) -> Option<String> {
    req.headers()
        .get("Authorization")
        .and_then(|value| value.to_str().ok())
        .and_then(|header| header.strip_prefix("Bearer "))
        .map(|token| token.trim().to_string())
        .filter(|token| !token.is_empty())
}

fn request_user_id(req: &HttpRequest) -> Option<String> {
    let token = request_token(req)?;
    let payload = token.split('.').nth(1)?;
    let decoded = URL_SAFE_NO_PAD.decode(payload).ok()?;
    let value: Value = serde_json::from_slice(&decoded).ok()?;
    value
        .get("sub")
        .and_then(|v| v.as_str())
        .map(|s| s.to_string())
}

fn normalize_value(raw: &str) -> Value {
    match raw {
        "true" => Value::Bool(true),
        "false" => Value::Bool(false),
        _ => {
            if let Ok(number) = raw.parse::<i64>() {
                json!(number)
            } else if let Ok(number) = raw.parse::<f64>() {
                json!(number)
            } else {
                Value::String(raw.to_string())
            }
        }
    }
}

fn query_to_filters(query: &HashMap<String, String>) -> HashMap<String, Value> {
    let reserved: HashSet<&str> = ["limit", "order_by", "ascending"].into_iter().collect();
    query
        .iter()
        .filter(|(key, _)| !reserved.contains(key.as_str()))
        .map(|(key, value)| (key.clone(), normalize_value(value)))
        .collect()
}

fn object_or_empty(value: Value) -> Map<String, Value> {
    value.as_object().cloned().unwrap_or_default()
}

fn add_user_id(table: &str, payload: &mut Map<String, Value>, user_id: Option<String>) {
    if USER_OWNED_TABLES.contains(&table) && !payload.contains_key("user_id") {
        if let Some(user_id) = user_id {
            payload.insert("user_id".to_string(), Value::String(user_id));
        }
    }
}

fn first_row(value: Value) -> Value {
    value
        .as_array()
        .and_then(|rows| rows.first().cloned())
        .unwrap_or(value)
}

async fn list_rows(
    state: web::Data<AppState>,
    req: HttpRequest,
    table: &'static str,
    query: HashMap<String, String>,
) -> HttpResponse {
    let select_req = DbSelectRequest {
        table: table.to_string(),
        columns: Some("*".to_string()),
        filters: Some(query_to_filters(&query)).filter(|f| !f.is_empty()),
        limit: query
            .get("limit")
            .and_then(|value| value.parse::<i64>().ok())
            .or(Some(200)),
        order_by: query
            .get("order_by")
            .cloned()
            .or_else(|| Some("created_at".to_string())),
        ascending: query
            .get("ascending")
            .map(|value| value == "true")
            .or(Some(false)),
        token: request_token(&req),
    };

    HttpResponse::Ok().json(state.client.select(&select_req).await)
}

async fn get_row(
    state: web::Data<AppState>,
    req: HttpRequest,
    table: &'static str,
    id: String,
) -> HttpResponse {
    let get_req = DbGetByIdRequest {
        table: table.to_string(),
        id,
        id_column: Some("id".to_string()),
        token: request_token(&req),
    };
    HttpResponse::Ok().json(state.client.get_by_id(&get_req).await)
}

async fn create_row(
    state: web::Data<AppState>,
    req: HttpRequest,
    table: &'static str,
    value: Value,
) -> HttpResponse {
    let user_id = request_user_id(&req);
    let mut payload = object_or_empty(value);
    add_user_id(table, &mut payload, user_id);

    let insert_req = DbInsertRequest {
        table: table.to_string(),
        data: Value::Object(payload),
        token: request_token(&req),
    };

    let response = state.client.insert(&insert_req).await;
    if response.success {
        HttpResponse::Created().json(first_row(response.data.unwrap_or(Value::Null)))
    } else {
        HttpResponse::BadRequest().json(response)
    }
}

async fn update_row(
    state: web::Data<AppState>,
    req: HttpRequest,
    table: &'static str,
    id: String,
    value: Value,
) -> HttpResponse {
    let mut filters = HashMap::new();
    filters.insert("id".to_string(), Value::String(id));

    let update_req = DbUpdateRequest {
        table: table.to_string(),
        data: Value::Object(object_or_empty(value)),
        filters,
        token: request_token(&req),
    };

    let response = state.client.update(&update_req).await;
    if response.success {
        HttpResponse::Ok().json(first_row(response.data.unwrap_or(Value::Null)))
    } else {
        HttpResponse::BadRequest().json(response)
    }
}

async fn delete_row(
    state: web::Data<AppState>,
    req: HttpRequest,
    table: &'static str,
    id: String,
) -> HttpResponse {
    let mut filters = HashMap::new();
    filters.insert("id".to_string(), Value::String(id));

    let delete_req = DbDeleteRequest {
        table: table.to_string(),
        filters,
        token: request_token(&req),
    };

    let response = state.client.delete(&delete_req).await;
    if response.success {
        HttpResponse::Ok().json(json!({ "success": true }))
    } else {
        HttpResponse::BadRequest().json(response)
    }
}

async fn list_sensor_readings(
    state: web::Data<AppState>,
    req: HttpRequest,
    query: web::Query<HashMap<String, String>>,
) -> HttpResponse {
    list_rows(state, req, "sensor_readings", query.into_inner()).await
}

async fn list_meter_readings_by_meter(
    state: web::Data<AppState>,
    req: HttpRequest,
    path: web::Path<String>,
    query: web::Query<HashMap<String, String>>,
) -> HttpResponse {
    let mut filters = query_to_filters(&query);
    filters.insert("meter_id".to_string(), Value::String(path.into_inner()));
    let select_req = DbSelectRequest {
        table: "meters_readings".to_string(),
        columns: Some("*".to_string()),
        filters: Some(filters),
        limit: query
            .get("limit")
            .and_then(|v| v.parse::<i64>().ok())
            .or(Some(50)),
        order_by: Some("timestamp".to_string()),
        ascending: Some(false),
        token: request_token(&req),
    };
    HttpResponse::Ok().json(state.client.select(&select_req).await)
}

async fn list_iot_gateways(
    state: web::Data<AppState>,
    req: HttpRequest,
    query: web::Query<HashMap<String, String>>,
) -> HttpResponse {
    list_rows(state, req, "telemetry_gateways", query.into_inner()).await
}

async fn list_client_hives(
    state: web::Data<AppState>,
    req: HttpRequest,
    query: web::Query<HashMap<String, String>>,
) -> HttpResponse {
    list_rows(state, req, "client_hives", query.into_inner()).await
}

async fn list_device_audit_logs(
    state: web::Data<AppState>,
    req: HttpRequest,
    path: web::Path<String>,
    query: web::Query<HashMap<String, String>>,
) -> HttpResponse {
    let mut filters = query_to_filters(&query);
    filters.insert("device_id".to_string(), Value::String(path.into_inner()));
    let select_req = DbSelectRequest {
        table: "device_audit_logs".to_string(),
        columns: Some("*".to_string()),
        filters: Some(filters),
        limit: query
            .get("limit")
            .and_then(|v| v.parse::<i64>().ok())
            .or(Some(50)),
        order_by: Some("created_at".to_string()),
        ascending: Some(false),
        token: request_token(&req),
    };
    HttpResponse::Ok().json(state.client.select(&select_req).await)
}

async fn create_device_audit_log(
    state: web::Data<AppState>,
    req: HttpRequest,
    path: web::Path<String>,
    body: web::Json<Value>,
) -> HttpResponse {
    let user_id = request_user_id(&req);
    let mut payload = object_or_empty(body.into_inner());
    payload.insert("device_id".to_string(), Value::String(path.into_inner()));
    add_user_id("device_audit_logs", &mut payload, user_id);

    let insert_req = DbInsertRequest {
        table: "device_audit_logs".to_string(),
        data: Value::Object(payload),
        token: request_token(&req),
    };

    let response = state.client.insert(&insert_req).await;
    if response.success {
        HttpResponse::Created().json(first_row(response.data.unwrap_or(Value::Null)))
    } else {
        HttpResponse::BadRequest().json(response)
    }
}

async fn resolve_sensor_alert(
    state: web::Data<AppState>,
    req: HttpRequest,
    path: web::Path<String>,
) -> HttpResponse {
    let mut filters = HashMap::new();
    filters.insert("id".to_string(), Value::String(path.into_inner()));
    let update_req = DbUpdateRequest {
        table: "sensor_alerts".to_string(),
        data: json!({
            "resolved": true,
            "resolved_at": Utc::now().to_rfc3339(),
        }),
        filters,
        token: request_token(&req),
    };

    let response = state.client.update(&update_req).await;
    if response.success {
        HttpResponse::Ok().json(first_row(response.data.unwrap_or(Value::Null)))
    } else {
        HttpResponse::BadRequest().json(response)
    }
}

async fn resolve_meter_event(
    state: web::Data<AppState>,
    req: HttpRequest,
    path: web::Path<String>,
) -> HttpResponse {
    let mut filters = HashMap::new();
    filters.insert("id".to_string(), Value::String(path.into_inner()));
    let update_req = DbUpdateRequest {
        table: "meters_events".to_string(),
        data: json!({
            "is_resolved": true,
            "resolved_at": Utc::now().to_rfc3339(),
        }),
        filters,
        token: request_token(&req),
    };

    let response = state.client.update(&update_req).await;
    if response.success {
        HttpResponse::Ok().json(first_row(response.data.unwrap_or(Value::Null)))
    } else {
        HttpResponse::BadRequest().json(response)
    }
}

async fn get_full_settings(state: web::Data<AppState>, req: HttpRequest) -> HttpResponse {
    let token = request_token(&req);
    let user_id = request_user_id(&req);

    let preferences =
        load_single_user_row(&state, "user_preferences", token.clone(), user_id.clone()).await;
    let thresholds =
        load_single_user_row(&state, "alert_thresholds", token.clone(), user_id.clone()).await;
    let notifications = load_single_user_row(
        &state,
        "user_notification_settings",
        token.clone(),
        user_id.clone(),
    )
    .await;
    let iot = load_single_user_row(&state, "global_iot_settings", token, user_id.clone()).await;

    HttpResponse::Ok().json(json!({
        "profile": { "user_id": user_id },
        "preferences": preferences.unwrap_or_else(default_preferences),
        "global_thresholds": thresholds.unwrap_or_else(default_thresholds),
        "notification_settings": notifications.unwrap_or_else(default_notification_settings),
        "iot_settings": iot.unwrap_or_else(default_iot_settings),
    }))
}

async fn get_notification_settings(state: web::Data<AppState>, req: HttpRequest) -> HttpResponse {
    let row = load_single_user_row(
        &state,
        "user_notification_settings",
        request_token(&req),
        request_user_id(&req),
    )
    .await
    .unwrap_or_else(default_notification_settings);
    HttpResponse::Ok().json(row)
}

async fn update_notification_settings(
    state: web::Data<AppState>,
    req: HttpRequest,
    body: web::Json<Value>,
) -> HttpResponse {
    upsert_user_table_row(
        state,
        req,
        "user_notification_settings",
        body.into_inner(),
        default_notification_settings(),
    )
    .await
}

async fn get_iot_settings(state: web::Data<AppState>, req: HttpRequest) -> HttpResponse {
    let row = load_single_user_row(
        &state,
        "global_iot_settings",
        request_token(&req),
        request_user_id(&req),
    )
    .await
    .unwrap_or_else(default_iot_settings);
    HttpResponse::Ok().json(row)
}

async fn update_iot_settings(
    state: web::Data<AppState>,
    req: HttpRequest,
    body: web::Json<Value>,
) -> HttpResponse {
    upsert_user_table_row(
        state,
        req,
        "global_iot_settings",
        body.into_inner(),
        default_iot_settings(),
    )
    .await
}

async fn update_preferences(
    state: web::Data<AppState>,
    req: HttpRequest,
    body: web::Json<Value>,
) -> HttpResponse {
    upsert_user_table_row(
        state,
        req,
        "user_preferences",
        body.into_inner(),
        default_preferences(),
    )
    .await
}

async fn list_hive_settings(state: web::Data<AppState>, req: HttpRequest) -> HttpResponse {
    let select_req = DbSelectRequest {
        table: "hives".to_string(),
        columns: Some("id,hive_code,hive_name,temp_threshold_high,temp_threshold_low,weight_drop_threshold,updated_at,apiary_id".to_string()),
        filters: None,
        limit: Some(500),
        order_by: Some("created_at".to_string()),
        ascending: Some(false),
        token: request_token(&req),
    };
    HttpResponse::Ok().json(state.client.select(&select_req).await)
}

async fn update_hive_thresholds(
    state: web::Data<AppState>,
    req: HttpRequest,
    path: web::Path<String>,
    body: web::Json<Value>,
) -> HttpResponse {
    let hive_id = path.into_inner();
    let payload = body.into_inner();

    if hive_id == "global" {
        return upsert_user_table_row(
            state,
            req,
            "alert_thresholds",
            payload,
            default_thresholds(),
        )
        .await;
    }

    let data = json!({
        "temp_threshold_high": payload.get("temp_high").cloned().unwrap_or(Value::Null),
        "temp_threshold_low": payload.get("temp_low").cloned().unwrap_or(Value::Null),
        "weight_drop_threshold": payload.get("weight_drop").cloned().unwrap_or(Value::Null),
    });

    let mut filters = HashMap::new();
    filters.insert("id".to_string(), Value::String(hive_id));
    let update_req = DbUpdateRequest {
        table: "hives".to_string(),
        data,
        filters,
        token: request_token(&req),
    };

    let response = state.client.update(&update_req).await;
    if response.success {
        HttpResponse::Ok().json(first_row(response.data.unwrap_or(Value::Null)))
    } else {
        HttpResponse::BadRequest().json(response)
    }
}

async fn upsert_user_table_row(
    state: web::Data<AppState>,
    req: HttpRequest,
    table: &'static str,
    body: Value,
    defaults: Value,
) -> HttpResponse {
    let user_id = request_user_id(&req);
    let mut payload = object_or_empty(defaults);
    payload.extend(object_or_empty(body));
    add_user_id(table, &mut payload, user_id);

    let upsert_req = DbUpsertRequest {
        table: table.to_string(),
        data: Value::Object(payload),
        on_conflict: Some("user_id".to_string()),
        token: request_token(&req),
    };

    let response = state.client.upsert(&upsert_req).await;
    if response.success {
        HttpResponse::Ok().json(first_row(response.data.unwrap_or(Value::Null)))
    } else {
        HttpResponse::BadRequest().json(response)
    }
}

async fn load_single_user_row(
    state: &web::Data<AppState>,
    table: &'static str,
    token: Option<String>,
    user_id: Option<String>,
) -> Option<Value> {
    let filters = user_id.map(|id| HashMap::from([("user_id".to_string(), Value::String(id))]));
    let req = DbSelectRequest {
        table: table.to_string(),
        columns: Some("*".to_string()),
        filters,
        limit: Some(1),
        order_by: Some("updated_at".to_string()),
        ascending: Some(false),
        token,
    };
    let value = state.client.select(&req).await;
    value.as_array().and_then(|rows| rows.first().cloned())
}

fn default_preferences() -> Value {
    json!({
        "language": "en",
        "unit_system": "Metric",
        "theme": "System",
        "timezone": "Africa/Nairobi"
    })
}

fn default_thresholds() -> Value {
    json!({
        "temp_high": 38,
        "temp_low": 20,
        "weight_drop": 3
    })
}

fn default_notification_settings() -> Value {
    json!({
        "email_alerts_enabled": true,
        "push_notifications_enabled": true,
        "sms_alerts_enabled": false,
        "notify_on_swarm": true,
        "notify_on_theft": true,
        "notify_on_low_battery": true
    })
}

fn default_iot_settings() -> Value {
    json!({
        "temp_min_threshold": 20,
        "temp_max_threshold": 38,
        "weight_drop_alert_kg": 3,
        "humidity_min_threshold": 35,
        "humidity_max_threshold": 80
    })
}

fn reports_dir() -> PathBuf {
    let dir = std::env::current_dir()
        .unwrap_or_else(|_| PathBuf::from("."))
        .join("generated-reports");
    let _ = fs::create_dir_all(&dir);
    dir
}

async fn download_report(path: web::Path<String>) -> Result<NamedFile> {
    let file_path = reports_dir().join(path.into_inner());
    NamedFile::open_async(file_path).await.map_err(Into::into)
}

fn safe_slug(input: &str) -> String {
    input
        .chars()
        .map(|ch| {
            if ch.is_ascii_alphanumeric() {
                ch.to_ascii_lowercase()
            } else {
                '-'
            }
        })
        .collect::<String>()
        .trim_matches('-')
        .to_string()
}

async fn generate_report(
    state: web::Data<AppState>,
    req: HttpRequest,
    body: web::Json<ReportGenerateRequest>,
) -> HttpResponse {
    let user_id = request_user_id(&req);
    let report_type = body
        .report_type
        .clone()
        .unwrap_or_else(|| "full_summary".to_string());
    let file_format = body
        .file_format
        .clone()
        .unwrap_or_else(|| "PDF".to_string())
        .to_uppercase();
    let parameters = body.parameters.clone().unwrap_or_else(|| json!({}));
    let job_id = uuid::Uuid::new_v4().to_string();

    let insert_req = DbInsertRequest {
        table: "generated_reports".to_string(),
        data: json!({
            "id": job_id,
            "user_id": user_id,
            "report_type": report_type,
            "status": "processing",
            "file_format": file_format,
            "parameters": parameters,
        }),
        token: request_token(&req),
    };
    let _ = state.client.insert(&insert_req).await;

    match build_report_artifact(
        &state,
        &req,
        &job_id,
        &report_type,
        &file_format,
        &parameters,
    )
    .await
    {
        Ok((file_name, file_url)) => {
            let mut filters = HashMap::new();
            filters.insert("id".to_string(), Value::String(job_id.clone()));
            let update_req = DbUpdateRequest {
                table: "generated_reports".to_string(),
                data: json!({
                    "status": "completed",
                    "file_name": file_name,
                    "file_url": file_url,
                }),
                filters,
                token: request_token(&req),
            };
            let _ = state.client.update(&update_req).await;
            HttpResponse::Ok().json(json!({ "job_id": job_id, "status": "completed" }))
        }
        Err(error) => {
            let mut filters = HashMap::new();
            filters.insert("id".to_string(), Value::String(job_id.clone()));
            let update_req = DbUpdateRequest {
                table: "generated_reports".to_string(),
                data: json!({
                    "status": "failed",
                    "error_message": error.to_string(),
                }),
                filters,
                token: request_token(&req),
            };
            let _ = state.client.update(&update_req).await;
            HttpResponse::InternalServerError()
                .json(json!({ "job_id": job_id, "status": "failed", "detail": error.to_string() }))
        }
    }
}

async fn get_report_status(
    state: web::Data<AppState>,
    req: HttpRequest,
    path: web::Path<String>,
) -> HttpResponse {
    let get_req = DbGetByIdRequest {
        table: "generated_reports".to_string(),
        id: path.into_inner(),
        id_column: Some("id".to_string()),
        token: request_token(&req),
    };
    let row = state.client.get_by_id(&get_req).await;
    HttpResponse::Ok().json(json!({
        "job_id": row.get("id").cloned().unwrap_or(Value::Null),
        "status": row.get("status").cloned().unwrap_or_else(|| Value::String("pending".to_string())),
        "file_url": row.get("file_url").cloned().unwrap_or(Value::Null),
        "file_name": row.get("file_name").cloned().unwrap_or(Value::Null),
        "file_format": row.get("file_format").cloned().unwrap_or(Value::Null),
        "report_type": row.get("report_type").cloned().unwrap_or(Value::Null),
        "created_at": row.get("created_at").cloned().unwrap_or(Value::Null),
    }))
}

async fn build_report_artifact(
    state: &web::Data<AppState>,
    req: &HttpRequest,
    job_id: &str,
    report_type: &str,
    file_format: &str,
    parameters: &Value,
) -> std::result::Result<(String, String), Box<dyn std::error::Error>> {
    let summary = collect_report_summary(state, req, parameters).await;
    let extension = if file_format == "XLSX" { "xlsx" } else { "pdf" };
    let file_name = format!(
        "{}-{}-{}.{}",
        safe_slug(report_type),
        Utc::now().format("%Y%m%d%H%M%S"),
        &job_id[..8],
        extension
    );
    let file_path = reports_dir().join(&file_name);

    if file_format == "XLSX" {
        write_xlsx_report(&file_path, report_type, parameters, &summary)?;
    } else {
        write_pdf_report(&file_path, report_type, parameters, &summary)?;
    }

    Ok((
        file_name.clone(),
        format!("/api/v1/reports/download/{}", file_name),
    ))
}

async fn collect_report_summary(
    state: &web::Data<AppState>,
    req: &HttpRequest,
    parameters: &Value,
) -> Vec<(String, usize)> {
    let token = request_token(req);
    let mut out = Vec::new();
    let sections = parameters
        .get("sections")
        .and_then(|v| v.as_array())
        .cloned()
        .unwrap_or_else(|| {
            vec![
                Value::String("apiaries".to_string()),
                Value::String("hives".to_string()),
                Value::String("harvests".to_string()),
                Value::String("notes".to_string()),
                Value::String("my_requests".to_string()),
                Value::String("tasks".to_string()),
            ]
        });

    for section in sections {
        let (label, table) = match section.as_str().unwrap_or_default() {
            "apiaries" => ("Apiaries", "apiaries"),
            "hives" => ("Hives", "hives"),
            "notes" => ("Notes", "notes"),
            "inspections" => ("Inspections", "inspections"),
            "harvests" => ("Harvests", "harvests"),
            "my_requests" => ("Requests", "requests"),
            "tasks" => ("Tasks", "tasks"),
            _ => continue,
        };

        let req = DbSelectRequest {
            table: table.to_string(),
            columns: Some("id".to_string()),
            filters: None,
            limit: Some(500),
            order_by: None,
            ascending: None,
            token: token.clone(),
        };
        let count = state
            .client
            .select(&req)
            .await
            .as_array()
            .map(|rows| rows.len())
            .unwrap_or(0);
        out.push((label.to_string(), count));
    }

    out
}

fn write_pdf_report(
    path: &PathBuf,
    report_type: &str,
    parameters: &Value,
    summary: &[(String, usize)],
) -> std::result::Result<(), Box<dyn std::error::Error>> {
    let (doc, page, layer) = PdfDocument::new("BeeYield Report", Mm(210.0), Mm(297.0), "Layer 1");
    let current_layer = doc.get_page(page).get_layer(layer);
    let font = doc.add_builtin_font(BuiltinFont::Helvetica)?;

    current_layer.use_text("BeeYield Report", 20.0, Mm(20.0), Mm(280.0), &font);
    current_layer.use_text(
        format!("Type: {}", report_type),
        12.0,
        Mm(20.0),
        Mm(268.0),
        &font,
    );
    current_layer.use_text(
        format!("Generated: {}", Utc::now().to_rfc3339()),
        10.0,
        Mm(20.0),
        Mm(260.0),
        &font,
    );
    let scope_days = parameters
        .get("scope_days")
        .and_then(|value| value.as_i64())
        .unwrap_or(30);
    current_layer.use_text(
        format!("Scope: last {} days", scope_days),
        10.0,
        Mm(20.0),
        Mm(252.0),
        &font,
    );

    let mut y = 238.0;
    current_layer.use_text("Summary", 14.0, Mm(20.0), Mm(y), &font);
    y -= 10.0;

    for (label, count) in summary {
        current_layer.use_text(
            format!("{}: {}", label, count),
            11.0,
            Mm(24.0),
            Mm(y),
            &font,
        );
        y -= 8.0;
    }

    let mut writer = BufWriter::new(File::create(path)?);
    doc.save(&mut writer)?;
    Ok(())
}

fn write_xlsx_report(
    path: &PathBuf,
    report_type: &str,
    parameters: &Value,
    summary: &[(String, usize)],
) -> std::result::Result<(), Box<dyn std::error::Error>> {
    let mut workbook = Workbook::new();
    let worksheet = workbook.add_worksheet();

    worksheet.write_string(0, 0, "BeeYield Report")?;
    worksheet.write_string(1, 0, "Type")?;
    worksheet.write_string(1, 1, report_type)?;
    worksheet.write_string(2, 0, "Generated")?;
    worksheet.write_string(2, 1, &Utc::now().to_rfc3339())?;
    worksheet.write_string(3, 0, "Scope Days")?;
    worksheet.write_number(
        3,
        1,
        parameters
            .get("scope_days")
            .and_then(|value| value.as_f64())
            .unwrap_or(30.0),
    )?;

    worksheet.write_string(5, 0, "Section")?;
    worksheet.write_string(5, 1, "Count")?;

    for (index, (label, count)) in summary.iter().enumerate() {
        let row = 6 + index as u32;
        worksheet.write_string(row, 0, label)?;
        worksheet.write_number(row, 1, *count as f64)?;
    }

    workbook.save(path)?;
    Ok(())
}
