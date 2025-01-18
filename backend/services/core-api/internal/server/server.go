package server

import (
	"github.com/gin-gonic/gin"
	"disco/core-api/internal/config"
)

type Server struct {
	router *gin.Engine
	config *config.Config
}

func New(cfg *config.Config) *Server {
	return &Server{
		router: gin.Default(),
		config: cfg,
	}
}

func (s *Server) Start() error {
	// Add routes here
	s.router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status": "ok",
		})
	})

	return s.router.Run(":8080")
}
