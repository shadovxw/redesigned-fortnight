# Build stage
FROM golang:1.24-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache gcc musl-dev

# Copy go mod files
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Ensure dependencies are tidy
RUN go mod tidy

# Build the binary with CGO disabled
RUN CGO_ENABLED=0 GOOS=linux go build -o echo-server cmd/server/main.go

# Production stage
FROM alpine:3.19

WORKDIR /app

# Install ffmpeg for audio merging
RUN apk add --no-cache ffmpeg ca-certificates

# Copy binary from builder
COPY --from=builder /app/echo-server .

# Create storage directory
RUN mkdir -p /app/storage

# Environment variables
ENV GIN_MODE=release
ENV PORT=8080
ENV STORAGE_PATH=/app/storage

# Expose port
EXPOSE 8080

# Run the application
CMD ["./echo-server"]
