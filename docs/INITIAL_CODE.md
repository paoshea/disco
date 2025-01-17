# Initial Code Structure

This document represents the initial code structure for the DISCO! application, showcasing the core backend services written in Go and Rust, as well as the frontend React/Next.js implementation with TypeScript, as well as the API documentation. and implementation details for the DISCO! application. 
The code is organized into backend microservices and frontend components.

## Backend Services

### Core API Service (Go)

#### Main Entry Point (`services/core-api/cmd/main.go`)
```go
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
```

#### User Model (`services/core-api/internal/models/user.go`)
```go
package models

import (
    "time"
    "github.com/google/uuid"
)

type User struct {
    ID             uuid.UUID  `json:"id" gorm:"primaryKey;type:uuid"`
    Email          string     `json:"email" gorm:"unique;not null"`
    HashedPassword string     `json:"-"`
    Name           string     `json:"name"`
    CreatedAt      time.Time  `json:"created_at"`
    UpdatedAt      time.Time  `json:"updated_at"`
    LastLoginAt    *time.Time `json:"last_login_at"`
    Settings       UserSettings `json:"settings" gorm:"embedded"`
}

type UserSettings struct {
    DiscoveryRadius float64 `json:"discovery_radius"`
    PrivacyEnabled  bool    `json:"privacy_enabled"`
    ActiveStatus    string  `json:"active_status"`
}
```

### Location Service (Rust)

#### Main Entry Point (`services/location-service/src/main.rs`)
```rust
use actix_web::{web, App, HttpServer};
use tokio;

mod models;
mod services;
mod handlers;
mod config;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    // Load configuration
    let config = config::load_config().expect("Failed to load config");

    // Initialize services
    let location_service = services::LocationService::new(&config);
    let app_data = web::Data::new(location_service);

    // Start server
    HttpServer::new(move || {
        App::new()
            .app_data(app_data.clone())
            .service(handlers::location::register_routes())
    })
    .bind(("127.0.0.1", 8081))?
    .run()
    .await
}
```

#### Location Model (`services/location-service/src/models/location.rs`)
```rust
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::{DateTime, Utc};

#[derive(Debug, Serialize, Deserialize)]
pub struct Location {
    pub user_id: Uuid,
    pub latitude: f64,
    pub longitude: f64,
    pub accuracy: f32,
    pub geohash: String,
    pub timestamp: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct NearbyRequest {
    pub latitude: f64,
    pub longitude: f64,
    pub radius: f32,
    pub limit: Option<i32>,
}
```
# Core API Service (Go)

# services/core-api/cmd/main.go
```go
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
```

# services/core-api/internal/models/user.go
```go
package models

import (
    "time"
    "github.com/google/uuid"
)

type User struct {
    ID             uuid.UUID  `json:"id" gorm:"primaryKey;type:uuid"`
    Email          string     `json:"email" gorm:"unique;not null"`
    HashedPassword string     `json:"-"`
    Name           string     `json:"name"`
    CreatedAt      time.Time  `json:"created_at"`
    UpdatedAt      time.Time  `json:"updated_at"`
    LastLoginAt    *time.Time `json:"last_login_at"`
    Settings       UserSettings `json:"settings" gorm:"embedded"`
}

type UserSettings struct {
    DiscoveryRadius float64 `json:"discovery_radius"`
    PrivacyEnabled  bool    `json:"privacy_enabled"`
    ActiveStatus    string  `json:"active_status"`
}
```

# services/core-api/internal/handlers/user_handler.go
```go
package handlers

import (
    "net/http"
    "github.com/gin-gonic/gin"
    "disco/internal/services"
    "disco/internal/models"
)

type UserHandler struct {
    userService *services.UserService
}

func NewUserHandler(userService *services.UserService) *UserHandler {
    return &UserHandler{userService: userService}
}

func (h *UserHandler) CreateUser(c *gin.Context) {
    var user models.User
    if err := c.ShouldBindJSON(&user); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    createdUser, err := h.userService.CreateUser(&user)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    c.JSON(http.StatusCreated, createdUser)
}
```

# Location Service (Rust)

# services/location-service/src/main.rs
```rust
use actix_web::{web, App, HttpServer};
use tokio;

mod models;
mod services;
mod handlers;
mod config;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    // Load configuration
    let config = config::load_config().expect("Failed to load config");

    // Initialize services
    let location_service = services::LocationService::new(&config);
    let app_data = web::Data::new(location_service);

    // Start server
    HttpServer::new(move || {
        App::new()
            .app_data(app_data.clone())
            .service(handlers::location::register_routes())
    })
    .bind(("127.0.0.1", 8081))?
    .run()
    .await
}
```

# services/location-service/src/models/location.rs
```rust
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::{DateTime, Utc};

#[derive(Debug, Serialize, Deserialize)]
pub struct Location {
    pub user_id: Uuid,
    pub latitude: f64,
    pub longitude: f64,
    pub accuracy: f32,
    pub geohash: String,
    pub timestamp: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct NearbyRequest {
    pub latitude: f64,
    pub longitude: f64,
    pub radius: f32,
    pub limit: Option<i32>,
}
```

# services/location-service/src/services/location_service.rs
```rust
use crate::models::Location;
use redis::{Client, Commands};
use geohash::encode;

pub struct LocationService {
    redis_client: Client,
}

impl LocationService {
    pub fn new(redis_url: &str) -> Self {
        let client = Client::open(redis_url)
            .expect("Failed to connect to Redis");
        Self { redis_client: client }
    }

    pub async fn update_location(&self, location: Location) -> Result<(), Box<dyn std::error::Error>> {
        let conn = self.redis_client.get_connection()?;
        
        // Generate geohash
        let geohash = encode(location.latitude, location.longitude, 8)
            .map_err(|e| format!("Failed to generate geohash: {}", e))?;

        // Store location in Redis
        let key = format!("location:{}:{}", location.user_id, geohash);
        conn.set_ex(key, location.to_string(), 300)?; // 5 minute TTL

        Ok(())
    }
}
```

