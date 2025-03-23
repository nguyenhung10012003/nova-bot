FROM node:20-alpine AS base

RUN apk update && apk upgrade && apk add --no-cache libc6-compat && apk add dumb-init

FROM base AS builder
WORKDIR /app

RUN yarn global add turbo
COPY . .
RUN turbo prune crawler --docker

FROM base AS installer
WORKDIR /app
# First install dependencies (as they change less often)
COPY --from=builder /app/out/json/ .
RUN yarn install --frozen-lockfile
# Build the project and its dependencies
COPY --from=builder /app/out/full/ .

RUN yarn turbo build --filter=crawler...

FROM base AS runner
WORKDIR /app

COPY --from=installer /app .

ENV PORT 4000
EXPOSE 4000
CMD node apps/crawler/dist/server.js
