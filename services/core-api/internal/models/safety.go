package models

import (
	"time"

	"github.com/google/uuid"
)

type IncidentType string

const (
	IncidentTypeHarassment     IncidentType = "harassment"
	IncidentTypeInappropriate  IncidentType = "inappropriate"
	IncidentTypeImpersonation  IncidentType = "impersonation"
	IncidentTypeScam          IncidentType = "scam"
	IncidentTypeEmergency     IncidentType = "emergency"
	IncidentTypeOther         IncidentType = "other"
)

type IncidentStatus string

const (
	IncidentStatusPending    IncidentStatus = "pending"
	IncidentStatusReviewing  IncidentStatus = "reviewing"
	IncidentStatusResolved   IncidentStatus = "resolved"
	IncidentStatusDismissed  IncidentStatus = "dismissed"
)

// SafetyReport represents a user-submitted incident report
type SafetyReport struct {
	ID          uuid.UUID      `json:"id" gorm:"primaryKey;type:uuid"`
	ReporterID  uuid.UUID      `json:"reporter_id" gorm:"type:uuid;not null"`
	ReportedID  uuid.UUID      `json:"reported_id" gorm:"type:uuid;not null"`
	Type        IncidentType   `json:"type" gorm:"not null"`
	Description string         `json:"description"`
	Evidence    []Evidence     `json:"evidence" gorm:"foreignKey:ReportID"`
	Status      IncidentStatus `json:"status" gorm:"not null;default:'pending'"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	ResolvedAt  *time.Time     `json:"resolved_at"`
}

// Evidence represents supporting evidence for a safety report
type Evidence struct {
	ID        uuid.UUID `json:"id" gorm:"primaryKey;type:uuid"`
	ReportID  uuid.UUID `json:"report_id" gorm:"type:uuid;not null"`
	Type      string    `json:"type" gorm:"not null"` // e.g., "image", "chat_log", "screenshot"
	URL       string    `json:"url" gorm:"not null"`
	CreatedAt time.Time `json:"created_at"`
}

// EmergencyContact represents a user's emergency contact
type EmergencyContact struct {
	ID        uuid.UUID `json:"id" gorm:"primaryKey;type:uuid"`
	UserID    uuid.UUID `json:"user_id" gorm:"type:uuid;not null"`
	Name      string    `json:"name" gorm:"not null"`
	Phone     string    `json:"phone" gorm:"not null"`
	Email     string    `json:"email"`
	Relation  string    `json:"relation"`
	NotifyOn  []string  `json:"notify_on" gorm:"type:text[]"` // Array of incident types that trigger notification
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// UserBlock represents a user blocking another user
type UserBlock struct {
	ID          uuid.UUID `json:"id" gorm:"primaryKey;type:uuid"`
	BlockerID   uuid.UUID `json:"blocker_id" gorm:"type:uuid;not null"`
	BlockedID   uuid.UUID `json:"blocked_id" gorm:"type:uuid;not null"`
	Reason      string    `json:"reason"`
	CreatedAt   time.Time `json:"created_at"`
	ExpiresAt   *time.Time `json:"expires_at"` // Optional expiration for temporary blocks
}

// EmergencyAlert represents a real-time emergency alert
type EmergencyAlert struct {
	ID        uuid.UUID `json:"id" gorm:"primaryKey;type:uuid"`
	UserID    uuid.UUID `json:"user_id" gorm:"type:uuid;not null"`
	Type      string    `json:"type" gorm:"not null"`
	Location  *Location `json:"location" gorm:"embedded"`
	Status    string    `json:"status" gorm:"not null;default:'active'"`
	Message   string    `json:"message"`
	CreatedAt time.Time `json:"created_at"`
	ResolvedAt *time.Time `json:"resolved_at"`
}

// Location embedded type for EmergencyAlert
type Location struct {
	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`
	Accuracy  float32 `json:"accuracy"`
}
