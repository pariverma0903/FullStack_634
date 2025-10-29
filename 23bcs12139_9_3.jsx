//Backend — Node/Express

// simple Express backend with optional MongoDB
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const port = process.env.PORT || 4000;
const mongoUri = process.env.MONGO_URI || null;

let useMongo = false;
let Item;

async function initDb() {
  if (!mongoUri) {
    console.log('No MONGO_URI provided — using in-memory store');
    return;
  }
  try {
    const mongoose = require('mongoose');
    await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
    useMongo = true;
    const itemSchema = new mongoose.Schema({ text: String }, { timestamps: true });
    Item = mongoose.model('Item', itemSchema);
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('MongoDB connection failed, falling back to memory store', err);
  }
}

const memoryStore = [];

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.get('/api/items', async (req, res) => {
  if (useMongo) {
    const items = await Item.find().sort({ createdAt: -1 }).lean();
    return res.json(items);
  }
  res.json(memoryStore.slice().reverse());
});

app.post('/api/items', async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'text required' });

  if (useMongo) {
    const item = await Item.create({ text });
    return res.status(201).json(item);
  }

  const item = { id: memoryStore.length + 1, text, createdAt: new Date() };
  memoryStore.push(item);
  res.status(201).json(item);
});

app.get('/', (req, res) => res.send('Backend root - try /api/health'));

initDb().then(() => {
  app.listen(port, () => console.log(`API listening on port ${port}`));
});


//package.json

{
  "name": "simple-express-backend",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "body-parser": "^1.20.2",
    "express": "^4.18.2"
  },
  "optionalDependencies": {
    "mongoose": "^7.0.0"
  }
}


//Dockerfile (backend)

FROM node:18-alpine

WORKDIR /app

# copy package & install (optional deps not installed by default - but we include optionalDependencies)
COPY package*.json ./
RUN npm ci --production

# copy app
COPY . .

EXPOSE 4000

CMD ["node", "server.js"]


//2) Frontend — React (Create React App minimal)
import React, { useEffect, useState } from "react";

function App() {
  const [items, setItems] = useState([]);
  const [text, setText] = useState("");

  async function load() {
    const res = await fetch('/api/items');
    const data = await res.json();
    setItems(data);
  }

  useEffect(() => { load(); }, []);

  async function add(e) {
    e.preventDefault();
    if (!text) return;
    await fetch('/api/items', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ text })
    });
    setText('');
    load();
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>React + Express Demo</h1>
      <form onSubmit={add}>
        <input value={text} onChange={e => setText(e.target.value)} placeholder="New item" />
        <button type="submit">Add</button>
      </form>
      <ul>
        {items.map((it, i) => <li key={i}>{it.text}</li>)}
      </ul>
    </div>
  );
}

export default App;


//package.json (frontend)

{
  "name": "simple-react-frontend",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-scripts": "5.0.1"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build"
  }
}


//Dockerfile (multi-stage, production)

# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage: serve with nginx
FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
# If your backend is on a different host, you must configure API proxy or CORS.
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]


//.dockerignore

node_modules
build
.dockerignore
Dockerfile
.git


//CloudFormation (YAML) — ALB + ASG with EC2 instances running the backend Docker container

AWSTemplateFormatVersion: '2010-09-09'
Description: ALB + ASG running Docker backend containers (simple demo)

Parameters:
  KeyName:
    Type: AWS::EC2::KeyPair::KeyName
  InstanceType:
    Type: String
    Default: t3.micro
  SSHLocation:
    Type: String
    Default: 0.0.0.0/0
  DockerImage:
    Type: String
    Description: "Docker image (e.g. myuser/simple-backend:latest)"
  AMI:
    Type: AWS::EC2::Image::Id
    Description: "AMI ID for EC2 instances (Amazon Linux 2 recommended)"

