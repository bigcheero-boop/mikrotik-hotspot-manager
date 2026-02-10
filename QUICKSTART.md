# MikroTik Hotspot Manager — Quick Start Guide

## Overview

This setup deploys a complete MikroTik hotspot management system with:
- **Frontend** (`app`) — React UI on port 3000
- **API** (`api`) — Deno backend on port 3001, talks to Postgres
- **Postgres** — Database on port 5432
- **pgAdmin** — Database UI on port 8080
- **WireGuard** — VPN tunnel on UDP 51820

All services are pre-configured for **skynity.org** with strong passwords in `.env`.

---

## Prerequisites (on your VPS)

1. **Docker & Docker Compose** installed
   ```bash
   curl -sSL https://get.docker.com | sh
   sudo usermod -aG docker $USER
   docker --version && docker-compose --version
   ```

2. **Git** installed
   ```bash
   sudo apt update && sudo apt install git -y
   ```

3. **Domain DNS Records** pointing to your VPS IP:
   - `skynity.org` → `your.vps.ip.address`
   - `api.skynity.org` → `your.vps.ip.address`
   - `admin.skynity.org` → `your.vps.ip.address`

---

## Deployment Steps

### 1. Clone the Repository

```bash
cd /opt
git clone https://github.com/bigcheero-boop/mikrotik-hotspot-manager.git
cd mikrotik-hotspot-manager
```

### 2. Start All Services

```bash
# Create WireGuard config directory
mkdir -p ./config/wireguard

# Build and start containers
docker-compose up -d --build

# Check status
docker-compose ps
```

Expected output:
```
NAME                    STATUS
mikrotik_app            Up
mikrotik_api            Up
postgres                Up
pgadmin                 Up
wireguard               Up
```

### 3. Initialize Database

```bash
# Create the KV table (required for app to work)
docker-compose exec postgres psql -U mikrotik_user -d mikrotik_db -c \
  "CREATE TABLE IF NOT EXISTS kv_store_4f18e215 (
     key TEXT NOT NULL PRIMARY KEY,
     value JSONB NOT NULL
   );"
```

### 4. Access Services

| Service | URL | Credentials |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | Any username/password (demo) |
| **PgAdmin** | http://localhost:8080 | admin@skynity.org / AdminSkynity2024Secure@!xK9p |
| **WireGuard Config** | `./config/wireguard/config` | Auto-generated |

### 5. Set Up Nginx Reverse Proxy (Production)

Create `/etc/nginx/sites-available/skynity.org`:

```nginx
# Main domain
server {
    listen 80;
    server_name skynity.org;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# API subdomain
server {
    listen 80;
    server_name api.skynity.org;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_read_timeout 3600s;
        proxy_connect_timeout 3600s;
    }
}

# Admin panel (same as main, but can be customized)
server {
    listen 80;
    server_name admin.skynity.org;
    
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

Enable and test:
```bash
sudo ln -s /etc/nginx/sites-available/skynity.org /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 6. Enable SSL with Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx -y

sudo certbot --nginx -d skynity.org -d api.skynity.org -d admin.skynity.org

# Enable auto-renewal
sudo systemctl enable certbot.timer
```

---

## WireGuard Configuration

Once the container starts, WireGuard will generate peer configs in `./config/wireguard/config/peer1/`, `peer2/`, etc.

To view a peer config:
```bash
cat ./config/wireguard/config/peer1/peer1.conf
```

Share the config with users or scan the QR code:
```bash
docker exec wireguard cat /config/peer1/peer1.qrcode.png
```

---

## Admin Dashboard Workflow

1. **Access Dashboard:** https://admin.skynity.org
2. **Login:** Use any credentials (demo mode)
3. **Add MikroTik Router:**
   - IP: Your MikroTik router's IP
   - Credentials: API username/password from MikroTik
4. **Add VPN Clients:** Input WireGuard peer configs
5. **Configure Hotspot:**
   - Bandwidth limits
   - Authentication method
   - Billing settings (vouchers)
6. **Monitor:** View real-time analytics, traffic, active connections

---

## Environment Variables (.env)

```bash
# Postgres
POSTGRES_DB=mikrotik_db
POSTGRES_USER=mikrotik_user
POSTGRES_PASSWORD=SkynityMikroTik2024SecurePass@76x9!K2m

# Frontend
VITE_API_BASE_URL=https://api.skynity.org

# WireGuard
WIREGUARD_SERVERURL=skynity.org
WIREGUARD_PEERS=2

# PgAdmin
PGADMIN_DEFAULT_EMAIL=admin@skynity.org
```

**To change:** Edit `.env` and restart:
```bash
docker-compose restart api postgres
```

---

## Troubleshooting

### Container crashes?
```bash
# Check logs
docker-compose logs -f api
docker-compose logs -f postgres
docker-compose logs -f wireguard

# Rebuild
docker-compose down
docker-compose up -d --build
```

### Database connection error?
```bash
# Verify table exists
docker-compose exec postgres psql -U mikrotik_user -d mikrotik_db -c \
  "SELECT * FROM pg_tables WHERE tablename = 'kv_store_4f18e215';"
```

### WireGuard peers not generating?
```bash
# Check config directory
ls -la ./config/wireguard/config/

# Restart WireGuard
docker-compose restart wireguard
```

### Nginx not forwarding requests?
```bash
# Test Nginx config
sudo nginx -t

# Check if services are accessible
curl http://localhost:3000 && curl http://localhost:3001
```

---

## Backup & Maintenance

### Daily Backup (Postgres)
```bash
docker-compose exec postgres pg_dump -U mikrotik_user mikrotik_db > backup_$(date +%Y%m%d).sql
```

### Restore from Backup
```bash
docker-compose exec -T postgres psql -U mikrotik_user mikrotik_db < backup_20260210.sql
```

### Monitor Service Health
```bash
docker-compose ps --filter "status=exited"
docker system df
```

---

## Support & Documentation

- **API Docs:** See `supabase/functions/server/index.tsx` for endpoint definitions
- **Frontend Code:** `src/` folder
- **Deployment Guide:** See `DEPLOYMENT.md`

---

## Next Steps

1. ✅ Deploy and test
2. ✅ Configure MikroTik routers via dashboard
3. ✅ Create WireGuard peers for clients
4. ✅ Set up billing/voucher system
5. ✅ Enable SSL & monitor logs

**Enjoy your MikroTik Hotspot Manager!** 🚀
