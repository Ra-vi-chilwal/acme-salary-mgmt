FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

# Seed on first boot if the db file doesn't exist yet, then start.
# Keeping this as an explicit script (not baked into CMD) so it's
# obvious what's happening when you read the Dockerfile.
ENV PORT=4000
EXPOSE 4000

CMD sh -c "test -f salary.sqlite || npm run seed; node src/server.js"
