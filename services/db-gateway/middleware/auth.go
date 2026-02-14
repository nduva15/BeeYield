// Package middleware provides JWT authentication middleware.
// JWT secret loaded from environment — no hardcoded keys.
package middleware

import (
	"context"
	"log"
	"net/http"
	"strings"

	"beeyield/db-gateway/config"

	"github.com/golang-jwt/jwt/v5"
)

type contextKey string

const UserClaimsKey contextKey = "user_claims"

// AuthMiddleware verifies JWT tokens from the Authorization header.
// The JWT secret is loaded from environment variables only.
func AuthMiddleware(cfg *config.Config, next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Skip auth for health endpoints
		if r.URL.Path == "/health" {
			next.ServeHTTP(w, r)
			return
		}

		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			// Allow unauthenticated requests (some DB operations are public)
			next.ServeHTTP(w, r)
			return
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		if tokenString == authHeader {
			// No "Bearer " prefix
			next.ServeHTTP(w, r)
			return
		}

		secret := cfg.JWTSecretKey()
		if secret == "" {
			// No JWT secret configured — skip verification in dev
			if cfg.Debug {
				log.Println("[Auth] No JWT secret configured — skipping verification (debug mode)")
				next.ServeHTTP(w, r)
				return
			}
			http.Error(w, `{"error":"JWT secret not configured"}`, http.StatusUnauthorized)
			return
		}

		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			return []byte(secret), nil
		}, jwt.WithValidMethods([]string{"HS256"}))

		if err != nil {
			if cfg.Debug {
				// In debug mode, extract claims without verification
				parser := jwt.NewParser(jwt.WithoutClaimsValidation())
				token, _, _ = parser.ParseUnverified(tokenString, jwt.MapClaims{})
				if token != nil {
					ctx := context.WithValue(r.Context(), UserClaimsKey, token.Claims)
					next.ServeHTTP(w, r.WithContext(ctx))
					return
				}
			}
			http.Error(w, `{"error":"invalid token"}`, http.StatusUnauthorized)
			return
		}

		if token.Valid {
			ctx := context.WithValue(r.Context(), UserClaimsKey, token.Claims)
			next.ServeHTTP(w, r.WithContext(ctx))
			return
		}

		http.Error(w, `{"error":"invalid token"}`, http.StatusUnauthorized)
	})
}

// GetUserID extracts user ID from context claims.
func GetUserID(r *http.Request) string {
	claims, ok := r.Context().Value(UserClaimsKey).(jwt.MapClaims)
	if !ok {
		return ""
	}
	if sub, ok := claims["sub"].(string); ok {
		return sub
	}
	return ""
}
