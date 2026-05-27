# --- STAGE 1: Build ---
FROM node:18-alpine as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# --- STAGE 2: Production Server ---
FROM nginx:stable-alpine
# Copy the build folder from Stage 1 to Nginx
COPY --from=build-stage /app/build /usr/share/nginx/html

# Copy a custom nginx config to handle React Router (important!)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]