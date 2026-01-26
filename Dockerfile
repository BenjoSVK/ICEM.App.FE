# Stage 1: Build
FROM node:16-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Accept build argument and set as environment variable
ARG REACT_APP_FAST_API_HOST=""
ENV REACT_APP_FAST_API_HOST=${REACT_APP_FAST_API_HOST}

COPY . .
RUN npm run build

CMD ["npm", "start"]

# Stage 2: Serve with Nginx
FROM nginx:stable-alpine

COPY --from=builder /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]