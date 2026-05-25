FROM node:20-alpine AS base
WORKDIR /app
COPY web/package.json web/package-lock.json ./
RUN npm ci

FROM base AS production
COPY web/ ./
RUN npm run build
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
EXPOSE 3000
CMD ["npm", "start"]