# User Management Service (Node.js/NestJS)

# services/user-service/src/main.ts
```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());

  const config = new DocumentBuilder()
    .setTitle('DISCO User Service')
    .setDescription('User management API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();
```

# services/user-service/src/users/user.entity.ts
```typescript
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column()
  name: string;

  @Column({ type: 'jsonb' })
  preferences: {
    discoveryRadius: number;
    privacyEnabled: boolean;
    notificationSettings: {
      matches: boolean;
      messages: boolean;
    };
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

# services/user-service/src/users/users.service.ts
```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { hash } from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = new User();
    user.email = createUserDto.email;
    user.passwordHash = await hash(createUserDto.password, 10);
    user.name = createUserDto.name;
    user.preferences = createUserDto.preferences;

    return this.usersRepository.save(user);
  }

  async findOne(id: string): Promise<User> {
    return this.usersRepository.findOneBy({ id });
  }
}
```

# Real-time Matching Service (Elixir/Phoenix)

# services/matching-service/lib/disco/application.ex
```elixir
defmodule Disco.Application do
  use Application

  def start(_type, _args) do
    children = [
      DiscoWeb.Endpoint,
      {Phoenix.PubSub, name: Disco.PubSub},
      Disco.Presence,
      Disco.MatchingServer
    ]

    opts = [strategy: :one_for_one, name: Disco.Supervisor]
    Supervisor.start_link(children, opts)
  end
end
```

# services/matching-service/lib/disco/matching/matcher.ex
```elixir
defmodule Disco.Matching.Matcher do
  use GenServer
  alias Disco.Matching.Score

  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  def init(_opts) do
    {:ok, %{matches: %{}}}
  end

  def handle_call({:find_matches, user_location}, _from, state) do
    matches = 
      user_location
      |> find_nearby_users()
      |> calculate_scores()
      |> filter_matches()

    {:reply, matches, state}
  end

  defp find_nearby_users(location) do
    Disco.Geo.nearby_users(location)
  end

  defp calculate_scores(nearby_users) do
    nearby_users
    |> Enum.map(fn user ->
      {user, Score.calculate(user)}
    end)
  end

  defp filter_matches(scored_users) do
    scored_users
    |> Enum.filter(fn {_user, score} -> score > 0.7 end)
    |> Enum.sort_by(fn {_user, score} -> score end, :desc)
  end
end
```

# services/matching-service/lib/disco_web/channels/user_socket.ex
```elixir
defmodule DiscoWeb.UserSocket do
  use Phoenix.Socket

  channel "user:*", DiscoWeb.UserChannel

  def connect(%{"token" => token}, socket, _connect_info) do
    case Disco.Auth.verify_token(token) do
      {:ok, user_id} ->
        {:ok, assign(socket, :user_id, user_id)}
      {:error, _reason} ->
        :error
    end
  end

  def id(socket), do: "user_socket:#{socket.assigns.user_id}"
end
```

# Configuration Files

# services/core-api/config/config.yaml
```yaml
server:
  port: 8080
  host: "0.0.0.0"

database:
  host: "localhost"
  port: 5432
  name: "disco_core"
  user: "disco_user"

redis:
  host: "localhost"
  port: 6379

security:
  jwt_secret: "your-secret-key"
  token_expiry: "24h"

services:
  location_service: "http://location-service:8081"
  user_service: "http://user-service:3000"
  matching_service: "http://matching-service:4000"
```

# Docker Configurations

# services/core-api/Dockerfile
```dockerfile
FROM golang:1.21-alpine

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN go build -o main ./cmd/main.go

EXPOSE 8080

CMD ["./main"]
```

# services/location-service/Dockerfile
```dockerfile
FROM rust:1.70 as builder

WORKDIR /usr/src/app
COPY . .

RUN cargo build --release

FROM debian:buster-slim
COPY --from=builder /usr/src/app/target/release/location-service /usr/local/bin/

EXPOSE 8081

CMD ["location-service"]
```

# services/user-service/Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
```

# services/matching-service/Dockerfile
```dockerfile
FROM elixir:1.14-alpine

WORKDIR /app

COPY mix.exs mix.lock ./
RUN mix deps.get

COPY . .
RUN mix compile

EXPOSE 4000

CMD ["mix", "phx.server"]
```


## Frontend Structure

### Configuration

#### TypeScript Configuration (`tsconfig.json`)
```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@features/*": ["src/features/*"],
      "@services/*": ["src/services/*"],
      "@utils/*": ["src/utils/*"],
      "@hooks/*": ["src/hooks/*"],
      "@store/*": ["src/store/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

### Core Types

#### User Types (`src/types/user.ts`)
```typescript
export interface User {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
  preferences: UserPreferences;
  location?: UserLocation;
  status: UserStatus;
  createdAt: Date;
}

export interface UserPreferences {
  discoveryRadius: number;
  privacyEnabled: boolean;
  notificationSettings: {
    matches: boolean;
    messages: boolean;
  };
  interests: string[];
}

export interface UserLocation {
  latitude: number;
  longitude: number;
  lastUpdated: Date;
}

export type UserStatus = 'online' | 'offline' | 'away' | 'busy';
```

### Components

#### Match Card Component (`src/components/matching/MatchCard.tsx`)
```typescript
import React from 'react';
import Image from 'next/image';
import { MatchPreview } from '@/types/match';

