# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev || npm install --omit=dev
COPY . .

# Production stage
FROM node:20-alpine
WORKDIR /app
COPY --from=build /app ./
CMD ["npm", "start"]
