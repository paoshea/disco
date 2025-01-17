package websocket

import (
	"encoding/json"
	"sync"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)

// Client represents a connected websocket client
type Client struct {
	hub  *Hub
	conn *websocket.Conn
	send chan []byte
	userID uuid.UUID
}

// Message represents a websocket message
type Message struct {
	Type    string      `json:"type"`
	Payload interface{} `json:"payload"`
}

// Hub maintains the set of active clients and broadcasts messages
type Hub struct {
	clients    map[*Client]bool
	userClients map[uuid.UUID][]*Client
	broadcast  chan []byte
	register   chan *Client
	unregister chan *Client
	mu         sync.RWMutex
}

// NewHub creates a new websocket hub
func NewHub() *Hub {
	return &Hub{
		clients:     make(map[*Client]bool),
		userClients: make(map[uuid.UUID][]*Client),
		broadcast:   make(chan []byte),
		register:    make(chan *Client),
		unregister:  make(chan *Client),
	}
}

// Run starts the hub
func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			h.mu.Lock()
			h.clients[client] = true
			h.userClients[client.userID] = append(h.userClients[client.userID], client)
			h.mu.Unlock()

		case client := <-h.unregister:
			h.mu.Lock()
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				h.removeUserClient(client)
				close(client.send)
			}
			h.mu.Unlock()

		case message := <-h.broadcast:
			h.mu.RLock()
			for client := range h.clients {
				select {
				case client.send <- message:
				default:
					close(client.send)
					delete(h.clients, client)
					h.removeUserClient(client)
				}
			}
			h.mu.RUnlock()
		}
	}
}

// BroadcastToUser sends a message to all connections of a specific user
func (h *Hub) BroadcastToUser(userID uuid.UUID, messageType string, payload interface{}) {
	message := Message{
		Type:    messageType,
		Payload: payload,
	}

	data, err := json.Marshal(message)
	if err != nil {
		return
	}

	h.mu.RLock()
	if clients, ok := h.userClients[userID]; ok {
		for _, client := range clients {
			select {
			case client.send <- data:
			default:
				close(client.send)
				delete(h.clients, client)
				h.removeUserClient(client)
			}
		}
	}
	h.mu.RUnlock()
}

// removeUserClient removes a client from the userClients map
func (h *Hub) removeUserClient(client *Client) {
	if clients, ok := h.userClients[client.userID]; ok {
		var newClients []*Client
		for _, c := range clients {
			if c != client {
				newClients = append(newClients, c)
			}
		}
		if len(newClients) == 0 {
			delete(h.userClients, client.userID)
		} else {
			h.userClients[client.userID] = newClients
		}
	}
}

// writePump pumps messages from the hub to the websocket connection
func (c *Client) writePump() {
	defer func() {
		c.conn.Close()
	}()

	for {
		select {
		case message, ok := <-c.send:
			if !ok {
				c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			w, err := c.conn.NextWriter(websocket.TextMessage)
			if err != nil {
				return
			}
			w.Write(message)

			if err := w.Close(); err != nil {
				return
			}
		}
	}
}

// readPump pumps messages from the websocket connection to the hub
func (c *Client) readPump() {
	defer func() {
		c.hub.unregister <- c
		c.conn.Close()
	}()

	for {
		_, _, err := c.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				// Log error here
			}
			break
		}
	}
}
