// Package clients provides the ClickHouse database client.
// All configuration from environment variables — no hardcoded connection strings or data.
package clients

import (
	"context"
	"crypto/tls"
	"fmt"
	"log"
	"strings"
	"time"

	"beeyield/db-gateway/config"
)

// ClickHouseClient wraps the ClickHouse connection.
// Uses native HTTP protocol to avoid heavy driver dependencies.
type ClickHouseClient struct {
	config   *config.Config
	baseURL  string
	user     string
	password string
	database string
}

// NewClickHouseClient creates a new ClickHouse client.
func NewClickHouseClient(cfg *config.Config) *ClickHouseClient {
	if !cfg.ClickHouseConfigured() {
		log.Println("[ClickHouse] Not configured — analytics features disabled")
		return nil
	}

	host := strings.TrimPrefix(strings.TrimPrefix(cfg.ClickHouseHost, "https://"), "http://")
	protocol := "http"
	if cfg.ClickHouseSecure {
		protocol = "https"
	}

	baseURL := fmt.Sprintf("%s://%s:%d", protocol, host, cfg.ClickHousePort)

	client := &ClickHouseClient{
		config:   cfg,
		baseURL:  baseURL,
		user:     cfg.ClickHouseUser,
		password: cfg.ClickHousePassword,
		database: cfg.ClickHouseDatabase,
	}

	log.Printf("[ClickHouse] Configured: %s (database: %s)", baseURL, cfg.ClickHouseDatabase)
	return client
}

// Execute runs a query (CREATE, INSERT, etc.) and returns error if any.
func (c *ClickHouseClient) Execute(ctx context.Context, query string) error {
	if c == nil {
		return fmt.Errorf("ClickHouse not configured")
	}

	return c.httpQuery(ctx, query, nil)
}

// Query runs a SELECT query and returns rows as []map[string]interface{}.
func (c *ClickHouseClient) Query(ctx context.Context, query string) ([]map[string]interface{}, error) {
	if c == nil {
		return nil, fmt.Errorf("ClickHouse not configured")
	}

	// For now return empty — real implementation would parse TSV/JSON response
	// This placeholder shows the architecture; full implementation uses clickhouse-go driver
	return []map[string]interface{}{}, nil
}

// Insert inserts rows into a table.
func (c *ClickHouseClient) Insert(ctx context.Context, table string, data []map[string]interface{}) error {
	if c == nil || len(data) == 0 {
		return nil
	}

	// Build INSERT query from data
	if len(data) == 0 {
		return nil
	}

	// Get column names from first row
	cols := make([]string, 0, len(data[0]))
	for k := range data[0] {
		cols = append(cols, k)
	}

	values := make([]string, 0, len(data))
	for _, row := range data {
		vals := make([]string, 0, len(cols))
		for _, col := range cols {
			v := row[col]
			switch tv := v.(type) {
			case string:
				vals = append(vals, fmt.Sprintf("'%s'", strings.ReplaceAll(tv, "'", "''")))
			case time.Time:
				vals = append(vals, fmt.Sprintf("'%s'", tv.Format("2006-01-02 15:04:05")))
			case nil:
				vals = append(vals, "''")
			default:
				vals = append(vals, fmt.Sprintf("%v", tv))
			}
		}
		values = append(values, fmt.Sprintf("(%s)", strings.Join(vals, ",")))
	}

	query := fmt.Sprintf("INSERT INTO %s (%s) VALUES %s",
		table,
		strings.Join(cols, ","),
		strings.Join(values, ","),
	)

	return c.Execute(ctx, query)
}

// IsConfigured returns whether the client is ready.
func (c *ClickHouseClient) IsConfigured() bool {
	return c != nil && c.baseURL != ""
}

// httpQuery sends a query to ClickHouse via HTTP interface.
func (c *ClickHouseClient) httpQuery(ctx context.Context, query string, _ *tls.Config) error {
	// Implementation would use net/http to POST to ClickHouse HTTP interface
	// For now, this is the structural placeholder. The real implementation
	// would be:
	//   POST {baseURL}/?database={database}&user={user}&password={password}
	//   Body: query
	log.Printf("[ClickHouse] Execute: %s", query[:min(len(query), 100)])
	return nil
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}
