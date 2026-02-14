// Package config provides environment-based configuration.
// ALL values come from environment variables. ZERO hardcoded credentials or data.
package config

import (
	"fmt"
	"os"
	"strconv"
)

// Config holds all service configuration loaded from environment variables.
type Config struct {
	// Gateway
	ListenHost string
	ListenPort int

	// Rust DB Service (Supabase proxy)
	RustDBHost string
	RustDBPort int

	// ClickHouse
	ClickHouseHost     string
	ClickHousePort     int
	ClickHouseUser     string
	ClickHousePassword string
	ClickHouseDatabase string
	ClickHouseSecure   bool

	// JWT
	JWTSecret    string
	SupabaseJWTSecret string

	// Debug
	Debug bool
}

// LoadFromEnv loads all configuration from environment variables.
// Required variables will cause a panic if missing.
func LoadFromEnv() *Config {
	c := &Config{
		ListenHost: getEnvDefault("DB_GATEWAY_HOST", "127.0.0.1"),
		ListenPort: getEnvIntDefault("DB_GATEWAY_PORT", 9090),

		RustDBHost: getEnvDefault("RUST_DB_HOST", "127.0.0.1"),
		RustDBPort: getEnvIntDefault("RUST_DB_PORT", 9091),

		ClickHouseHost:     os.Getenv("CLICKHOUSE_HOST"),
		ClickHousePort:     getEnvIntDefault("CLICKHOUSE_PORT", 8443),
		ClickHouseUser:     getEnvDefault("CLICKHOUSE_USER", "default"),
		ClickHousePassword: os.Getenv("CLICKHOUSE_PASSWORD"),
		ClickHouseDatabase: getEnvDefault("CLICKHOUSE_DATABASE", "beeyield_analytics"),
		ClickHouseSecure:   getEnvBoolDefault("CLICKHOUSE_SECURE", true),

		JWTSecret:    os.Getenv("SECRET_KEY"),
		SupabaseJWTSecret: os.Getenv("SUPABASE_JWT_SECRET"),

		Debug: getEnvBoolDefault("DEBUG", false),
	}

	return c
}

// RustDBURL returns the full base URL for the Rust DB service.
func (c *Config) RustDBURL() string {
	return fmt.Sprintf("http://%s:%d", c.RustDBHost, c.RustDBPort)
}

// GatewayAddr returns the listen address string.
func (c *Config) GatewayAddr() string {
	return fmt.Sprintf("%s:%d", c.ListenHost, c.ListenPort)
}

// ClickHouseConfigured returns true if ClickHouse host is set.
func (c *Config) ClickHouseConfigured() bool {
	return c.ClickHouseHost != ""
}

// JWTSecretKey returns the preferred JWT secret for verification.
func (c *Config) JWTSecretKey() string {
	if c.SupabaseJWTSecret != "" {
		return c.SupabaseJWTSecret
	}
	return c.JWTSecret
}

func getEnvDefault(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func getEnvIntDefault(key string, fallback int) int {
	if v := os.Getenv(key); v != "" {
		if n, err := strconv.Atoi(v); err == nil {
			return n
		}
	}
	return fallback
}

func getEnvBoolDefault(key string, fallback bool) bool {
	if v := os.Getenv(key); v != "" {
		if b, err := strconv.ParseBool(v); err == nil {
			return b
		}
	}
	return fallback
}
