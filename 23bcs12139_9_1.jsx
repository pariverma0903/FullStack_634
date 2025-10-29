//Step 1: Create a Simple React App
npx create-react-app my-react-app
cd my-react-app

//Step 2: Create a Multi-Stage Dockerfile
# -------------------------------
# Stage 1: Build the React app
# -------------------------------
FROM node:18 AS builder

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy all project files and build the app
COPY . .
RUN npm run build

# -------------------------------
# Stage 2: Serve the built app with Nginx
# -------------------------------
FROM nginx:alpine

# Remove default nginx static files and copy build output
RUN rm -rf /usr/share/nginx/html/



//Step 3: Create a .dockerignore File

  node_modules
.git
Dockerfile
.dockerignore
npm-debug.log
README.md
build
.env


//step 4 : Build the Docker Image
docker build -t react-multistage-app .


  //Step 5: Run the Container
  docker run -p 80:80 react-multistage-app

  

  
