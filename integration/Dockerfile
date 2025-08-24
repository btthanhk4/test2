FROM nodered/node-red:3.1
# copy predefined flows
COPY flows.json /data/flows.json
# environment variables for future nodes (Mongo/Redis/Minio) can be injected via K8s
