# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build the application
ENV NEXT_PUBLIC_API_URL=""
RUN npm run build

# Production stage with nginx
FROM nginx:alpine AS runner

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built Next.js app
COPY --from=builder /app/.next/static /app/.next/static
COPY --from=builder /app/public /app/public
COPY --from=builder /app/.next/standalone /app

# Install Node.js for Next.js server
RUN apk add --no-cache nodejs

# Create startup script
RUN echo '#!/bin/sh' > /start.sh && \
    echo 'cd /app && node server.js &' >> /start.sh && \
    echo 'nginx -g "daemon off;"' >> /start.sh && \
    chmod +x /start.sh

EXPOSE 80

CMD ["/start.sh"]
