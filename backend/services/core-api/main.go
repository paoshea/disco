package main

import (
    "log"
    "disco/core-api/internal/config"
    "disco/core-api/internal/server"
)

func main() {
    // Load configuration
    cfg, err := config.Load()
    if err != nil {
        log.Fatalf("Failed to load config: %v", err)
    }

    // Create and start server
    srv := server.New(cfg)
    if err := srv.Start(); err != nil {
        log.Fatalf("Failed to start server: %v", err)
    }
}