package services

import (
	"context"
	"errors"
	"time"

	"disco/internal/models"
	"disco/internal/websocket"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// SafetyService handles safety-related operations
type SafetyService struct {
	db *gorm.DB
	ws *websocket.Hub
}

// NewSafetyService creates a new safety service
func NewSafetyService(db *gorm.DB, ws *websocket.Hub) *SafetyService {
	return &SafetyService{
		db: db,
		ws: ws,
	}
}

// CreateSafetyReport creates a new safety report
func (s *SafetyService) CreateSafetyReport(ctx context.Context, report *models.SafetyReport) error {
	report.ID = uuid.New()
	report.CreatedAt = time.Now()
	report.Status = models.IncidentStatusPending

	return s.db.Transaction(func(tx *gorm.DB) error {
		// Create the report
		if err := tx.Create(report).Error; err != nil {
			return err
		}

		// If it's an emergency, create an alert
		if report.Type == models.IncidentTypeEmergency {
			alert := &models.EmergencyAlert{
				ID:        uuid.New(),
				UserID:    report.ReporterID,
				Type:      string(report.Type),
				Message:   report.Description,
				CreatedAt: time.Now(),
				Status:    "active",
			}
			if err := tx.Create(alert).Error; err != nil {
				return err
			}
			// Broadcast emergency alert
			s.ws.BroadcastToUser(report.ReporterID, "emergency_alert", alert)
		}

		return nil
	})
}

// AddEmergencyContact adds a new emergency contact for a user
func (s *SafetyService) AddEmergencyContact(ctx context.Context, contact *models.EmergencyContact) error {
	contact.ID = uuid.New()
	contact.CreatedAt = time.Now()
	contact.UpdatedAt = time.Now()

	return s.db.Create(contact).Error
}

// BlockUser creates a new user block
func (s *SafetyService) BlockUser(ctx context.Context, block *models.UserBlock) error {
	block.ID = uuid.New()
	block.CreatedAt = time.Now()

	return s.db.Transaction(func(tx *gorm.DB) error {
		// Create the block
		if err := tx.Create(block).Error; err != nil {
			return err
		}

		// Remove any existing matches
		if err := tx.Where(
			"(users[1] = ? AND users[2] = ?) OR (users[1] = ? AND users[2] = ?)",
			block.BlockerID, block.BlockedID, block.BlockedID, block.BlockerID,
		).Delete(&models.Match{}).Error; err != nil {
			return err
		}

		return nil
	})
}

// TriggerEmergencyAlert creates and broadcasts an emergency alert
func (s *SafetyService) TriggerEmergencyAlert(ctx context.Context, userID uuid.UUID, location *models.Location) error {
	alert := &models.EmergencyAlert{
		ID:        uuid.New(),
		UserID:    userID,
		Type:      "emergency",
		Location:  location,
		Status:    "active",
		CreatedAt: time.Now(),
	}

	if err := s.db.Create(alert).Error; err != nil {
		return err
	}

	// Fetch user's emergency contacts
	var contacts []models.EmergencyContact
	if err := s.db.Where("user_id = ?", userID).Find(&contacts).Error; err != nil {
		return err
	}

	// Notify emergency contacts
	for _, contact := range contacts {
		if contains(contact.NotifyOn, "emergency") {
			// In a real implementation, this would integrate with SMS/email service
			go s.notifyEmergencyContact(contact, alert)
		}
	}

	// Broadcast to user's websocket connections
	s.ws.BroadcastToUser(userID, "emergency_alert", alert)

	return nil
}

// GetUserBlocks retrieves all blocks for a user
func (s *SafetyService) GetUserBlocks(ctx context.Context, userID uuid.UUID) ([]models.UserBlock, error) {
	var blocks []models.UserBlock
	err := s.db.Where("blocker_id = ?", userID).Find(&blocks).Error
	return blocks, err
}

// GetEmergencyContacts retrieves all emergency contacts for a user
func (s *SafetyService) GetEmergencyContacts(ctx context.Context, userID uuid.UUID) ([]models.EmergencyContact, error) {
	var contacts []models.EmergencyContact
	err := s.db.Where("user_id = ?", userID).Find(&contacts).Error
	return contacts, err
}

// UpdateSafetyReportStatus updates the status of a safety report
func (s *SafetyService) UpdateSafetyReportStatus(ctx context.Context, reportID uuid.UUID, status models.IncidentStatus) error {
	result := s.db.Model(&models.SafetyReport{}).
		Where("id = ?", reportID).
		Updates(map[string]interface{}{
			"status":     status,
			"updated_at": time.Now(),
		})

	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return errors.New("report not found")
	}

	return nil
}

// Helper function to check if a string slice contains a value
func contains(slice []string, str string) bool {
	for _, v := range slice {
		if v == str {
			return true
		}
	}
	return false
}

// Helper function to notify emergency contact (implementation would vary based on notification service)
func (s *SafetyService) notifyEmergencyContact(contact models.EmergencyContact, alert *models.EmergencyAlert) {
	// Implementation would integrate with SMS/email service
	// This is a placeholder for the actual implementation
}
