FROM node:21.7.1 as build

WORKDIR /app/

COPY [ "package.json", "package-lock.json", "tsconfig.json", "./" ]
RUN [ "npm", "ci", "--force" ]
RUN [ "npm", "audit", "fix", "--force", "--audit-level", "high" ]

COPY [ "./src", "./src" ]
RUN  [ "npm", "run", "compile" ]

RUN [ "npm", "prune", "--omit=dev", "--omit-peer" ]
RUN [ "rm", "-rf", "./src", "./tsconfig.json" ]


FROM node:21.7.1 as prod
ENV NODE_ENV=production

USER root
RUN [ "mkdir", "-p", "~/logs/" ]

WORKDIR /app/

COPY --from=build --chown=node:node [ "/app/", "/app/" ]
RUN [ "mv", "./dist", "./src" ]

USER node

CMD [ "npm", "run", "run-app" ]
