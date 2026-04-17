FROM oven/bun:1

WORKDIR /usr/src/app

COPY ./packages ./packages
COPY ./bun.lock ./bun.lock

COPY ./package.json ./package.json
COPY ./turbo.json ./turbo.json
COPY ./prisma ./prisma
COPY ./prisma.config.ts ./prisma.config.ts

COPY ./apps/websocket ./apps/websocket

RUN bun install
RUN bunx prisma generate

EXPOSE 8081

CMD ["bun", "run", "start:websocket"]