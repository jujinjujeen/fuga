FROM node:20-alpine

WORKDIR /app

COPY backend/package.json backend/package-lock.json ./
COPY config /config
COPY libs /libs
RUN npm install

COPY backend /app

RUN npx prisma generate

CMD sh -c "npx prisma migrate deploy && npm run dev"