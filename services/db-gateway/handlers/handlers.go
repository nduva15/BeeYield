// Package handlers provides HTTP handlers for the database gateway.
// Supabase operations are proxied to the Rust service.
// ClickHouse operations are handled directly in Go.
// ZERO hardcoded data — everything comes from requests or environment.
package handlers

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"time"

	"beeyield/db-gateway/clients"
	"beeyield/db-gateway/config"
)

// Gateway holds shared state for all handlers.
type Gateway struct {
	Config     *config.Config
	ClickHouse *clients.ClickHouseClient
	HTTPClient *http.Client
}

// NewGateway creates a new Gateway with all clients.
func NewGateway(cfg *config.Config) *Gateway {
	return &Gateway{
		Config:     cfg,
		ClickHouse: clients.NewClickHouseClient(cfg),
		HTTPClient: &http.Client{
			Timeout: 15 * time.Second,
		},
	}
}

// ========== SUPABASE PROXY HANDLERS ==========
// These forward requests to the Rust Supabase service.

// ProxyInsert proxies POST /db/insert to Rust service.
func (g *Gateway) ProxyInsert(w http.ResponseWriter, r *http.Request) {
	g.proxyToRust(w, r, "/db/insert", http.MethodPost)
}

// ProxySelect proxies POST /db/select to Rust service.
func (g *Gateway) ProxySelect(w http.ResponseWriter, r *http.Request) {
	g.proxyToRust(w, r, "/db/select", http.MethodPost)
}

// ProxyUpdate proxies PATCH /db/update to Rust service.
func (g *Gateway) ProxyUpdate(w http.ResponseWriter, r *http.Request) {
	g.proxyToRust(w, r, "/db/update", http.MethodPatch)
}

// ProxyDelete proxies DELETE /db/delete to Rust service.
func (g *Gateway) ProxyDelete(w http.ResponseWriter, r *http.Request) {
	g.proxyToRust(w, r, "/db/delete", http.MethodDelete)
}

// ProxyUpsert proxies POST /db/upsert to Rust service.
func (g *Gateway) ProxyUpsert(w http.ResponseWriter, r *http.Request) {
	g.proxyToRust(w, r, "/db/upsert", http.MethodPost)
}

// ProxyGetByID proxies POST /db/get-by-id to Rust service.
func (g *Gateway) ProxyGetByID(w http.ResponseWriter, r *http.Request) {
	g.proxyToRust(w, r, "/db/get-by-id", http.MethodPost)
}

// ProxyAIRoute proxies POST /ai/route to Rust service.
func (g *Gateway) ProxyAIRoute(w http.ResponseWriter, r *http.Request) {
	g.proxyToRust(w, r, "/ai/route", http.MethodPost)
}

// ProxyAITokenize proxies POST /ai/tokenize to Rust service.
func (g *Gateway) ProxyAITokenize(w http.ResponseWriter, r *http.Request) {
	g.proxyToRust(w, r, "/ai/tokenize", http.MethodPost)
}



// proxyToRust forwards a request to the Rust DB service.
func (g *Gateway) proxyToRust(w http.ResponseWriter, r *http.Request, path string, method string) {
	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, `{"success":false,"error":"failed to read request body"}`, http.StatusBadRequest)
		return
	}
	defer r.Body.Close()

	url := fmt.Sprintf("%s%s", g.Config.RustDBURL(), path)
	req, err := http.NewRequestWithContext(r.Context(), method, url, bytes.NewReader(body))
	if err != nil {
		http.Error(w, `{"success":false,"error":"failed to create proxy request"}`, http.StatusInternalServerError)
		return
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := g.HTTPClient.Do(req)
	if err != nil {
		log.Printf("[Gateway] Rust proxy error: %v", err)
		http.Error(w, fmt.Sprintf(`{"success":false,"error":"rust service unavailable: %s"}`, err), http.StatusBadGateway)
		return
	}
	defer resp.Body.Close()

	respBody, _ := io.ReadAll(resp.Body)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(resp.StatusCode)
	w.Write(respBody)
}

// ========== CLICKHOUSE HANDLERS ==========

