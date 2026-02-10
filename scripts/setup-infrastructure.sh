#!/bin/bash
set -e

# Infrastructure Setup Script
# Usage: ./setup-infrastructure.sh [environment]

ENVIRONMENT=${1:-production}

echo "=================================="
echo "BeeYield Infrastructure Setup"
echo "=================================="
echo "Environment: $ENVIRONMENT"
echo "=================================="

cd ../terraform

# Initialize Terraform
echo "Initializing Terraform..."
terraform init

# Validate configuration
echo "Validating Terraform configuration..."
terraform validate

# Plan infrastructure changes
echo "Planning infrastructure changes..."
terraform plan -var="environment=$ENVIRONMENT" -out=tfplan

# Confirm apply
read -p "Apply these changes? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo "Setup cancelled"
    exit 0
fi

# Apply infrastructure
echo "Applying infrastructure..."
terraform apply tfplan

# Get outputs
echo "=================================="
echo "Infrastructure Outputs:"
echo "=================================="
terraform output

# Configure kubectl
echo "Configuring kubectl..."
eval $(terraform output -raw configure_kubectl)

# Verify cluster access
echo "Verifying cluster access..."
kubectl get nodes

# Install NGINX Ingress Controller
echo "Installing NGINX Ingress Controller..."
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update
helm upgrade --install ingress-nginx ingress-nginx/ingress-nginx \
    --namespace ingress-nginx \
    --create-namespace \
    --set controller.service.type=LoadBalancer

# Install cert-manager
echo "Installing cert-manager..."
helm repo add jetstack https://charts.jetstack.io
helm repo update
helm upgrade --install cert-manager jetstack/cert-manager \
    --namespace cert-manager \
    --create-namespace \
    --set installCRDs=true

# Install metrics-server
echo "Installing metrics-server..."
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

# Create namespaces
echo "Creating namespaces..."
kubectl apply -f ../k8s/namespaces.yaml

echo "=================================="
echo "✓ Infrastructure setup completed!"
echo "=================================="
echo ""
echo "Next steps:"
echo "1. Update k8s/secrets.yaml with your secrets"
echo "2. Update k8s/configmaps.yaml with your configuration"
echo "3. Run ./deploy.sh to deploy the application"
