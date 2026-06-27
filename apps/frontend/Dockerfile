# ---- Build stage ----
FROM node:20-slim AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Public env vars are inlined at build time.
ARG NEXT_PUBLIC_API_URL=http://localhost:4000
ARG NEXT_PUBLIC_SITE_URL=http://localhost:3000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL

RUN npm run build

# ---- Runtime stage ----
FROM node:20-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Next.js "standalone" output bundles only what's needed to run.
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public

EXPOSE 3000
CMD ["node", "server.js"]
