# LOS K8s Example

This repo contains three services to practice deploying on Kubernetes:

- `backend/` Node.js Express connecting to MongoDB, Redis and MinIO and calling Integration (Node-RED).
- `frontend/` React (Vite) static app that calls the backend.
- `integration/` Node-RED with simple flows under `/int/*`.

## Build

```
docker build -t your-registry/los-backend:1.0.0 backend
docker build -t your-registry/los-frontend:1.0.0 frontend
docker build -t your-registry/los-integration:1.0.0 integration
```

Push images to your registry, then deploy manifests:

```
kubectl apply -f k8s/manifests.yaml
```

Make sure you have MongoDB, Redis, and MinIO services deployed in the cluster and the env vars point to them.
