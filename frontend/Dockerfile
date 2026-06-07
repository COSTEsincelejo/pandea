FROM node:20-slim

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY .env ./
COPY . .

ENV VITE_API_URL=https://humble-umbrella-g46xv5jggqw72pg9-4000.app.github.dev/api

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
