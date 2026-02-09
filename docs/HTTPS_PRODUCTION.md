# HTTPS in Production

This document describes how to run the ICEM.App frontend with HTTPS (SSL/TLS) in production.

## Overview

- **HTTP (port 80)** is used only to redirect all traffic to HTTPS.
- **HTTPS (port 443)** serves the application with TLS and security headers (HSTS, X-Content-Type-Options, etc.).
- Certificates are mounted into the container; you can use **Let's Encrypt** (recommended) or your own certificates.

## Quick start (production stack)

1. Obtain SSL certificates and place them so the container can read them (see below).
2. Ensure certificate files are named and placed as expected:
   - `fullchain.pem` (certificate + chain)
   - `privkey.pem` (private key)
3. Run with the production compose file:

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

The app will be available at `https://your-domain` and `http://your-domain` will redirect to HTTPS.

## Obtaining SSL certificates

### Option A: Let's Encrypt with Certbot (recommended)

1. Install Certbot on the host (e.g. `apt install certbot` or use the official Certbot Docker image).
2. Stop any service using port 80/443 on the host, or use webroot/nginx plugin if you prefer.
3. Request a certificate (replace `your-domain.com` with your domain):

   **Standalone (stops anything on 80):**
   ```bash
   sudo certbot certonly --standalone -d your-domain.com
   ```

   **Webroot (if nginx or another server serves a path):**
   ```bash
   sudo certbot certonly --webroot -w /var/www/html -d your-domain.com
   ```

4. Certificates are usually in `/etc/letsencrypt/live/your-domain.com/`. Create a `certs` directory in the frontend project and copy or symlink:

   ```bash
   mkdir -p certs
   sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem certs/
   sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem certs/
   sudo chown -R $(whoami): certs
   ```

   Or mount Let's Encrypt directly in `docker-compose.prod.yml` (read-only):

   ```yaml
   volumes:
     - /etc/letsencrypt/live/your-domain.com:/etc/nginx/ssl:ro
   ```

   Then use the same `docker-compose.prod.yml` but remove or override the `./certs` volume with the path above.

5. Renewal: Let's Encrypt certs expire after 90 days. Set up a cron job or systemd timer:

   ```bash
   sudo certbot renew --quiet
   ```

   If you use the `/etc/letsencrypt` mount, reload nginx after renewal:

   ```bash
   docker exec vgg_histo_frontend nginx -s reload
   ```

### Option B: Custom / corporate certificates

1. Place your certificate chain file as `certs/fullchain.pem` and your private key as `certs/privkey.pem`.
2. Ensure the `certs` directory is only readable by the user running Docker (and that the container mounts it read-only).
3. Run:

   ```bash
   docker compose -f docker-compose.prod.yml up -d --build
   ```

**Important:** Do not commit `certs/` or any private keys to version control. The repository `.gitignore` includes `certs/` to avoid accidental commits.

## Security headers

The production nginx config sets:

- **Strict-Transport-Security (HSTS)** – browsers use HTTPS only for 1 year.
- **X-Content-Type-Options: nosniff** – reduces MIME sniffing.
- **X-Frame-Options: SAMEORIGIN** – mitigates clickjacking.
- **X-XSS-Protection** – legacy XSS filter.
- **Referrer-Policy** – limits referrer information.
- **Permissions-Policy** – restricts browser features.

## Troubleshooting

- **Container exits or nginx fails:** Check that `certs/fullchain.pem` and `certs/privkey.pem` exist and are readable by the process inside the container (e.g. correct host permissions or volume mount).
- **Mixed content in browser:** Ensure the app and API are loaded over HTTPS and that `REACT_APP_FAST_API_HOST` (if used) points to an HTTPS URL in production.
- **Backend not receiving HTTPS:** The frontend nginx sets `X-Forwarded-Proto $scheme`. Ensure the backend trusts this header if it generates redirects or URLs.
