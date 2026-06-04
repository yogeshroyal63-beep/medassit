FROM node:20-alpine

# Create a non-root user so the process doesn't run as root
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

# Give the non-root user ownership of the app directory
RUN chown -R appuser:appgroup /app

USER appuser

EXPOSE 5001

CMD ["npm", "start"]
