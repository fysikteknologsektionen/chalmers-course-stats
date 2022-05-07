FROM node:16.15-bullseye as base

WORKDIR /usr/src/app

FROM base as dev


FROM base as build

COPY . .

RUN npm install
RUN npm run build

FROM base as prod

ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.9.0/wait /wait
RUN chmod +x /wait

RUN npm ci --only=production

COPY --from=build /usr/src/app/build build

CMD /wait && npm run db && node server.js