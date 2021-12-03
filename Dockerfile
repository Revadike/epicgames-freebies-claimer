# Builder stage
FROM node:16-alpine3.12 as builder
# Install dependencies for building node modules
# python3, g++, make: required by node-gyp
# git: required by npm
WORKDIR /app
COPY ./package.json ./package.json
RUN apk add --no-cache --virtual build-deps \
    python3=~3.8 \
    make=~4.3 \
    g++=~9.3 \
    git=~2.26 \
    && npm install --only=production \
    && apk del build-deps

# App stage
FROM node:16-alpine3.12 as app

WORKDIR /app
COPY . /app
COPY --from=builder /app/node_modules ./node_modules

CMD ["npm", "start", "--no-update-notifier"]
