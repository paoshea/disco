package handlers

import (
	"net/http"

	"disco/internal/models"
	"disco/internal/services"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// SafetyHandler handles safety-related HTTP requests
type SafetyHandler struct {
	safetyService *services.SafetyService
}

// NewSafetyHandler creates a new safety handler
func NewSafetyHandler(safetyService *services.SafetyService) *SafetyHandler {
	return &SafetyHandler{
		safetyService: safetyService,
	}
}

// RegisterRoutes registers the safety routes
func (h *SafetyHandler) RegisterRoutes(router *gin.RouterGroup) {
	safety := router.Group("/safety")
	{
		safety.POST("/report", h.createSafetyReport)
		safety.POST("/emergency", h.triggerEmergencyAlert)
		safety.POST("/block", h.blockUser)
		safety.GET("/blocks", h.getUserBlocks)
		safety.POST("/contacts", h.addEmergencyContact)
		safety.GET("/contacts", h.getEmergencyContacts)
		safety.PUT("/report/:id/status", h.updateReportStatus)
	}
}

// createSafetyReport handles the creation of a new safety report
func (h *SafetyHandler) createSafetyReport(c *gin.Context) {
	var report models.SafetyReport
	if err := c.ShouldBindJSON(&report); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get user ID from context (set by auth middleware)
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}
	report.ReporterID = userID.(uuid.UUID)

	if err := h.safetyService.CreateSafetyReport(c.Request.Context(), &report); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, report)
}

// triggerEmergencyAlert handles emergency alert creation
func (h *SafetyHandler) triggerEmergencyAlert(c *gin.Context) {
	var location models.Location
	if err := c.ShouldBindJSON(&location); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	if err := h.safetyService.TriggerEmergencyAlert(c.Request.Context(), userID.(uuid.UUID), &location); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Emergency alert triggered"})
}

// blockUser handles user blocking
func (h *SafetyHandler) blockUser(c *gin.Context) {
	var block models.UserBlock
	if err := c.ShouldBindJSON(&block); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}
	block.BlockerID = userID.(uuid.UUID)

	if err := h.safetyService.BlockUser(c.Request.Context(), &block); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, block)
}

// getUserBlocks retrieves all blocks for a user
func (h *SafetyHandler) getUserBlocks(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	blocks, err := h.safetyService.GetUserBlocks(c.Request.Context(), userID.(uuid.UUID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, blocks)
}

// addEmergencyContact handles adding a new emergency contact
func (h *SafetyHandler) addEmergencyContact(c *gin.Context) {
	var contact models.EmergencyContact
	if err := c.ShouldBindJSON(&contact); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}
	contact.UserID = userID.(uuid.UUID)

	if err := h.safetyService.AddEmergencyContact(c.Request.Context(), &contact); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, contact)
}

// getEmergencyContacts retrieves all emergency contacts for a user
func (h *SafetyHandler) getEmergencyContacts(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	contacts, err := h.safetyService.GetEmergencyContacts(c.Request.Context(), userID.(uuid.UUID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, contacts)
}

// updateReportStatus updates the status of a safety report
func (h *SafetyHandler) updateReportStatus(c *gin.Context) {
	reportID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid report ID"})
		return
	}

	var status struct {
		Status models.IncidentStatus `json:"status" binding:"required"`
	}
	if err := c.ShouldBindJSON(&status); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.safetyService.UpdateSafetyReportStatus(c.Request.Context(), reportID, status.Status); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Report status updated"})
}
