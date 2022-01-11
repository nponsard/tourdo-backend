FROM denoland/deno:alpine-1.17.2

COPY ./ /app

WORKDIR /app

RUN deno cache src/index.ts

EXPOSE 3000

CMD [ "deno","run","--allow-all", "src/index.ts" ]