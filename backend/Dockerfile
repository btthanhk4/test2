# -------- Build stage --------
FROM node:20-alpine AS build
WORKDIR /app

# Copy file định nghĩa dependencies
COPY package.json package-lock.json ./

# Cài dependencies (production only)
RUN npm ci --omit=dev

# Copy toàn bộ source code
COPY . .

# -------- Production stage --------
FROM node:20-alpine
WORKDIR /app

# Copy app và node_modules từ build stage
COPY --from=build /app ./

# Mở port
EXPOSE 3000

# Start app
CMD ["npm", "start"]
