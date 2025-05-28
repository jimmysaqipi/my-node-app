FROM node:18 AS builder
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --only=production

# Runtime stage
FROM node:18
WORKDIR /usr/src/app
COPY . .
EXPOSE 8000
USER node
CMD ["npm", "start"]
