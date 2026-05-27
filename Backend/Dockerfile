# 1. Use Node 20 explicitly to satisfy the '@google/genai' requirement
FROM node:20-slim

# Set the working directory
WORKDIR /app

# Copy package files first (for better caching/faster builds)
COPY package*.json ./

# Install dependencies
# We use 'npm install' instead of '--production' during build 
# to ensure all tools needed for the build process are present
RUN npm install

# Copy the rest of your application code
COPY . .

# Expose the port your app listens on
EXPOSE 3000

# 2. Use 'npm start' so it matches exactly what Render and your package.json expect
CMD ["npm", "start"]