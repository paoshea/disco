# Required Files and Directories for Matching Service

## Missing Files and Directories

The following files and directories are referenced in the Dockerfile but are missing from the codebase:

### Required Files
1. `mix.lock`
   - Purpose: Lock file that contains exact versions of all dependencies
   - Status: Missing
   - Action Needed: Will be generated after running `mix deps.get`

### Required Directories
1. `config/`
   - Purpose: Contains configuration files for different environments (dev, test, prod)
   - Status: Directory missing
   - Required files typically include:
     - `config/config.exs` (base configuration)
     - `config/dev.exs` (development configuration)
     - `config/prod.exs` (production configuration)
     - `config/runtime.exs` (runtime configuration)

2. `lib/`
   - Purpose: Contains the main application source code
   - Status: Directory missing
   - Should contain:
     - Application logic
     - Modules
     - Supervisors
     - GenServers
     - Other Elixir code files

## Setup Instructions

1. First, ensure you have a proper `mix.exs` file with your project configuration

```elixir
defmodule MatchingService.MixProject do
  use Mix.Project

  def project do
    [
      app: :matching_service,
      version: "0.1.0",
      elixir: "~> 1.14",
      start_permanent: Mix.env() == :prod,
      deps: deps()
    ]
  end

  def application do
    [
      extra_applications: [:logger],
      mod: {MatchingService.Application, []}
    ]
  end

  defp deps do
    [
      # Add your dependencies here
      {:jason, "~> 1.4"},        # JSON encoding/decoding
      {:plug_cowboy, "~> 2.6"},  # HTTP server
      {:ecto_sql, "~> 3.10"},    # Database wrapper
      {:postgrex, "~> 0.17"}     # PostgreSQL driver
    ]
  end
end
```

2. Run `mix deps.get` to generate the `mix.lock` file and compile the project:

3. File Structure (Standard Elixir Project)
```
matching-service/
├── config/                           # Configuration directory
│   ├── config.exs                    # Base configuration
│   ├── dev.exs                       # Development environment config
│   ├── prod.exs                      # Production environment config
│   └── runtime.exs                   # Runtime configuration
├── lib/                             # Source code directory
│   └── matching_service/            # Main application directory
│       ├── application.ex           # Application startup and supervision
│       ├── router.ex               # HTTP routing and endpoints
│       ├── models/                 # Data models and schemas
│       │   └── match.ex           # Match entity schema
│       ├── services/              # Business logic services
│       │   ├── matcher.ex        # Matching algorithm implementation
│       │   └── scoring.ex        # Score calculation service
│       └── utils/                # Utility modules
│           └── validators.ex     # Input validation functions
├── Dockerfile
├── mix.exs                         # Project configuration
└── mix.lock                        # Dependencies lock file
```

## Detailed File Contents

### Configuration Files (config/)

1. `config/config.exs` - Base configuration
```elixir
import Config

# Database configuration
config :matching_service,
  ecto_repos: [MatchingService.Repo]

# HTTP server configuration
config :matching_service, MatchingService.Endpoint,
  http: [port: 4000],
  server: true

# Import environment specific config
import_config "#{config_env()}.exs"
```

2. `config/dev.exs` - Development configuration
```elixir
import Config

config :matching_service, MatchingService.Repo,
  database: "matching_service_dev",
  username: "postgres",
  password: "postgres",
  hostname: "localhost",
  pool_size: 10
```

### Source Code Files (lib/)

1. `lib/matching_service/application.ex` - Application startup
```elixir
defmodule MatchingService.Application do
  use Application

  @impl true
  def start(_type, _args) do
    children = [
      MatchingService.Repo,
      {Plug.Cowboy, scheme: :http, plug: MatchingService.Router, options: [port: 4000]}
    ]

    opts = [strategy: :one_for_one, name: MatchingService.Supervisor]
    Supervisor.start_link(children, opts)
  end
end
```

2. `lib/matching_service/router.ex` - HTTP routing
```elixir
defmodule MatchingService.Router do
  use Plug.Router

  plug :match
  plug :dispatch
  plug Plug.Parsers,
    parsers: [:json],
    pass: ["application/json"],
    json_decoder: Jason

  # Health check endpoint
  get "/health" do
    send_resp(conn, 200, Jason.encode!(%{status: "ok"}))
  end

  # Match creation endpoint
  post "/matches" do
    # Implementation for match creation
    send_resp(conn, 201, Jason.encode!(%{message: "Match created"}))
  end

  match _ do
    send_resp(conn, 404, "Not found")
  end
end
```