Resources:
  VPC:
    Type: AWS::EC2::VPC
    Properties:
      CidrBlock: 10.0.0.0/16
      EnableDnsSupport: true
      EnableDnsHostnames: true
      Tags: [{Key: Name, Value: demo-vpc}]

  PublicSubnet1:
    Type: AWS::EC2::Subnet
    Properties:
      VpcId: !Ref VPC
      CidrBlock: 10.0.1.0/24
      AvailabilityZone: !Select [0, !GetAZs '']
      Tags: [{Key: Name, Value: public-subnet-1}]

  PublicSubnet2:
    Type: AWS::EC2::Subnet
    Properties:
      VpcId: !Ref VPC
      CidrBlock: 10.0.2.0/24
      AvailabilityZone: !Select [1, !GetAZs '']
      Tags: [{Key: Name, Value: public-subnet-2}]

  InternetGateway:
    Type: AWS::EC2::InternetGateway

  AttachGateway:
    Type: AWS::EC2::VPCGatewayAttachment
    Properties:
      VpcId: !Ref VPC
      InternetGatewayId: !Ref InternetGateway

  PublicRouteTable:
    Type: AWS::EC2::RouteTable
    Properties:
      VpcId: !Ref VPC

  DefaultPublicRoute:
    Type: AWS::EC2::Route
    DependsOn: AttachGateway
    Properties:
      RouteTableId: !Ref PublicRouteTable
      DestinationCidrBlock: 0.0.0.0/0
      GatewayId: !Ref InternetGateway

  SubnetRouteTableAssociation1:
    Type: AWS::EC2::SubnetRouteTableAssociation
    Properties:
      SubnetId: !Ref PublicSubnet1
      RouteTableId: !Ref PublicRouteTable

  SubnetRouteTableAssociation2:
    Type: AWS::EC2::SubnetRouteTableAssociation
    Properties:
      SubnetId: !Ref PublicSubnet2
      RouteTableId: !Ref PublicRouteTable

  BackendSecurityGroup:
    Type: AWS::EC2::SecurityGroup
    Properties:
      GroupDescription: Allow traffic from ALB and SSH
      VpcId: !Ref VPC
      SecurityGroupIngress:
        - IpProtocol: tcp
          FromPort: 22
          ToPort: 22
          CidrIp: !Ref SSHLocation
        - IpProtocol: tcp
          FromPort: 4000
          ToPort: 4000
          SourceSecurityGroupId: !Ref ALBSecurityGroup
      SecurityGroupEgress:
        - IpProtocol: -1
          FromPort: 0
          ToPort: 65535
          CidrIp: 0.0.0.0/0

  ALBSecurityGroup:
    Type: AWS::EC2::SecurityGroup
    Properties:
      GroupDescription: Allow HTTP from internet
      VpcId: !Ref VPC
      SecurityGroupIngress:
        - IpProtocol: tcp
          FromPort: 80
          ToPort: 80
          CidrIp: 0.0.0.0/0
      SecurityGroupEgress:
        - IpProtocol: -1
          FromPort: 0
          ToPort: 65535
          CidrIp: 0.0.0.0/0

  ALB:
    Type: AWS::ElasticLoadBalancingV2::LoadBalancer
    Properties:
      Name: demo-alb
      Scheme: internet-facing
      Subnets:
        - !Ref PublicSubnet1
        - !Ref PublicSubnet2
      SecurityGroups: [!Ref ALBSecurityGroup]
      Type: application

  ALBTargetGroup:
    Type: AWS::ElasticLoadBalancingV2::TargetGroup
    Properties:
      Name: demo-targets
      Port: 4000
      Protocol: HTTP
      VpcId: !Ref VPC
      HealthCheckProtocol: HTTP
      HealthCheckPath: /api/health
      TargetType: instance
      HealthCheckIntervalSeconds: 10
      HealthCheckTimeoutSeconds: 5

  ALBListener:
    Type: AWS::ElasticLoadBalancingV2::Listener
    Properties:
      LoadBalancerArn: !Ref ALB
      Port: 80
      Protocol: HTTP
      DefaultActions:
        - Type: forward
          TargetGroupArn: !Ref ALBTargetGroup

  LaunchTemplate:
    Type: AWS::EC2::LaunchTemplate
    Properties:
      LaunchTemplateData:
        ImageId: !Ref AMI
        InstanceType: !Ref InstanceType
        KeyName: !Ref KeyName
        SecurityGroupIds:
          - !Ref BackendSecurityGroup
        UserData:
          Fn::Base64: !Sub |
            #!/bin/bash -xe
            yum update -y
            amazon-linux-extras install docker -y
            service docker start
            usermod -a -G docker ec2-user

            # Set environment variables if needed (example MONGO_URI)
            export MONGO_URI="${MONGO_URI:-}"
            # Pull and run container
            docker pull ${DockerImage}
            docker rm -f simple-backend || true
            docker run -d --name simple-backend -p 4000:4000 -e MONGO_URI="${MONGO_URI}" ${DockerImage}

  BackendASG:
    Type: AWS::AutoScaling::AutoScalingGroup
    Properties:
      DesiredCapacity: 2
      MinSize: 2
      MaxSize: 4
      VPCZoneIdentifier: [!Ref PublicSubnet1, !Ref PublicSubnet2]
      LaunchTemplate:
        LaunchTemplateId: !Ref LaunchTemplate
        Version: !GetAtt LaunchTemplate.LatestVersionNumber
      TargetGroupARNs:
        - !Ref ALBTargetGroup
      MetricsCollection:
        - Granularity: '1Minute'

Outputs:
  LoadBalancerDNS:
    Description: "ALB DNS name"
    Value: !GetAtt ALB.DNSName


//Example GitHub Actions workflow (CI/CD) to build and push Docker images to Docker Hub

name: Build and Push Docker images
on:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKERHUB_USER }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}

      - name: Build and push backend image
        uses: docker/build-push-action@v5
        with:
          context: ./backend
          push: true
          tags: ${{ secrets.DOCKERHUB_USER }}/simple-backend:latest

      - name: Build and push frontend image
        uses: docker/build-push-action@v5
        with:
          context: ./frontend
          file: ./frontend/Dockerfile
          push: true
          tags: ${{ secrets.DOCKERHUB_USER }}/simple-frontend:latest
