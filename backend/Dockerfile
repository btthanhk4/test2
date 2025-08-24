# Build stage
FROM node:20-alpine AS build
WORKDIR /app

# copy file trước khi install
COPY package.json ./
COPY package-lock.json* ./

# nếu có package-lock.json thì npm ci, nếu không thì npm install
RUN if [ -f package-lock.json ]; then \
      npm ci --omit=dev; \
    else \
      npm install --omit=dev; \
    fi

COPY . .

# Production stage
FROM node:20-alpine
WORKDIR /app
COPY --from=build /app ./
CMD ["npm", "start"]