3. `lib/matching_service/models/match.ex` - Match schema
```elixir
defmodule MatchingService.Models.Match do
  use Ecto.Schema
  import Ecto.Changeset

  schema "matches" do
    field :user_id, :string
    field :match_type, :string
    field :score, :float
    field :status, :string

    timestamps()
  end

  def changeset(match, attrs) do
    match
    |> cast(attrs, [:user_id, :match_type, :score, :status])
    |> validate_required([:user_id, :match_type])
  end
end
```

4. `lib/matching_service/services/matcher.ex` - Matching logic
```elixir
defmodule MatchingService.Services.Matcher do
  alias MatchingService.Models.Match
  alias MatchingService.Services.Scoring

  def create_match(user_id, criteria) do
    with {:ok, score} <- Scoring.calculate_match_score(criteria),
         {:ok, match} <- %Match{} |> Match.changeset(%{
           user_id: user_id,
           match_type: criteria.type,
           score: score,
           status: "pending"
         }) |> Repo.insert() do
      {:ok, match}
    end
  end
end
```

5. `lib/matching_service/services/scoring.ex` - Score calculation
```elixir
defmodule MatchingService.Services.Scoring do
  def calculate_match_score(criteria) do
    # Implement scoring algorithm based on criteria
    score = # ... scoring logic
    {:ok, score}
  end
end
```

6. `lib/matching_service/utils/validators.ex` - Input validation
```elixir
defmodule MatchingService.Utils.Validators do
  def validate_match_criteria(criteria) do
    # Implement validation logic
    case criteria do
      %{type: type} when type in ["quick", "detailed"] ->
        :ok
      _ ->
        {:error, "Invalid match type"}
    end
  end
end
```

Each file in the `lib/` directory serves a specific purpose in the application:
- `application.ex`: Manages application startup and supervision tree
- `router.ex`: Handles HTTP routing and API endpoints
- `models/`: Contains database schemas and changesets
- `services/`: Implements core business logic
- `utils/`: Houses helper functions and utilities

The modular structure allows for:
- Clear separation of concerns
- Easy testing and maintenance
- Scalable code organization
- Reusable components

4. Create the `config` directory with appropriate configuration files

### applications.ex

```elixir
defmodule MatchingService.Application do
  @moduledoc false
  use Application

  @impl true
  def start(_type, _args) do
    children = [
      MatchingService.Repo,
      {Plug.Cowboy, scheme: :http, plug: MatchingService.Router, options: [port: 4000]}
    ]

    opts = [strategy: :one_for_one, name: MatchingService.Supervisor]
    Supervisor.start_link(children, opts)
  end
end
```

### dev.exs

```elixir
import Config

config :matching_service, MatchingService.Repo,
  show_sensitive_data_on_connection_error: true,
  pool_size: 10
```

### prod.exs

```elixir
import Config

config :matching_service, MatchingService.Repo,
  pool_size: String.to_integer(System.get_env("POOL_SIZE") || "10"),
  ssl: true
```

### runtime.exs

```elixir
import Config

if config_env() == :prod do
  database_url =
    System.get_env("DATABASE_URL") ||
      raise """
      environment variable DATABASE_URL is missing.
      For example: ecto://USER:PASS@HOST/DATABASE
      """

  config :matching_service, MatchingService.Repo,
    url: database_url,
    pool_size: String.to_integer(System.get_env("POOL_SIZE") || "10")
end
```

5. Create the `lib` directory and add your application source code

### router.ex

```elixir
defmodule MatchingService.Router do
  use Plug.Router

  plug :match
  plug :dispatch
  plug Plug.Parsers,
    parsers: [:json],
    pass: ["application/json"],
    json_decoder: Jason

  get "/" do
    send_resp(conn, 200, "Matching Service is running!")
  end

  match _ do
    send_resp(conn, 404, "Not found")
  end
end
```

### config.exs

```elixir
import Config

config :matching_service,
  ecto_repos: [MatchingService.Repo]

config :matching_service, MatchingService.Repo,
  database: "matching_service",
  username: "postgres",
  password: "postgres",
  hostname: "localhost"

import_config "#{config_env()}.exs"
```
