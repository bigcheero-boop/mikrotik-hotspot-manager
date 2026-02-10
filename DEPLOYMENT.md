# Deployment Guide

## Local Testing with Docker

### Prerequisites
- Docker installed on your system
- Docker Compose installed

### Steps

1. **Build the Docker image:**
   ```bash
   docker-compose build
   ```

2. **Run the application:**
   ```bash
   docker-compose up -d
   ```

3. **Access the application:**
   - Open browser: `http://localhost:3000`

4. **View logs:**
   ```bash
   docker-compose logs -f app
   ```

5. **Stop the application:**
   ```bash
   docker-compose down
   ```

---

## Deployment to Hostinger (Shared Hosting)

### Option 1: Using FTP Upload (Recommended for Shared Hosting)

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Upload `dist/` folder contents:**
   - Connect via FTP to `ftp.yourdomain.com`
   - Upload all files from `dist/` to `public_html/`
   - Set proper file permissions (644 for files, 755 for folders)

3. **Create `.htaccess` in `public_html/`:**
   ```apache
   <IfModule mod_rewrite.c>
     RewriteEngine On
     RewriteBase /
     RewriteRule ^index\.html$ - [L]
     RewriteCond %{REQUEST_FILENAME} !-f
     RewriteCond %{REQUEST_FILENAME} !-d
     RewriteRule . /index.html [L]
   </IfModule>
   ```

4. **Test:**
   - Visit `https://yourdomain.com`

---

### Option 2: Using Docker on VPS

If your Hostinger plan supports VPS/Cloud hosting:

1. **SSH into your server:**
   ```bash
   ssh user@your-server-ip
   ```

2. **Clone your repository:**
   ```bash
   git clone https://github.com/yourusername/mikrotik-hotspot-manager.git
   cd mikrotik-hotspot-manager
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   nano .env
   # Edit with your environment variables (DATABASE_URL, VITE_API_BASE_URL, etc.)
   ```

4. **Deploy with Docker:**
   ```bash
   docker-compose up -d
   ```

5. **Set up Nginx reverse proxy:**
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

6. **Enable SSL (Let's Encrypt):**
    ```bash
    certbot --nginx -d yourdomain.com
    ```

---

## VPS PostgreSQL Setup (recommended replacement for Supabase)

If you're moving from Supabase to a VPS-hosted database, follow these steps. The project uses a small key-value table named `kv_store_4f18e215`.

### Option A — Install Postgres on Ubuntu (system package)

1. Install Postgres:
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib -y
```

2. Create a database and user:
```bash
sudo -u postgres psql
CREATE DATABASE mikrotik_db;
CREATE USER mikrotik_user WITH PASSWORD 'your_strong_password';
GRANT ALL PRIVILEGES ON DATABASE mikrotik_db TO mikrotik_user;
\q
```

3. Create the KV table:
```bash
psql -U mikrotik_user -d mikrotik_db -h localhost -W <<SQL
CREATE TABLE IF NOT EXISTS kv_store_4f18e215 (
   key TEXT NOT NULL PRIMARY KEY,
   value JSONB NOT NULL
);
SQL
```

4. Set `DATABASE_URL` in your environment or in Docker Compose (see below). Example:
```
postgres://mikrotik_user:your_strong_password@localhost:5432/mikrotik_db
```

### Option B — Run Postgres as a Docker service

You can run Postgres alongside the app using `docker-compose`. Example service (uncomment in `docker-compose.yml`):

```yaml
   postgres:
      image: postgres:15-alpine
      restart: unless-stopped
      environment:
         POSTGRES_DB: mikrotik_db
         POSTGRES_USER: mikrotik_user
         POSTGRES_PASSWORD: your_strong_password
      volumes:
         - pgdata:/var/lib/postgresql/data
      ports:
         - "5432:5432"

volumes:
   pgdata:
```

Then set `DATABASE_URL` for the `app` service environment to:
```
postgres://mikrotik_user:your_strong_password@postgres:5432/mikrotik_db
```

### Migrating KV table (SQL)

Run this once against your Postgres instance (replace credentials/host as needed):

```sql
CREATE TABLE IF NOT EXISTS kv_store_4f18e215 (
   key TEXT NOT NULL PRIMARY KEY,
   value JSONB NOT NULL
);
```

### Notes for the codebase

- I removed embedded Supabase keys and replaced the frontend helper with a generic `API_BASE_URL` that reads `VITE_API_BASE_URL` and optional `VITE_API_KEY` from env.
- The server functions' `kv_store` implementation was changed to use direct Postgres access (Deno + `deno-postgres`). Ensure `DATABASE_URL` is set in the environment where the server runs.

### Running the app + Postgres via Docker Compose

1. Edit `docker-compose.yml` and add/enable the `postgres` service (see above). Set the `app` service `environment.DATABASE_URL` to the correct URL pointing to the `postgres` service.

2. Build and start:
```bash
docker-compose up -d --build
```

3. Initialize the KV table (run one-off):
```bash
docker exec -it <postgres_container_name> psql -U mikrotik_user -d mikrotik_db -c "CREATE TABLE IF NOT EXISTS kv_store_4f18e215 (key TEXT PRIMARY KEY, value JSONB NOT NULL);"
```

---

---

## Environment Variables

Before deployment, create a `.env` file with these values (example in `.env.example`):

- `DATABASE_URL` - Postgres connection string for the server functions and backend (e.g. `postgres://user:pass@host:5432/dbname`)
- `VITE_API_BASE_URL` - Public URL for the backend API the frontend will call (e.g. `https://api.yourdomain.com`)
- `VITE_API_KEY` (optional) - API key / bearer token used by the frontend to call protected endpoints

See `.env.example` for a template.

---

## Troubleshooting

### Application won't load
- Check browser console for errors
- Verify Supabase credentials
- Check logs: `docker-compose logs app`

### Database connection issues
- Verify `.env` configuration (particularly `DATABASE_URL`)
- Ensure Postgres is running and accessible from the server (check firewall/ports)
- Check database user/permissions and that the `kv_store_4f18e215` table exists

### Port conflicts
- Change port in `docker-compose.yml` if 3000 is in use
- Update proxy configuration accordingly

---

## Production Checklist

- [ ] Environment variables configured
- [ ] Supabase keys validated
- [ ] SSL/HTTPS enabled
- [ ] Database backups configured
- [ ] Error logging enabled
- [ ] Monitoring setup
- [ ] Rate limiting configured
