package config

import (
	"os"
)

type Config struct {
	DBHost     string
	DBPort     string
	DBName     string
	DBUser     string
	DBPassword string
	RedisURL   string
	JWTSecret  string
	Debug      bool
}

func Load() (*Config, error) {
	return &Config{
		DBHost:     getEnvOrDefault("DB_HOST", "localhost"),
		DBPort:     getEnvOrDefault("DB_PORT", "5432"),
		DBName:     getEnvOrDefault("DB_NAME", "disco_core"),
		DBUser:     getEnvOrDefault("DB_USER", "disco_user"),
		DBPassword: getEnvOrDefault("DB_PASSWORD", "disco_password"),
		RedisURL:   getEnvOrDefault("REDIS_URL", "redis://localhost:6379"),
		JWTSecret:  getEnvOrDefault("JWT_SECRET", "default-secret-key"),
		Debug:      getEnvOrDefault("DEBUG", "false") == "true",
	}, nil
}

func getEnvOrDefault(key, defaultValue string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return defaultValue
}
