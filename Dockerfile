FROM node:22-alpine
WORKDIR /app

RUN apk add --no-cache curl

COPY package*.json ./
RUN npm install

COPY . .

ENV NODE_ENV=development
ENV CHOKIDAR_USEPOLLING=true

EXPOSE 3001
CMD ["npm", "start", "--", "--host", "0.0.0.0"]
