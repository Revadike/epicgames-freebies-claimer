# Builder stage
FROM node:16-alpine3.13 as builder
# Install dependencies for building node modules
# python3, g++, make: required by node-gyp
# git: required by check-update-github
WORKDIR /app
COPY ./package.json ./package.json
RUN apk add --no-cache --virtual \
    .gyp \
    python3=~3.8 \
    make=~4.3 \
    g++=~10.2 \
    git=~2.30 \
    && npm install --only=production \
    && apk del .gyp

# App stage
FROM node:16-alpine3.13 as app

WORKDIR /app
COPY . /app
COPY --from=builder /app/node_modules ./node_modules

CMD ["npm", "start", "--no-update-notifier"]
