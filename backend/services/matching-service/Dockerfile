FROM elixir:1.14-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache build-base git

# Install hex + rebar
RUN mix local.hex --force && \
    mix local.rebar --force

# Copy mix files
COPY mix.exs mix.lock ./
COPY config config

# Install dependencies
RUN mix deps.get --only prod && \
    mix deps.compile

# Copy source code
COPY lib lib

# Compile for production
RUN MIX_ENV=prod mix release

# Final stage
FROM alpine:3.18

WORKDIR /app

# Install runtime dependencies
RUN apk add --no-cache libstdc++ openssl ncurses-libs

# Copy release from builder
COPY --from=builder /app/_build/prod/rel/matching_service ./

# Set user for security
RUN adduser -D -g '' appuser
USER appuser

EXPOSE 4000

CMD ["bin/matching_service", "start"]