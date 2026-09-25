FROM node:22-alpine
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev socket.io@4.8.1
COPY src ./src
RUN npm install -g tsx
EXPOSE 5000
CMD ["tsx", "src/index.ts"]