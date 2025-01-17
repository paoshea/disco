package main

import (
    "log"
    "github.com/gin-gonic/gin"
    "disco/internal/config"
    "disco/internal/server"
    "disco/internal/middleware"
)

func main() {
    // Load configuration
    cfg, err := config.Load()
    if err != nil {
        log.Fatalf("Failed to load config: %v", err)
    }

    // Initialize router
    router := gin.Default()
    
    // Setup middleware
    router.Use(middleware.Cors())
    router.Use(middleware.Authentication())
    router.Use(middleware.RateLimiter())

    // Initialize server
    srv := server.New(cfg, router)
    
    // Start server
    if err := srv.Run(); err != nil {
        log.Fatalf("Failed to start server: %v", err)
    }
}