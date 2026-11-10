# syntax=docker/dockerfile:1.7
ARG RUNTIME_IMAGE=xream/sub-store@sha256:2628d7582525055cf6752bb6b989f383bde68b7b988aa21fc08750505eeaa4b9

FROM node:24.22.1-alpine@sha256:06d7adf3e0ef61a13f1d28682726366f97a15aa1888c934d3ecec86c33918b53 AS frontend-build
WORKDIR /frontend-build
RUN npm install --global pnpm@11.0.9 --ignore-scripts
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
RUN pnpm fetch --frozen-lockfile
COPY . .
RUN --network=none pnpm install --offline --frozen-lockfile \
    && pnpm build

FROM ${RUNTIME_IMAGE}
# Replace only the frontend; keep the base image's backend, environment and startup unchanged.
RUN --network=none node -e "require('fs').rmSync('/opt/app/frontend', { recursive: true, force: true })"
COPY --from=frontend-build /frontend-build/dist/ /opt/app/frontend/