// TrackPageView records a page view in ClickHouse.
func (g *Gateway) TrackPageView(w http.ResponseWriter, r *http.Request) {
	var data struct {
		PagePath  string `json:"page_path"`
		UserID    string `json:"user_id"`
		SessionID string `json:"session_id"`
		Referrer  string `json:"referrer"`
		UserAgent string `json:"user_agent"`
		IPCountry string `json:"ip_country"`
	}

	if err := json.NewDecoder(r.Body).Decode(&data); err != nil {
		http.Error(w, `{"success":false,"error":"invalid JSON"}`, http.StatusBadRequest)
		return
	}

	if g.ClickHouse != nil {
		row := map[string]interface{}{
			"page_path":  data.PagePath,
			"user_id":    data.UserID,
			"session_id": data.SessionID,
			"referrer":   data.Referrer,
			"user_agent": data.UserAgent,
			"ip_country": data.IPCountry,
			"created_at": time.Now(),
		}
		if err := g.ClickHouse.Insert(r.Context(), "page_views", []map[string]interface{}{row}); err != nil {
			log.Printf("[ClickHouse] page_views insert error: %v", err)
		}
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write([]byte(`{"success":true}`))
}

// TrackTraceabilityScan records a QR scan event.
func (g *Gateway) TrackTraceabilityScan(w http.ResponseWriter, r *http.Request) {
	var data struct {
		BatchCode    string `json:"batch_code"`
		ScanLocation string `json:"scan_location"`
		UserAgent    string `json:"user_agent"`
	}

	if err := json.NewDecoder(r.Body).Decode(&data); err != nil {
		http.Error(w, `{"success":false,"error":"invalid JSON"}`, http.StatusBadRequest)
		return
	}

	if g.ClickHouse != nil {
		row := map[string]interface{}{
			"batch_code":    data.BatchCode,
			"scan_location": data.ScanLocation,
			"user_agent":    data.UserAgent,
			"scanned_at":    time.Now(),
		}
		g.ClickHouse.Insert(r.Context(), "traceability_scans", []map[string]interface{}{row})
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write([]byte(`{"success":true}`))
}

// TrackOrderEvent records an order lifecycle event.
func (g *Gateway) TrackOrderEvent(w http.ResponseWriter, r *http.Request) {
	var data struct {
		OrderID    string  `json:"order_id"`
		EventType  string  `json:"event_type"`
		OrderTotal float64 `json:"order_total"`
		Currency   string  `json:"currency"`
	}

	if err := json.NewDecoder(r.Body).Decode(&data); err != nil {
		http.Error(w, `{"success":false,"error":"invalid JSON"}`, http.StatusBadRequest)
		return
	}

	if data.Currency == "" {
		data.Currency = "KES"
	}

	if g.ClickHouse != nil {
		row := map[string]interface{}{
			"order_id":    data.OrderID,
			"event_type":  data.EventType,
			"order_total": data.OrderTotal,
			"currency":    data.Currency,
			"event_at":    time.Now(),
		}
		g.ClickHouse.Insert(r.Context(), "order_events", []map[string]interface{}{row})
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write([]byte(`{"success":true}`))
}

// GetAnalyticsSummary returns analytics data from ClickHouse.
func (g *Gateway) GetAnalyticsSummary(w http.ResponseWriter, r *http.Request) {
	days := r.URL.Query().Get("days")
	if days == "" {
		days = "30"
	}

	result := map[string]interface{}{
		"page_views":         0,
		"unique_sessions":    0,
		"traceability_scans": 0,
	}

	if g.ClickHouse != nil && g.ClickHouse.IsConfigured() {
		ctx := context.Background()
		query := fmt.Sprintf(`
			SELECT
				countIf(created_at >= now() - INTERVAL %s DAY) as page_views,
				uniqIf(session_id, created_at >= now() - INTERVAL %s DAY) as unique_sessions
			FROM page_views
		`, days, days)

		rows, err := g.ClickHouse.Query(ctx, query)
		if err == nil && len(rows) > 0 {
			if pv, ok := rows[0]["page_views"]; ok {
				result["page_views"] = pv
			}
			if us, ok := rows[0]["unique_sessions"]; ok {
				result["unique_sessions"] = us
			}
		}

		scansQuery := fmt.Sprintf(`
			SELECT count() as total_scans
			FROM traceability_scans
			WHERE scanned_at >= now() - INTERVAL %s DAY
		`, days)

		scansRows, err := g.ClickHouse.Query(ctx, scansQuery)
		if err == nil && len(scansRows) > 0 {
			if ts, ok := scansRows[0]["total_scans"]; ok {
				result["traceability_scans"] = ts
			}
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}

// InitClickHouseTables creates the analytics tables if they don't exist.
func (g *Gateway) InitClickHouseTables(w http.ResponseWriter, r *http.Request) {
	if g.ClickHouse == nil {
		http.Error(w, `{"success":false,"error":"ClickHouse not configured"}`, http.StatusServiceUnavailable)
		return
	}

	ctx := r.Context()

	tables := []string{
		`CREATE TABLE IF NOT EXISTS page_views (
			page_path String,
			user_id String,
			session_id String,
			referrer String,
			user_agent String,
			ip_country String,
			created_at DateTime DEFAULT now()
		) ENGINE = MergeTree()
		ORDER BY (created_at, page_path)`,

		`CREATE TABLE IF NOT EXISTS traceability_scans (
			batch_code String,
			scan_location String,
			user_agent String,
			scanned_at DateTime DEFAULT now()
		) ENGINE = MergeTree()
		ORDER BY (scanned_at, batch_code)`,

		`CREATE TABLE IF NOT EXISTS order_events (
			order_id String,
			event_type String,
			order_total Float64,
			currency String,
			event_at DateTime DEFAULT now()
		) ENGINE = MergeTree()
		ORDER BY (event_at, order_id)`,
	}

	for _, ddl := range tables {
		if err := g.ClickHouse.Execute(ctx, ddl); err != nil {
			log.Printf("[ClickHouse] Table creation error: %v", err)
			http.Error(w, fmt.Sprintf(`{"success":false,"error":"%s"}`, err), http.StatusInternalServerError)
			return
		}
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write([]byte(`{"success":true,"message":"ClickHouse tables initialized"}`))
}

// ========== HEALTH CHECK ==========

// HealthCheck returns the status of all connected services.
func (g *Gateway) HealthCheck(w http.ResponseWriter, r *http.Request) {
	rustStatus := "unknown"

	// Check Rust service
	resp, err := g.HTTPClient.Get(fmt.Sprintf("%s/health", g.Config.RustDBURL()))
	if err != nil {
		rustStatus = "unavailable"
	} else {
		defer resp.Body.Close()
		if resp.StatusCode == http.StatusOK {
			rustStatus = "connected"
		} else {
			rustStatus = "error"
		}
	}

	chStatus := "not configured"
	if g.ClickHouse != nil && g.ClickHouse.IsConfigured() {
		chStatus = "configured"
	}

	result := map[string]interface{}{
		"service":    "beeyield-db-gateway",
		"status":     "ok",
		"rust_db":    rustStatus,
		"clickhouse": chStatus,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}
