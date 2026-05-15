# Ignite DevOps Task – EKS Kubernetes Deployment (sample-test)

# Architecture Overview

The application is deployed on AWS using a scalable Kubernetes architecture:

- AWS EKS – Managed Kubernetes Cluster
- m7i-flex.large – Worker nodes
- Docker (multi-stage build) – Optimized container image
- Amazon ECR – Container registry
- Kubernetes – Deployment, Service, HPA, PDB, PriorityClass
- Kustomize – Manifest management
- AWS Load Balancer (ELB/NLB) – External traffic exposure
- Terraform – Infrastructure provisioning

---
# Tech Stack

- AWS EKS
- Terraform
- Docker
- Kubernetes
- Node.js
- AWS ECR
- Kustomize

---
 # Project Structure
```
sample-test/
├── server.js
├── package.json
├── Dockerfile
├── k8s/
│   └── base/
│       ├── deployment.yaml
│       ├── service.yaml
│       ├── hpa.yaml
│       ├── pdb.yaml
│       ├── priorityclass.yaml
│       └── kustomization.yaml
├── terraform/
│   ├── eks.tf
│   ├── vpc.tf
│   ├── providers.tf
│   └── outputs.tf

```
---

#  Features Implemented

-  8 running replicas of application
-  Horizontal Pod Autoscaler (CPU 50%, Memory 60%)
-  Rolling updates with zero downtime strategy
-  Minimum 5 pods always available (PDB)
-  PriorityClass for scheduling priority
-  LoadBalancer service for external access
-  Multi-stage Docker build for optimization
-  Infrastructure provisioned using Terraform

---
## 1. Create Infrastructure using Terraform
  
   ```
   - terraform init
   - terraform plan
   - terraform apply 
  ```
   <img width="1913" height="984" alt="image" src="https://github.com/user-attachments/assets/f74e878d-7fd7-48aa-ab97-270ca9b66e9d" />

## 2.  Connect To Cluster
  ``` 
  - aws eks update-kubeconfig --region <region> --name <cluster-name>
  ```
## 3. Verify:
 ```  
 - kubectl get nodes
```
## 4. Docker – Multi-stage Build
   write a multistage dockerfile for application.
   ```
   # build stage
    FROM node:18 AS builder
    WORKDIR /app
    COPY package.json .
    RUN npm install
    COPY . .

   # runtime stage
   FROM node:18-alpine
   WORKDIR /app
   COPY --from=builder /app .
   CMD ["node", "server.js"]

   
   # build stage
   FROM node:18 AS builder
   WORKDIR /app
   COPY package.json .
   RUN npm install
   COPY . .

   # runtime stage
   FROM node:18-alpine
   WORKDIR /app
   COPY --from=builder /app .
   CMD ["node", "server.js"]
  ```

## 5. Amazon ECR Setup
 ### 1.  Create repository
    
    - aws ecr create-repository <repository-name> sample-test region <region>
   
 ### 2. Login to ECR
    
    - aws ecr get-login-password --region <region> | docker login --username AWS --password-stdin <account-id>.dkr.ecr.<region>.amazonaws.com
    
 ### 3. BUILD + PUSH
   ```
   -  docker build -t sample-test .
   -  docker tag sample-test:latest <account-id>.dkr.ecr.<region>.amazonaws.com/sample-test:latest
   -  docker push <account-id>.dkr.ecr.<region>.amazonaws.com/sample-test:latest
  ```
<img width="1830" height="1004" alt="image" src="https://github.com/user-attachments/assets/85631c36-dc29-4717-a282-af1092c552c4" />

<img width="1910" height="494" alt="image" src="https://github.com/user-attachments/assets/22c32cda-d80e-4f04-82ba-9fdd995d5342" />


## 6. Deploy Kubernetes Manifests
    - kubectl apply -k k8s/base/
### Includes:
 ####  - Deployment
 ####  - Service
 ####  - HPA
 ####  - PDB
 ####  - PriorityClass

<img width="1727" height="293" alt="image" src="https://github.com/user-attachments/assets/9b6a2b04-27a6-44b9-b6b6-cb865e05e72d" />

## 7. VERIFY EVERYTHING
  #### Pods
  ``` 
  - kubectl get pods -o wide
  ```
<img width="1876" height="713" alt="image" src="https://github.com/user-attachments/assets/5a2baee6-9c26-46f4-b1f5-d96d57d9ea83" />

  #### Service (LoadBalancer)
  ``` 
  - kubectl get svc
  ```
<img width="1886" height="325" alt="image" src="https://github.com/user-attachments/assets/6104bc61-d7fa-47e1-8933-614c3d5813c9" />

  ####  HPA
  ``` 
  - kubectl get hpa
  ```
  <img width="1857" height="242" alt="image" src="https://github.com/user-attachments/assets/39cc1f62-4072-42a7-a899-a75b3dfe1145" />

  ####  PDB
  ``` 
  - kubectl get pdb
  ```
<img width="1813" height="172" alt="image" src="https://github.com/user-attachments/assets/3c40cb91-a833-482b-b59a-2fb31c0e9164" />

  ####  TEST AUTOSCALING
   ##### Generate load safely:
  ```
  - kubectl run load-generator --image=busybox --restart=Never -- sh -c "while true; do wget -q -O- http://sample-test-service:8080; done"
  ```
<img width="1920" height="206" alt="image" src="https://github.com/user-attachments/assets/c06ea4e6-d02e-4b70-bad9-53506ee95692" />

  ####  Watch scaling
  ``` 
  - kubectl get hpa -w
  ```
<img width="1920" height="235" alt="image" src="https://github.com/user-attachments/assets/ac275201-63a3-48e1-9ca0-3b3dd7c22ea2" />


#### Access Application
#### Open browser:
  ```  
  - http://<load-balancer-dns>:8080
  ```
<img width="1416" height="617" alt="image" src="https://github.com/user-attachments/assets/825750fa-6e97-4954-9d1b-d1b016d70eb3" />

