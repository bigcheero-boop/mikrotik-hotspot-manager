FROM denoland/deno:latest

WORKDIR /app

# Copy server files into the image
COPY index.tsx .
COPY kv_store.tsx .
COPY init.sql .

EXPOSE 3000

CMD ["run", "--allow-net", "--allow-env", "--allow-read", "--allow-write", "index.tsx"]
