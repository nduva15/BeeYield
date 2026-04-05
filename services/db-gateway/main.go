// BeeYield Database Gateway — Go service.
// Routes Supabase CRUD requests to the Rust service.
// Routes Supabase CRUD requests to the Rust service.
// ALL configuration from environment variables. ZERO hardcoded data.
package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"

	"beeyield/db-gateway/config"
	"beeyield/db-gateway/handlers"
	"beeyield/db-gateway/middleware"
)

func main() {
	// Load .env files if present
	loadDotEnv()

	cfg := config.LoadFromEnv()
	gw := handlers.NewGateway(cfg)

	mux := http.NewServeMux()

	// ===== Supabase CRUD (proxied to Rust) =====
	mux.HandleFunc("POST /db/insert", gw.ProxyInsert)
	mux.HandleFunc("POST /db/select", gw.ProxySelect)
	mux.HandleFunc("PATCH /db/update", gw.ProxyUpdate)
	mux.HandleFunc("DELETE /db/delete", gw.ProxyDelete)
	mux.HandleFunc("POST /db/upsert", gw.ProxyUpsert)
	mux.HandleFunc("POST /db/get-by-id", gw.ProxyGetByID)
	mux.HandleFunc("POST /ai/route", gw.ProxyAIRoute)
	mux.HandleFunc("POST /ai/tokenize", gw.ProxyAITokenize)

	// ===== Kaggle Remote Inference =====
	mux.HandleFunc("POST /inference/kaggle/trigger", gw.TriggerKaggleInference)
	mux.HandleFunc("GET /inference/kaggle/status/", gw.GetKaggleInferenceStatus)

	// ===== Health =====
	mux.HandleFunc("GET /health", gw.HealthCheck)

	// Wrap with auth middleware
	handler := middleware.AuthMiddleware(cfg, mux)

	// Add CORS
	handler = corsMiddleware(handler)

	addr := cfg.GatewayAddr()
	log.Printf("🚀 BeeYield DB Gateway starting on %s", addr)
	log.Printf("   Rust DB Service: %s", cfg.RustDBURL())

	if err := http.ListenAndServe(addr, handler); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}

// corsMiddleware adds CORS headers to all responses.
func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

// loadDotEnv tries to load .env files from common locations.
func loadDotEnv() {
	paths := []string{
		".env",
		"../../.env",
		"../../backend/.env",
	}

	// Also try relative to executable
	if exe, err := os.Executable(); err == nil {
		dir := filepath.Dir(exe)
		paths = append(paths,
			filepath.Join(dir, ".env"),
			filepath.Join(dir, "..", "..", ".env"),
			filepath.Join(dir, "..", "..", "backend", ".env"),
		)
	}

	for _, p := range paths {
		if data, err := os.ReadFile(p); err == nil {
			lines := splitLines(string(data))
			for _, line := range lines {
				line = trimSpace(line)
				if line == "" || line[0] == '#' {
					continue
				}
				if idx := indexOf(line, '='); idx > 0 {
					key := trimSpace(line[:idx])
					val := trimSpace(line[idx+1:])
					// Don't overwrite existing env vars
					if os.Getenv(key) == "" {
						os.Setenv(key, val)
					}
				}
			}
			log.Printf("Loaded env from: %s", p)
			break
		}
	}
}

func splitLines(s string) []string {
	var lines []string
	start := 0
	for i := 0; i < len(s); i++ {
		if s[i] == '\n' {
			line := s[start:i]
			if len(line) > 0 && line[len(line)-1] == '\r' {
				line = line[:len(line)-1]
			}
			lines = append(lines, line)
			start = i + 1
		}
	}
	if start < len(s) {
		lines = append(lines, s[start:])
	}
	return lines
}

func trimSpace(s string) string {
	for len(s) > 0 && (s[0] == ' ' || s[0] == '\t') {
		s = s[1:]
	}
	for len(s) > 0 && (s[len(s)-1] == ' ' || s[len(s)-1] == '\t' || s[len(s)-1] == '\r') {
		s = s[:len(s)-1]
	}
	return s
}

func indexOf(s string, c byte) int {
	for i := 0; i < len(s); i++ {
		if s[i] == c {
			return i
		}
	}
	return -1
}

func init() {
	fmt.Println("BeeYield DB Gateway v1.0.0")
}
