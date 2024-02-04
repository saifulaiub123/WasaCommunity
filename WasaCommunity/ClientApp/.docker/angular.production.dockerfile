# Stage 1
FROM node:8-alpine as builder
COPY package.json package-lock.json ./
RUN npm set progress=false && npm config set depth 0 && npm cache clean --force
RUN npm i && mkdir /app && cp -R ./node_modules ./app
WORKDIR /app
COPY . .
RUN npm run build-prod -- --prod --configuration production

# Stage 2
FROM nginx:1.13.3-alpine
COPY nginx-custom.conf /etc/nginx/conf.d/
RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /app/dist /usr/share/nginx/html
CMD ["nginx", "-g", "daemon off;"]
