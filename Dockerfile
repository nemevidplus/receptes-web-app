FROM node:18-alpine AS build-client
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY api/package*.json ./api/
RUN cd api && npm install --production
COPY api/ ./api/
COPY --from=build-client /app/client/build ./api/public

WORKDIR /app/api
EXPOSE 8080
CMD ["npm", "start"]
