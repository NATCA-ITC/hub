FROM node:22-slim AS build
WORKDIR /app

# GitHub Packages auth for @natca-itc/ui-shell
ARG NPM_TOKEN
RUN echo "@natca-itc:registry=https://npm.pkg.github.com" > .npmrc && \
    echo "//npm.pkg.github.com/:_authToken=${NPM_TOKEN}" >> .npmrc

COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

COPY . .
RUN npm run build && rm -f .npmrc

FROM node:22-slim
WORKDIR /app

COPY package.json package-lock.json ./

ARG NPM_TOKEN
RUN echo "@natca-itc:registry=https://npm.pkg.github.com" > .npmrc && \
    echo "//npm.pkg.github.com/:_authToken=${NPM_TOKEN}" >> .npmrc && \
    npm ci --omit=dev --legacy-peer-deps && \
    rm -f .npmrc

COPY --from=build /app/dist ./dist
COPY server ./server

ENV NODE_ENV=production
ENV PORT=1301
EXPOSE 1301

CMD ["node", "server/index.js"]
