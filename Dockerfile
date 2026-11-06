# CarGawy production image (Node 22, Debian slim — sharp ships prebuilt binaries for glibc)
FROM node:22-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./
RUN npm ci

FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# The build prerenders public pages, so DATABASE_URL must point to a reachable database at build time.
ARG DATABASE_URL
ARG NEXT_PUBLIC_SITE_URL
ENV DATABASE_URL=$DATABASE_URL NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL NEXT_TELEMETRY_DISABLED=1
RUN npx prisma generate && npx next build

FROM node:22-bookworm-slim AS run
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000
RUN useradd --system --uid 1001 cargawy
COPY --from=build --chown=cargawy /app ./
USER cargawy
EXPOSE 3000
# Apply pending migrations (non-destructive), then start.
CMD ["sh", "-c", "npx prisma migrate deploy && npx next start -p ${PORT}"]
