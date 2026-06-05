# =============================================================================
# Asicom — production container
#
# Multi-stage build:
#   - deps: install all workspace dependencies once (npm ci respects npm workspaces)
#   - build: compile @asicom/shared then next build the web app
#   - run: minimal runtime image with native tooling we need at runtime
#
# Native dependencies the runtime needs:
#   - better-sqlite3 — native module, must be built against the runtime libc/node
#   - libjpeg-turbo-progs — provides `jpegtran` for the rotate-photo Server Action
#
# Storage: this image keeps data on a mounted disk at /data (see render.yaml).
# DATABASE_PATH and UPLOAD_DIR are wired to point inside /data so they survive
# deploys / restarts.
# =============================================================================

FROM node:20-bookworm-slim AS deps
WORKDIR /app

# Native build deps for better-sqlite3. Removed in later stages.
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy the manifest set first so the npm cache layer is reusable.
COPY package.json package-lock.json ./
COPY apps/web/package.json apps/web/
COPY packages/shared/package.json packages/shared/
RUN npm ci --include=dev

# -----------------------------------------------------------------------------
FROM deps AS build
WORKDIR /app

COPY apps/web apps/web
COPY packages/shared packages/shared

# Compile the shared package, then build Next.
# (next.config.ts already transpilePackages: ["@asicom/shared"], but we still
# need the shared package's tsc --noEmit gate to pass.)
RUN npm run build

# -----------------------------------------------------------------------------
FROM node:20-bookworm-slim AS run
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3000 \
    HOST=0.0.0.0 \
    DATABASE_PATH=/data/asicom.db \
    UPLOAD_DIR=/data/uploads

# Runtime tooling: jpegtran for lossless JPEG rotation (the rotatePhoto action).
RUN apt-get update && apt-get install -y --no-install-recommends \
    libjpeg-turbo-progs \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Bring over only what the runtime needs: the built Next standalone output
# would be ideal but our config doesn't emit standalone, so copy the full
# build + node_modules.
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/packages ./packages
COPY --from=build /app/apps/web/.next ./apps/web/.next
COPY --from=build /app/apps/web/public ./apps/web/public
COPY --from=build /app/apps/web/package.json ./apps/web/package.json
COPY --from=build /app/apps/web/drizzle ./apps/web/drizzle
COPY --from=build /app/apps/web/next.config.ts ./apps/web/next.config.ts

# Persistent data dir gets created if the mounted disk is empty on first boot.
RUN mkdir -p /data/uploads

EXPOSE 3000
CMD ["npm", "run", "start", "-w", "web", "--", "-p", "3000", "-H", "0.0.0.0"]