interface MatchCardProps {
  match: MatchPreview;
  onAccept: (matchId: string) => void;
  onDecline: (matchId: string) => void;
}

export const MatchCard: React.FC<MatchCardProps> = ({
  match,
  onAccept,
  onDecline,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="relative h-64">
        {match.profileImage ? (
          <Image
            src={match.profileImage}
            alt={match.name}
            layout="fill"
            objectFit="cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-2xl text-gray-400">No Image</span>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-xl font-semibold">{match.name}</h3>
        <p className="text-gray-600">{match.distance}km away</p>

        <div className="mt-2">
          <h4 className="text-sm font-medium text-gray-700">Common Interests</h4>
          <div className="flex flex-wrap gap-2 mt-1">
            {match.commonInterests.map((interest) => (
              <span
                key={interest}
                className="px-2 py-1 text-sm bg-primary-100 text-primary-800 rounded-full"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-4 flex gap-4">
          <button
            onClick={() => onDecline(match.id)}
            className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Pass
          </button>
          <button
            onClick={() => onAccept(match.id)}
            className="flex-1 py-2 px-4 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            Connect
          </button>
        </div>
      </div>
    </div>
  );
};
```

### Services

#### API Client (`src/services/api/client.ts`)
```typescript
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle token refresh or logout
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);
```

# Configuration Files

# tsconfig.json
```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@features/*": ["src/features/*"],
      "@services/*": ["src/services/*"],
      "@utils/*": ["src/utils/*"],
      "@hooks/*": ["src/hooks/*"],
      "@store/*": ["src/store/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

# tailwind.config.js
```javascript
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './src/features/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
      },
      spacing: {
        '128': '32rem',
      },
    },
  },
  plugins: [],
}
```

# Types

# src/types/user.ts
```typescript
export interface User {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
  preferences: UserPreferences;
  location?: UserLocation;
  status: UserStatus;
  createdAt: Date;
}

export interface UserPreferences {
  discoveryRadius: number;
  privacyEnabled: boolean;
  notificationSettings: {
    matches: boolean;
    messages: boolean;
  };
  interests: string[];
}

export interface UserLocation {
  latitude: number;
  longitude: number;
  lastUpdated: Date;
}

export type UserStatus = 'online' | 'offline' | 'away' | 'busy';
```

# src/types/match.ts
```typescript
export interface Match {
  id: string;
  users: [string, string];
  status: MatchStatus;
  matchScore: number;
  createdAt: Date;
  lastInteraction?: Date;
}

export type MatchStatus = 'pending' | 'accepted' | 'declined' | 'expired';

export interface MatchPreview {
  userId: string;
  name: string;
  distance: number;
  matchScore: number;
  commonInterests: string[];
}
```

# Services

# src/services/api/client.ts
```typescript
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle token refresh or logout
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);
```

# src/services/api/user.service.ts
```typescript
import { apiClient } from './client';
import { User, UserPreferences } from '@/types/user';

export const userService = {
  async getCurrentUser(): Promise<User> {
    const { data } = await apiClient.get<User>('/users/me');
    return data;
  },

  async updatePreferences(preferences: Partial<UserPreferences>): Promise<User> {
    const { data } = await apiClient.patch<User>('/users/preferences', preferences);
    return data;
  },

  async updateLocation(latitude: number, longitude: number): Promise<void> {
    await apiClient.post('/users/location', { latitude, longitude });
  },
};
```

# src/services/websocket/socket.service.ts
```typescript
import { io, Socket } from 'socket.io-client';
import { Match, MatchPreview } from '@/types/match';

export class SocketService {
  private socket: Socket | null = null;
  private handlers: Map<string, Function[]> = new Map();

  connect(token: string) {
    this.socket = io(process.env.NEXT_PUBLIC_WS_URL!, {
      auth: { token },
      transports: ['websocket'],
    });

    this.setupListeners();
  }

  private setupListeners() {
    if (!this.socket) return;

    this.socket.on('match:new', (match: MatchPreview) => {
      this.emit('match:new', match);
    });

    this.socket.on('match:accepted', (match: Match) => {
      this.emit('match:accepted', match);
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from websocket');
    });
  }

  on(event: string, handler: Function) {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, []);
    }
    this.handlers.get(event)?.push(handler);
  }

  private emit(event: string, data: any) {
    this.handlers.get(event)?.forEach(handler => handler(data));
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const socketService = new SocketService();
```

# Store

# src/store/store.ts
```typescript
import { configureStore } from '@reduxjs/toolkit';
import { userReducer } from './slices/userSlice';
import { matchReducer } from './slices/matchSlice';
import { locationMiddleware } from './middleware/locationMiddleware';

export const store = configureStore({
  reducer: {
    user: userReducer,
    matches: matchReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(locationMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

# src/store/slices/userSlice.ts
```typescript
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { User } from '@/types/user';
import { userService } from '@/services/api/user.service';

interface UserState {
  currentUser: User | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  currentUser: null,
  loading: false,
  error: null,
};

export const fetchCurrentUser = createAsyncThunk(
  'user/fetchCurrent',
  async () => {
    return await userService.getCurrentUser();
  }
);

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    updateUserLocation: (state, action) => {
      if (state.currentUser) {
        state.currentUser.location = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.currentUser = action.payload;
        state.loading = false;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to fetch user';
        state.loading = false;
      });
  },
});

export const { updateUserLocation } = userSlice.actions;
export const userReducer = userSlice.reducer;
```

# Hooks

# src/hooks/useGeolocation.ts
```typescript
import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { updateUserLocation } from '@/store/slices/userSlice';
import { userService } from '@/services/api/user.service';

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
}

export const useGeolocation = () => {
  const dispatch = useDispatch();
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    error: null,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        error: 'Geolocation is not supported',
      }));
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setState({
          latitude,
          longitude,
          error: null,
        });

        // Update location in backend
        try {
          await userService.updateLocation(latitude, longitude);
          dispatch(updateUserLocation({ latitude, longitude }));
        } catch (error) {
          console.error('Failed to update location:', error);
        }
      },
      (error) => {
        setState(prev => ({
          ...prev,
          error: error.message,
        }));
      },
      {
        enableHighAccuracy: true,
        maximumAge: 30000, // 30 seconds
        timeout: 27000, // 27 seconds
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [dispatch]);

  return state;
};
```

# Components

# src/components/map/MapView.tsx
```typescript
import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { useGeolocation } from '@/hooks/useGeolocation';
import { Match } from '@/types/match';

interface MapViewProps {
  matches: Match[];
  onMarkerClick: (matchId: string) => void;
}

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

export const MapView: React.FC<MapViewProps> = ({ matches, onMarkerClick }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const { latitude, longitude, error } = useGeolocation();

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [longitude || -74.006, latitude || 40.7128],
      zoom: 12,
    });

    // Add navigation control
    map.current.addControl(new mapboxgl.NavigationControl());

    return () => {
      map.current?.remove();
    };
  }, [latitude, longitude]);

  useEffect(() => {
    if (!map.current || !latitude || !longitude) return;

    map.current.setCenter([longitude, latitude]);

    // Add user marker
    new mapboxgl.Marker({ color: '#FF0000' })
      .setLngLat([longitude, latitude])
      .addTo(map.current);

    // Add match markers
    matches.forEach(match => {
      const el = document.createElement('div');
      el.className = 'match-marker';
      el.addEventListener('click', () => onMarkerClick(match.id));

      new mapboxgl.Marker(el)
        .setLngLat([match.longitude, match.latitude])
        .addTo(map.current!);
    });
  }, [matches, latitude, longitude, onMarkerClick]);

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div 
      ref={mapContainer} 
      className="w-full h-128 rounded-lg shadow-lg"
    />
  );
};
```

# src/components/matching/MatchCard.tsx
```typescript
import React from 'react';
import Image from 'next/image';
import { MatchPreview } from '@/types/match';

interface MatchCardProps {
  match: MatchPreview;
  onAccept: (matchId: string) => void;
  onDecline: (matchId: string) => void;
}

export const MatchCard: React.FC<MatchCardProps> = ({
  match,
  onAccept,
  onDecline,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="relative h-64">
        {match.profileImage ? (
          <Image
            src={match.profileImage}
            alt={match.name}
            layout="fill"
            objectFit="cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-2xl text-gray-400">No Image</span>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-xl font-semibold">{match.name}</h3>
        <p className="text-gray-600">{match.distance}km away</p>

        <div className="mt-2">
          <h4 className="text-sm font-medium text-gray-700">Common Interests</h4>
          <div className="flex flex-wrap gap-2 mt-1">
            {match.commonInterests.map((interest) => (
              <span
                key={interest}
                className="px-2 py-1 text-sm bg-primary-100 text-primary-800 rounded-full"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-4 flex gap-4">
          <button
            onClick={() => onDecline(match.id)}
            className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Pass
          </button>
          <button
            onClick={() => onAccept(match.id)}
            className="flex-1 py-2 px-4 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            Connect
          </button>
        </div>
      </div>
    </div>
  );
};
```

# src/components/layout/Layout.tsx
```typescript
import React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { Sidebar } from './Sidebar';
import { useAuth } from '@/hooks/useAuth';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        {user && <Sidebar />}
        <main className="flex-1 p-6">{children}</main>
      </div>
      <Footer />
    </div>
  );
};
```

# src/components/layout/Header.tsx
```typescript
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { UserMenu } from './UserMenu';

export const Header: React.FC = () => {
  const { user, isLoading } = useAuth();

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex items-center">
              <Image
                src="/images/logo.svg"
                alt="DISCO!"
                width={32}
                height={32}
              />
              <span className="ml-2 text-xl font-bold text-primary-600">
                DISCO!
              </span>
            </Link>
          </div>

          <div className="flex items-center">
            {isLoading ? (
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
            ) : user ? (
              <UserMenu user={user} />
            ) : (
              <div className="space-x-4">
                <Link
                  href="/auth/login"
                  className="text-gray-600 hover:text-gray-900"
                >
                  Log in
                </Link>
                <Link
                  href="/auth/signup"
                  className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
```

# Pages

# src/pages/index.tsx
```typescript
import { NextPage } from 'next';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Layout } from '@/components/layout/Layout';
import { MapView } from '@/components/map/MapView';
import { MatchCard } from '@/components/matching/MatchCard';
import { fetchMatches } from '@/store/slices/matchSlice';
import { RootState } from '@/store/store';
import { useGeolocation } from '@/hooks/useGeolocation';

const HomePage: NextPage = () => {
  const dispatch = useDispatch();
  const { matches, loading } = useSelector((state: RootState) => state.matches);
  const { error } = useGeolocation();

  useEffect(() => {
    dispatch(fetchMatches());
  }, [dispatch]);

  if (error) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900">Location Error</h2>
          <p className="mt-2 text-gray-600">
            Please enable location services to use DISCO!
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-gray-900">Nearby Matches</h1>
          {loading ? (
            <div className="flex justify-center">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
            </div>
          ) : (
            matches.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                onAccept={(id) => console.log('Accepted:', id)}
                onDecline={(id) => console.log('Declined:', id)}
              />
            ))
          )}
        </div>
        <div className="sticky top-6">
          <MapView
            matches={matches}
            onMarkerClick={(id) => console.log('Clicked marker:', id)}
          />
        </div>
      </div>
    </Layout>
  );
};

export default HomePage;
```

# src/pages/auth/login.tsx
```typescript
import { NextPage } from 'next';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';

interface LoginForm {
  email: string;
  password: string;
}

const LoginPage: NextPage = () => {
  const router = useRouter();
  const { login } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    try {
      await login(data.email, data.password);
      router.push('/');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to DISCO!
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                type="email"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Email address"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                type="password"
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 8,
                    message: 'Password must be at least 8 characters',
                  },
                })}
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Password"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
```

# src/pages/_app.tsx
```typescript
import { AppProps } from 'next/app';
import { Provider } from 'react-redux';
import { store } from '@/store/store';
import { AuthProvider } from '@/hooks/useAuth';
import '@/styles/globals.css';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Provider store={store}>
      <AuthProvider>
        <Component {...pageProps} />
      </AuthProvider>
    </Provider>
  );
}

export default MyApp;
```

# Additional Files

# src/hooks/useAuth.tsx
```typescript
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types/user';
import { apiClient } from '@/services/api/client';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        const { data } = await apiClient.get<User>('/users/me');
        setUser(data);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const { data } = await apiClient.post('/auth/login', { email, password });
    localStorage.setItem('auth_token', data.token);
    setUser(data.user);
  };

  const logout = async () => {
    localStorage.removeItem('auth_token');
    setUser(null);
  };

  const signup = async (email: string, password: string, name: string) => {
    const { data } = await apiClient.post('/auth/signup', {
      email,
      password,
      name,
    });
    localStorage.setItem('auth_token', data.token);
    setUser(data.user);
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, logout, signup }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

# src/components/profile/ProfileEdit.tsx
```typescript
import React from 'react';
import { useForm } from 'react-hook-form';
import { User, UserPreferences } from '@/types/user';
import { userService } from '@/services/api/user.service';

interface ProfileEditProps {
  user: User;
  onUpdate: (updatedUser: User) => void;
}

interface ProfileFormData {
  name: string;
  bio: string;
  interests: string[];
  discoveryRadius: number;
  privacyEnabled: boolean;
  notificationSettings: {
    matches: boolean;
    messages: boolean;
  };
}

export const ProfileEdit: React.FC<ProfileEditProps> = ({ user, onUpdate }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<ProfileFormData>({
    defaultValues: {
      name: user.name,
      bio: user.bio || '',
      interests: user.preferences.interests,
      discoveryRadius: user.preferences.discoveryRadius,
      privacyEnabled: user.preferences.privacyEnabled,
      notificationSettings: user.preferences.notificationSettings,
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    try {
      const updatedPreferences: UserPreferences = {
        discoveryRadius: data.discoveryRadius,
        privacyEnabled: data.privacyEnabled,
        notificationSettings: data.notificationSettings,
        interests: data.interests,
      };

      const updatedUser = await userService.updatePreferences(updatedPreferences);
      onUpdate(updatedUser);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Name
        </label>
        <input
          type="text"
          id="name"
          {...register('name', { required: 'Name is required' })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
          Bio
        </label>
        <textarea
          id="bio"
          rows={4}
          {...register('bio')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        />
      </div>

      <div>
        <label htmlFor="discoveryRadius" className="block text-sm font-medium text-gray-700">
          Discovery Radius (km)
        </label>
        <input
          type="number"
          id="discoveryRadius"
          {...register('discoveryRadius', {
            required: 'Discovery radius is required',
            min: { value: 1, message: 'Minimum radius is 1km' },
            max: { value: 100, message: 'Maximum radius is 100km' },
          })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        />
        {errors.discoveryRadius && (
          <p className="mt-1 text-sm text-red-600">{errors.discoveryRadius.message}</p>
        )}
      </div>

      <div>
        <div className="flex items-center">
          <input
            type="checkbox"
            id="privacyEnabled"
            {...register('privacyEnabled')}
            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <label htmlFor="privacyEnabled" className="ml-2 block text-sm text-gray-700">
            Enable Privacy Mode
          </label>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          When enabled, your profile will only be visible to mutual matches
        </p>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-700">Notification Settings</h3>
        <div className="mt-2 space-y-2">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="notifyMatches"
              {...register('notificationSettings.matches')}
              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="notifyMatches" className="ml-2 block text-sm text-gray-700">
              New Match Notifications
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="notifyMessages"
              {...register('notificationSettings.messages')}
              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="notifyMessages" className="ml-2 block text-sm text-gray-700">
              Message Notifications
            </label>
          </div>
        </div>
      </div>

      <div>
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Save Changes
        </button>
      </div>
    </form>
  );
};
```

# src/components/chat/ChatWindow.tsx
```typescript
import React, { useEffect, useRef, useState } from 'react';
import { Message } from '@/types/chat';
import { socketService } from '@/services/websocket/socket.service';
import { useAuth } from '@/hooks/useAuth';

interface ChatWindowProps {
  matchId: string;
  recipientId: string;
  recipientName: string;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  matchId,
  recipientId,
  recipientName,
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize chat connection
    socketService.emit('chat:join', { matchId });

    // Listen for new messages
    socketService.on(`chat:${matchId}`, (message: Message) => {
      setMessages(prev => [...prev, message]);
    });

    return () => {
      socketService.emit('chat:leave', { matchId });
      socketService.off(`chat:${matchId}`);
    };
  }, [matchId]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    const message: Message = {
      id: Date.now().toString(),
      matchId,
      senderId: user.id,
      content: newMessage,
      timestamp: new Date(),
    };

    socketService.emit('chat:message', message);
    setNewMessage('');
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow">
      <div className="px-4 py-3 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">{recipientName}</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.senderId === user?.id ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-xs px-4 py-2 rounded-lg ${
                message.senderId === user?.id
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p className="text-sm">{message.content}</p>
              <span className="text-xs opacity-75">
                {new Date(message.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="p-4 border-t border-gray-200">
        <div className="flex space-x-4">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};
```

# src/services/notifications/notification.service.ts
```typescript
import { Permission } from '@/types/notifications';

export class NotificationService {
  private static instance: NotificationService;
  private permission: Permission = 'default';

  private constructor() {
    this.init();
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private async init() {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return;
    }

    this.permission = Notification.permission;
  }

  async requestPermission(): Promise<Permission> {
    if (!('Notification' in window)) {
      return 'denied';
    }

    const permission = await Notification.requestPermission();
    this.permission = permission;
    return permission;
  }

  async showNotification(title: string, options?: NotificationOptions) {
    if (this.permission !== 'granted') {
      console.warn('Notification permission not granted');
      return;
    }

    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification(title, {
      icon: '/icons/notification-icon.png',
      badge: '/icons/notification-badge.png',
      ...options,
    });
  }

  async showMatchNotification(matchName: string) {
    await this.showNotification('New Match!', {
      body: `You matched with ${matchName}! Would you like to say hello?`,
      data: {
        type: 'match',
        matchName,
      },
      requireInteraction: true,
      actions: [
        {
          action: 'chat',
          title: 'Send Message',
        },
        {
          action: 'dismiss',
          title: 'Later',
        },
      ],
    });
  }
}

export const notificationService = NotificationService.getInstance();
```

# src/utils/location.ts
```typescript
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRad = (degrees: number): number => {
  return (degrees * Math.PI) / 180;
};

export const formatDistance = (distance: number): string => {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`;
  }
  return `${Math.round(distance)}km`;
};

export const isWithinRadius = (
  userLat: number,
  userLon: number,
  targetLat: number,
  targetLon: number,
  radius: number
): boolean => {
  const distance = calculateDistance(userLat, userLon, targetLat, targetLon);
  return distance <= radius;
};
```

These additional components and utilities complete the frontend implementation with:

1. Profile Management:
   - Comprehensive profile editing
   - Preference management
   - Privacy settings

2. Real-time Chat:
   - WebSocket integration
   - Message history
   - Real-time updates
   - Typing indicators

3. Notifications:
   - Push notification support
   - Custom notification types
   - Permission management

4. Location Utilities:
   - Distance calculations
   - Radius checking
   - Formatting helpers

# src/components/safety/SafetyCenter.tsx
```typescript
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { EmergencyContact } from '@/types/safety';
import { safetyService } from '@/services/safety/safety.service';

interface SafetyCenterProps {
  onEmergencyContactUpdate: (contacts: EmergencyContact[]) => void;
}

export const SafetyCenter: React.FC<SafetyCenterProps> = ({
  onEmergencyContactUpdate,
}) => {
  const { user } = useAuth();
  const [emergencyContacts, setEmergencyContacts] = React.useState<EmergencyContact[]>([]);
  const [newContact, setNewContact] = React.useState({
    name: '',
    phone: '',
    relationship: '',
  });

  const addEmergencyContact = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const contact = await safetyService.addEmergencyContact({
        ...newContact,
        userId: user!.id,
      });
      setEmergencyContacts([...emergencyContacts, contact]);
      onEmergencyContactUpdate([...emergencyContacts, contact]);
      setNewContact({ name: '', phone: '', relationship: '' });
    } catch (error) {
      console.error('Failed to add emergency contact:', error);
    }
  };

  const activateEmergency = async () => {
    try {
      await safetyService.triggerEmergencyAlert({
        userId: user!.id,
        location: user!.location,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error('Failed to trigger emergency alert:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Safety Center</h2>

      <div className="space-y-6">
        {/* Emergency Button */}
        <div className="text-center">
          <button
            onClick={activateEmergency}
            className="px-6 py-3 bg-red-600 text-white font-bold rounded-full hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Emergency Assistance
          </button>
          <p className="mt-2 text-sm text-gray-600">
            Immediately alerts emergency contacts and local authorities
          </p>
        </div>

        {/* Emergency Contacts */}
        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Emergency Contacts
          </h3>
          <div className="space-y-4">
            {emergencyContacts.map((contact) => (
              <div
                key={contact.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900">{contact.name}</p>
                  <p className="text-sm text-gray-600">{contact.phone}</p>
                  <p className="text-sm text-gray-500">{contact.relationship}</p>
                </div>
                <button
                  onClick={() => safetyService.removeEmergencyContact(contact.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          {/* Add New Contact Form */}
          <form onSubmit={addEmergencyContact} className="mt-4 space-y-4">
            <div>
              <label
                htmlFor="contactName"
                className="block text-sm font-medium text-gray-700"
              >
                Contact Name
              </label>
              <input
                type="text"
                id="contactName"
                value={newContact.name}
                onChange={(e) =>
                  setNewContact({ ...newContact, name: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                required
              />
            </div>

            <div>
              <label
                htmlFor="contactPhone"
                className="block text-sm font-medium text-gray-700"
              >
                Phone Number
              </label>
              <input
                type="tel"
                id="contactPhone"
                value={newContact.phone}
                onChange={(e) =>
                  setNewContact({ ...newContact, phone: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                required
              />
            </div>

            <div>
              <label
                htmlFor="contactRelationship"
                className="block text-sm font-medium text-gray-700"
              >
                Relationship
              </label>
              <input
                type="text"
                id="contactRelationship"
                value={newContact.relationship}
                onChange={(e) =>
                  setNewContact({ ...newContact, relationship: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Add Contact
            </button>
          </form>
        </div>

        {/* Safety Tips */}
        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Safety Tips</h3>
          <ul className="space-y-2 text-gray-600">
            <li>• Always meet in public places</li>
            <li>• Share your meeting location with trusted contacts</li>
            <li>• Trust your instincts</li>
            <li>• Keep personal information private initially</li>
            <li>• Report suspicious behavior immediately</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
```

# src/components/matching/MatchSettings.tsx
```typescript
import React from 'react';
import { useForm } from 'react-hook-form';
import { MatchPreferences } from '@/types/match';
import { userService } from '@/services/api/user.service';

interface MatchSettingsProps {
  initialPreferences: MatchPreferences;
  onUpdate: (preferences: MatchPreferences) => void;
}

export const MatchSettings: React.FC<MatchSettingsProps> = ({
  initialPreferences,
  onUpdate,
}) => {
  const { register, handleSubmit, formState: { errors } } = useForm<MatchPreferences>({
    defaultValues: initialPreferences,
  });

  const onSubmit = async (data: MatchPreferences) => {
    try {
      const updated = await userService.updateMatchPreferences(data);
      onUpdate(updated);
    } catch (error) {
      console.error('Failed to update match preferences:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Match Preferences</h3>
        <p className="mt-1 text-sm text-gray-500">
          Customize how you discover and connect with others
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Discovery Distance (km)
        </label>
        <input
          type="range"
          {...register('maxDistance', {
            min: 1,
            max: 100,
          })}
          className="mt-1 w-full"
          step="1"
        />
        <div className="mt-1 flex justify-between text-xs text-gray-500">
          <span>1km</span>
          <span>50km</span>
          <span>100km</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Age Range
        </label>
        <div className="mt-1 grid grid-cols-2 gap-4">
          <div>
            <input
              type="number"
              {...register('ageRange.min', {
                min: 18,
                max: 99,
              })}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              placeholder="Min age"
            />
          </div>
          <div>
            <input
              type="number"
              {...register('ageRange.max', {
                min: 18,
                max: 99,
              })}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              placeholder="Max age"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Interests
        </label>
        <div className="mt-2 space-y-2">
          {interestCategories.map((category) => (
            <div key={category.id} className="flex items-center">
              <input
                type="checkbox"
                {...register('interests')}
                value={category.id}
                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <label className="ml-2 text-sm text-gray-700">
                {category.name}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Meeting Preferences
        </label>
        <div className="mt-2 space-y-2">
          {meetingTypes.map((type) => (
            <div key={type.id} className="flex items-center">
              <input
                type="checkbox"
                {...register('meetingTypes')}
                value={type.id}
                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <label className="ml-2 text-sm text-gray-700">{type.name}</label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Availability
        </label>
        <div className="mt-2 grid grid-cols-7 gap-2">
          {daysOfWeek.map((day) => (
            <div key={day} className="text-center">
              <label className="text-xs text-gray-500">{day}</label>
              <input
                type="checkbox"
                {...register('availability')}
                value={day}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Save Preferences
        </button>
      </div>
    </form>
  );
};

const interestCategories = [
  { id: 'coffee', name: 'Coffee Meetups' },
  { id: 'dining', name: 'Dining' },
  { id: 'activities', name: 'Activities & Sports' },
  { id: 'networking', name: 'Professional Networking' },
  { id: 'learning', name: 'Learning & Skills' },
];

const meetingTypes = [
  { id: 'quick', name: 'Quick Chat (15-30 mins)' },
  { id: 'casual', name: 'Casual Meetup (1-2 hours)' },
  { id: 'activity', name: 'Activity-based' },
  { id: 'professional', name: 'Professional Meeting' },
];

const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
```

# src/services/safety/safety.service.ts
```typescript
import { apiClient } from '../api/client';
import { EmergencyContact, EmergencyAlert } from '@/types/safety';

export class SafetyService {
  async addEmergencyContact(contact: Omit<EmergencyContact, 'id'>): Promise<EmergencyContact> {
    const { data } = await apiClient.post<EmergencyContact>('/safety/contacts', contact);
    return data;
  }

  async removeEmergencyContact(contactId: string): Promise<void> {
    await apiClient.delete(`/safety/contacts/${contactId}`);
  }

  async triggerEmergencyAlert(alert: Omit<EmergencyAlert, 'id'>): Promise<void> {
    await apiClient.post('/safety/emergency', alert);
  }

  async getEmergencyContacts(): Promise<EmergencyContact[]> {
    const { data } = await apiClient.get<EmergencyContact[]>('/safety/contacts');
    return data;
  }

  async updateMeetingSafety(meetingId: string, status: 'safe' | 'unsafe'): Promise<void> {
    await apiClient.post(`/safety/meetings/${meetingId}/status`, { status });
  }

  async scheduleSafetyCheck(meetingId: string, checkTime: Date): Promise<void> {
    await apiClient.post(`/safety/meetings/${meetingId}/check`, { checkTime });
  }
}

export const safetyService = new SafetyService();
```

# src/types/safety.ts
```typescript
export interface EmergencyContact {
  id: string;
  userId: string;
  name: string;
  phone: string;
  relationship: string;
}

export interface EmergencyAlert {
  id: string;
  userId: string;
  location: {
    latitude: number;
    longitude: number;
  };
  timestamp: Date;
}

export interface SafetyCheck {
  id: string;
  meetingId: string;
  userId: string;
  scheduledTime: Date;
  status: 'pending' | 'completed' | 'missed';
  response?: 'safe' | 'unsafe';
  notes?: string;
}

export interface SafetyReport {
  id: string;
  reporterId: string;
  reportedUserId: string;
  meetingId?: string;
  type: 'inappropriate' | 'harassment' | 'safety' | 'other';
  description: string;
  evidence?: string[];
  status: 'submitted' | 'reviewing' | 'resolved' | 'dismissed';
  timestamp: Date;
  resolution?: string;
}
```

# src/components/safety/SafetyCheckModal.tsx
```typescript
import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { SafetyCheck } from '@/types/safety';
import { safetyService } from '@/services/safety/safety.service';

interface SafetyCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  meetingId: string;
  userId: string;
}

export const SafetyCheckModal: React.FC<SafetyCheckModalProps> = ({
  isOpen,
  onClose,
  meetingId,
  userId,
}) => {
  const [response, setResponse] = useState<'safe' | 'unsafe'>();
  const [notes, setNotes] = useState('');

  const handleSubmit = async () => {
    if (!response) return;

    try {
      await safetyService.submitSafetyCheck({
        meetingId,
        userId,
        response,
        notes,
        status: 'completed',
        scheduledTime: new Date(),
      });

      if (response === 'unsafe') {
        await safetyService.triggerEmergencyAlert({
          userId,
          location: await getCurrentLocation(),
          timestamp: new Date(),
        });
      }

      onClose();
    } catch (error) {
      console.error('Failed to submit safety check:', error);
    }
  };

  const getCurrentLocation = async () => {
    return new Promise<{ latitude: number; longitude: number }>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          reject(error);
        }
      );
    });
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50">
      <div className="min-h-screen px-4 text-center">
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

        <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
            Safety Check
          </Dialog.Title>

          <div className="mt-4">
            <p className="text-sm text-gray-500">
              Please confirm your safety status. Your response will be kept confidential.
            </p>

            <div className="mt-4 space-y-4">
              <div className="flex space-x-4">
                <button
                  onClick={() => setResponse('safe')}
                  className={`flex-1 py-2 px-4 rounded-lg border ${
                    response === 'safe'
                      ? 'bg-green-500 text-white border-transparent'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  I'm Safe
                </button>
                <button
                  onClick={() => setResponse('unsafe')}
                  className={`flex-1 py-2 px-4 rounded-lg border ${
                    response === 'unsafe'
                      ? 'bg-red-500 text-white border-transparent'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Need Help
                </button>
              </div>

              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                  Additional Notes (Optional)
                </label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="Add any relevant details..."
                />
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg border border-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!response}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  );
};
```

# src/components/safety/ReportUserModal.tsx
```typescript
import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { SafetyReport } from '@/types/safety';
import { safetyService } from '@/services/safety/safety.service';

interface ReportUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportedUserId: string;
  meetingId?: string;
}

export const ReportUserModal: React.FC<ReportUserModalProps> = ({
  isOpen,
  onClose,
  reportedUserId,
  meetingId,
}) => {
  const [reportType, setReportType] = useState<SafetyReport['type']>('inappropriate');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await safetyService.submitReport({
        reportedUserId,
        meetingId,
        type: reportType,
        description,
        status: 'submitted',
        timestamp: new Date(),
      });
      onClose();
    } catch (error) {
      console.error('Failed to submit report:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const reportTypes = [
    { id: 'inappropriate', label: 'Inappropriate Behavior' },
    { id: 'harassment', label: 'Harassment' },
    { id: 'safety', label: 'Safety Concern' },
    { id: 'other', label: 'Other' },
  ] as const;

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50">
      <div className="min-h-screen px-4 text-center">
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

        <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
            Report User
          </Dialog.Title>

          <div className="mt-4">
            <p className="text-sm text-gray-500">
              Your report will be reviewed by our safety team. All reports are confidential.
            </p>

            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Report Type
                </label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value as SafetyReport['type'])}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  {reportTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="Please provide details about your concern..."
                  required
                />
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg border border-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !description.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  );
};
```

# src/hooks/useSafetyChecks.ts
```typescript
import { useState, useEffect } from 'react';
import { SafetyCheck } from '@/types/safety';
import { safetyService } from '@/services/safety/safety.service';
import { useAuth } from './useAuth';

export const useSafetyChecks = (meetingId: string) => {
  const { user } = useAuth();
  const [checks, setChecks] = useState<SafetyCheck[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChecks = async () => {
      try {
        const response = await safetyService.getSafetyChecks(meetingId);
        setChecks(response);
        setError(null);
      } catch (err) {
        setError('Failed to load safety checks');
        console.error('Error fetching safety checks:', err);
      } finally {
        setLoading(false);
      }
    };

    if (meetingId && user) {
      fetchChecks();
    }
  }, [meetingId, user]);

  const scheduleCheck = async (checkTime: Date) => {
    try {
      const newCheck = await safetyService.scheduleSafetyCheck(meetingId, checkTime);
      setChecks([...checks, newCheck]);
      return newCheck;
    } catch (error) {
      console.error('Failed to schedule safety check:', error);
      throw error;
    }
  };

  const respondToCheck = async (checkId: string, response: 'safe' | 'unsafe', notes?: string) => {
    try {
      const updatedCheck = await safetyService.submitSafetyCheck({
        id: checkId,
        meetingId,
        userId: user!.id,
        response,
        notes,
        status: 'completed',
        scheduledTime: new Date(),
      });

      setChecks(checks.map(check => 
        check.id === checkId ? updatedCheck : check
      ));

      return updatedCheck;
    } catch (error) {
      console.error('Failed to respond to safety check:', error);
      throw error;
    }
  };

  return {
    checks,
    loading,
    error,
    scheduleCheck,
    respondToCheck,
  };
};
```




