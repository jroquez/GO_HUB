# GO Hub server setup

**Date:** 23 October 2026  
**Host:** `198.58.114.26`  
**OS:** Ubuntu 22.04.5 LTS  
**Status:** Runtimes installed. The application is not deployed.

## Installed services

| Service | Version | How it runs |
|---|---|---|
| Node.js | 24.22.1 LTS | Runtime only. No API process until the application exists. |
| npm | 11.19.1 | Installed with Node.js. |
| PostgreSQL | 17.11 | `postgresql.service`, listening on localhost. |
| Caddy | 2.11.7 | `caddy.service`, HTTP on port 80. |
| Git | 2.34.1 | Already present before this setup. |

Node.js comes from the NodeSource Node 24 repository. PostgreSQL comes from apt.postgresql.org. Caddy comes from the Caddy stable repository. Ubuntu's own Node.js and PostgreSQL packages were not used: the distro Node.js line is too old, and PostgreSQL 14 reaches end of life in November 2026.

After installation the guest reported about 569 MiB available and 40 MiB of swap used.

## PostgreSQL

- Cluster: `17/main`
- Listens on `127.0.0.1:5432` and `[::1]:5432` only
- Database: `gohub`
- Login role: `gohub_app`, owner of the database and the `public` schema
- `PUBLIC` has no connect privilege on `gohub`
- Memory settings: [infrastructure/postgresql/gohub.conf](../../infrastructure/postgresql/gohub.conf), installed at `/etc/postgresql/17/main/conf.d/gohub.conf`
- Credentials: `/etc/gohub/database.env`, mode `640`, owner `root:gohub`

That file stays on the server. It is not in Git. A connection from the public internet to port 5432 times out at `MainFW`.

## Caddy

The live file is `/etc/caddy/Caddyfile`, matching [infrastructure/caddy/Caddyfile](../../infrastructure/caddy/Caddyfile). Port 80 answers `GO Hub`. Automatic HTTPS is not configured because the hostname has not been chosen. Caddy's admin endpoint listens on `127.0.0.1:2019` only.

## Not installed

Docker, Redis, Elasticsearch, and a Node.js systemd service. The API service belongs with the first application deploy.

## Private login

The site at port 80 now serves the React app. `/api` is proxied to `gohub-api` on `127.0.0.1:3000`.

- Bootstrap account: `admin@gohub.local`
- Password file on the server: `/etc/gohub/admin.env` (root only)
- Planning Center credentials: `/etc/gohub/planning-center.env` (readable by `gohubapp` only)
- People data from Planning Center is returned only after login
- The session cookie is not marked `Secure` until the site has HTTPS

