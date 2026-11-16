# ---- Stage 1: install production dependencies ----
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev

# ---- Stage 2: runtime ----
FROM node:20-alpine
ENV NODE_ENV=production
ARG APP_VERSION=1.0.0
ARG CHART_LIB=chartjs-3
ENV APP_VERSION=$APP_VERSION CHART_LIB=$CHART_LIB
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY src ./src
USER node
EXPOSE 4003
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost:4003/health || exit 1
CMD ["node", "src/index.js"]
