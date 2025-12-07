FROM node:20-alpine
WORKDIR /app

COPY package*.json .
COPY tsconfig.json .
COPY . .

RUN npm ci --only=production

EXPOSE 19000
CMD ["npx", "expo", "start", "--tunnel"]
