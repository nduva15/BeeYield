#!/bin/bash

# Monitoring and Logging Script
# Usage: ./monitor.sh [environment]

ENVIRONMENT=${1:-production}
NAMESPACE="beeyield-${ENVIRONMENT}"

echo "=================================="
echo "BeeYield System Monitoring"
echo "=================================="
echo "Environment: $ENVIRONMENT"
echo "Namespace: $NAMESPACE"
echo "=================================="

# Function to check pod status
check_pods() {
    echo -e "\n📦 Pod Status:"
    kubectl get pods -n $NAMESPACE -o wide
}

# Function to check deployments
check_deployments() {
    echo -e "\n🚀 Deployment Status:"
    kubectl get deployments -n $NAMESPACE
}

# Function to check services
check_services() {
    echo -e "\n🌐 Service Status:"
    kubectl get services -n $NAMESPACE
}

# Function to check ingress
check_ingress() {
    echo -e "\n🔗 Ingress Status:"
    kubectl get ingress -n $NAMESPACE
}

# Function to check HPA
check_hpa() {
    echo -e "\n📊 HPA Status:"
    kubectl get hpa -n $NAMESPACE
}

# Function to check resource usage
check_resources() {
    echo -e "\n💻 Resource Usage:"
    kubectl top nodes
    echo ""
    kubectl top pods -n $NAMESPACE
}

# Function to check logs
check_logs() {
    echo -e "\n📝 Recent Logs (last 50 lines):"
    
    echo "Frontend Logs:"
    FRONTEND_POD=$(kubectl get pod -l app=frontend -n $NAMESPACE -o jsonpath='{.items[0].metadata.name}')
    kubectl logs -n $NAMESPACE $FRONTEND_POD --tail=50
    
    echo -e "\nBackend Logs:"
    BACKEND_POD=$(kubectl get pod -l app=backend -n $NAMESPACE -o jsonpath='{.items[0].metadata.name}')
    kubectl logs -n $NAMESPACE $BACKEND_POD --tail=50
}

# Function to check events
check_events() {
    echo -e "\n📢 Recent Events:"
    kubectl get events -n $NAMESPACE --sort-by='.lastTimestamp' | tail -20
}

# Function to run health checks
health_checks() {
    echo -e "\n🏥 Health Checks:"
    
    if [ "$ENVIRONMENT" == "production" ]; then
        FRONTEND_URL="https://beeyield.com"
        BACKEND_URL="https://api.beeyield.com"
    else
        FRONTEND_URL="https://${ENVIRONMENT}.beeyield.com"
        BACKEND_URL="https://api-${ENVIRONMENT}.beeyield.com"
    fi
    
    # Frontend check
    if curl -f -s -o /dev/null "$FRONTEND_URL"; then
        echo "✓ Frontend is healthy: $FRONTEND_URL"
    else
        echo "✗ Frontend is unhealthy: $FRONTEND_URL"
    fi
    
    # Backend check
    if curl -f -s -o /dev/null "$BACKEND_URL/health"; then
        echo "✓ Backend is healthy: $BACKEND_URL/health"
    else
        echo "✗ Backend is unhealthy: $BACKEND_URL/health"
    fi
}

# Main menu
while true; do
    echo -e "\n=================================="
    echo "Select monitoring option:"
    echo "=================================="
    echo "1. Check pods"
    echo "2. Check deployments"
    echo "3. Check services"
    echo "4. Check ingress"
    echo "5. Check HPA"
    echo "6. Check resource usage"
    echo "7. Check logs"
    echo "8. Check events"
    echo "9. Run health checks"
    echo "0. Show all"
    echo "q. Quit"
    echo "=================================="
    
    read -p "Enter option: " option
    
    case $option in
        1) check_pods ;;
        2) check_deployments ;;
        3) check_services ;;
        4) check_ingress ;;
        5) check_hpa ;;
        6) check_resources ;;
        7) check_logs ;;
        8) check_events ;;
        9) health_checks ;;
        0)
            check_pods
            check_deployments
            check_services
            check_ingress
            check_hpa
            check_resources
            check_events
            health_checks
            ;;
        q) exit 0 ;;
        *) echo "Invalid option" ;;
    esac
done
