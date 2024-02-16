FROM node:14.18.3

WORKDIR /app/backend

COPY backend/package*.json ./

RUN npm install

COPY backend .

EXPOSE 3000 

RUN npm run db:migrate

RUN npm run db:load
