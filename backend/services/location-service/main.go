package main

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"os/signal"
	"sync"
	"syscall"
	"time"

	"github.com/gorilla/websocket"
	"github.com/redis/go-redis/v9"
)

type Location struct {
	UserID    string    `json:"userId"`
	Latitude  float64   `json:"latitude"`
	Longitude float64   `json:"longitude"`
	Accuracy  float64   `json:"accuracy"`
	Timestamp time.Time `json:"timestamp"`
}

type Server struct {
	clients    map[*websocket.Conn]string // websocket -> userId
	register   chan *websocket.Conn
	unregister chan *websocket.Conn
	broadcast  chan []byte
	upgrader   websocket.Upgrader
	redis      *redis.Client
	mu         sync.RWMutex
}

func NewServer() *Server {
	rdb := redis.NewClient(&redis.Options{
		Addr:     os.Getenv("LOCATION_REDIS_URL"),
		Password: os.Getenv("LOCATION_REDIS_PASSWORD"),
		DB:       0,
	})

	return &Server{
		clients:    make(map[*websocket.Conn]string),
		register:   make(chan *websocket.Conn),
		unregister: make(chan *websocket.Conn),
		broadcast:  make(chan []byte),
		upgrader: websocket.Upgrader{
			CheckOrigin: func(r *http.Request) bool {
				return true // TODO: Add proper origin check
			},
		},
		redis: rdb,
	}
}

func (s *Server) handleConnections(w http.ResponseWriter, r *http.Request) {
	ws, err := s.upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("Failed to upgrade connection: %v", err)
		return
	}
	defer ws.Close()

	userID := r.URL.Query().Get("userId")
	if userID == "" {
		log.Printf("No userId provided")
		return
	}

	s.register <- ws
	s.mu.Lock()
	s.clients[ws] = userID
	s.mu.Unlock()

	for {
		var loc Location
		err := ws.ReadJSON(&loc)
		if err != nil {
			log.Printf("Error reading location: %v", err)
			break
		}

		loc.UserID = userID
		loc.Timestamp = time.Now()

		// Store in Redis
		locBytes, err := json.Marshal(loc)
		if err != nil {
			log.Printf("Error marshaling location: %v", err)
			continue
		}

		err = s.redis.Set(context.Background(), "location:"+userID, string(locBytes), 24*time.Hour).Err()
		if err != nil {
			log.Printf("Error storing location in Redis: %v", err)
			continue
		}

		// Broadcast to relevant clients
		s.broadcast <- locBytes
	}

	s.unregister <- ws
	s.mu.Lock()
	delete(s.clients, ws)
	s.mu.Unlock()
}

func (s *Server) run() {
	for {
		select {
		case client := <-s.register:
			s.mu.Lock()
			log.Printf("Client connected: %s", s.clients[client])
			s.mu.Unlock()

		case client := <-s.unregister:
			s.mu.Lock()
			log.Printf("Client disconnected: %s", s.clients[client])
			delete(s.clients, client)
			s.mu.Unlock()

		case message := <-s.broadcast:
			var loc Location
			if err := json.Unmarshal(message, &loc); err != nil {
				log.Printf("Error unmarshaling location: %v", err)
				continue
			}

			s.mu.RLock()
			for client, userID := range s.clients {
				// Only send location updates to relevant users
				// TODO: Implement proper location sharing rules
				if userID == loc.UserID {
					err := client.WriteMessage(websocket.TextMessage, message)
					if err != nil {
						log.Printf("Error broadcasting to client: %v", err)
						client.Close()
						delete(s.clients, client)
					}
				}
			}
			s.mu.RUnlock()
		}
	}
}

func main() {
	server := NewServer()
	go server.run()

	http.HandleFunc("/ws", server.handleConnections)

	port := os.Getenv("LOCATION_PORT")
	if port == "" {
		port = "8080"
	}

	srv := &http.Server{
		Addr: ":" + port,
	}

	// Graceful shutdown
	go func() {
		sigChan := make(chan os.Signal, 1)
		signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)
		<-sigChan

		log.Println("Shutting down server...")
		if err := srv.Shutdown(context.Background()); err != nil {
			log.Printf("HTTP server shutdown error: %v", err)
		}
	}()

	log.Printf("Location service starting on port %s", port)
	if err := srv.ListenAndServe(); err != http.ErrServerClosed {
		log.Fatalf("HTTP server error: %v", err)
	}
}
