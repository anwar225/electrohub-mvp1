# Build stage
FROM node:18-alpine

WORKDIR /app

# Installe OpenSSL et dépendances
RUN apk add --no-cache openssl openssl-dev

# Copy files
COPY package*.json ./
COPY prisma ./prisma

# Install dependencies
RUN npm install

# Copy rest of the app
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Expose port
EXPOSE 3000

# Start
CMD ["npm", "start"]