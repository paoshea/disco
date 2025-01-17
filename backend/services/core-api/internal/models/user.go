package models

import (
    "time"
    "github.com/google/uuid"
)

type User struct {
    ID             uuid.UUID  `json:"id" gorm:"primaryKey;type:uuid"`
    Email          string     `json:"email" gorm:"unique;not null"`
    Username       string     `json:"username" gorm:"unique;not null"`
    HashedPassword string     `json:"-" gorm:"not null"`
    FirstName      string     `json:"firstName"`
    LastName       string     `json:"lastName"`
    Bio           string     `json:"bio"`
    Interests     []string   `json:"interests" gorm:"type:text[]"`
    Location      *Location  `json:"location,omitempty" gorm:"embedded"`
    CreatedAt     time.Time  `json:"createdAt"`
    UpdatedAt     time.Time  `json:"updatedAt"`
}

type Location struct {
    Latitude  float64 `json:"latitude"`
    Longitude float64 `json:"longitude"`
    LastUpdate time.Time `json:"lastUpdate"`
}
