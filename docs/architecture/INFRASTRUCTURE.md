# GO HUB — Infrastructure Requirements & Deployment Plan

**Project:** GO Hub  
**Organization:** Greenville Oaks Church  
**Congregations:** English Campus and GO ReNova  
**Environment:** Akamai / Linode VPS  
**Project Directory:** `go-hub`  
**Status:** Infrastructure setup / Phase 0

## 1. Existing Infrastructure

We already own and operate a Linode VPS. Do not provision another server or introduce additional paid services without approval.

| Resource | Current Configuration |
|---|---|
| Cloud Provider | Akamai / Linode |
| Linode Name | `woocommerce-us-central` |
| Public IPv4 | `198.58.114.26` |
| Region | Dallas, Texas |
| VPS Plan | Nanode 1 GB |
| CPU | 1 vCPU |
| RAM | 1 GB |
| Storage | 25 GB |
| Operating System | Ubuntu Server 24.04 LTS — rebuild initiated; verify completion |
| Cloud Firewall | `MainFW` |
| SSH Port | 22 |
| Authentication | ED25519 SSH key |
| SSH Key Location (Mac) | `~/.ssh/renova_hub_ed25519` |
| Local Development | macOS / Cursor IDE |

The VPS previously hosted a WordPress/WooCommerce installation running on Debian 10.

A rebuild was initiated to replace the previous environment with Ubuntu 24.04 LTS.

**Verify the current operating system and server state before proceeding.** Do not assume the rebuild succeeded until confirmed.

The old WordPress environment is no longer required.

Do not delete the Linode instance.

## 2. SSH Access

Cursor operates locally on macOS.

The existing SSH private key is stored locally at:

`~/.ssh/renova_hub_ed25519`

Initial connection:

```bash
ssh -i ~/.ssh/renova_hub_ed25519 root@198.58.114.26
```

An SSH alias named `go-hub` may be configured in `~/.ssh/config`.

Cursor should verify that SSH connectivity works before attempting any server modifications.

Never expose, copy, or commit the private key.

If SSH host-key verification fails after the rebuild, verify the server's new fingerprint using Akamai's trusted console before modifying the local known-hosts entry.

## 3. Infrastructure Objective

Prepare the existing VPS to host a secure, browser-accessible GO Hub web application.

The initial application will provide an administrative interface for church membership records.

The infrastructure must eventually support:

- English Campus and GO ReNova.
- Secure administrator login.
- Membership directory and household records.
- CSV imports.
- Search and filtering.
- Role-based access control.
- Congregation-specific data permissions.
- REST API for future mobile applications.
- Future integrations with CCB, Pushpay, Planning Center, and church media systems.

This is initially a small deployment. Prioritize security, reliability, simplicity, and low operating cost.

## 4. Proposed Deployment Architecture

```text
                    INTERNET
                        |
                     HTTPS
                        |
                  Linode Firewall
                        |
                  Caddy Web Server
                        |
             +----------+----------+
             |                     |
        React Frontend         /api Requests
         Static Files               |
                              Node.js API
                              (localhost)
                                   |
                              PostgreSQL
                              (localhost)
```

The architecture should use one VPS initially.

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS

Build static frontend assets locally or in a controlled build environment.

Serve the compiled frontend through Caddy.

Avoid running a Vite development server in production.

### Backend

- Node.js LTS
- TypeScript
- Express
- REST API
- Zod validation

Run the API as a dedicated non-root Linux service using systemd.

Bind the application to localhost.

### Database

- PostgreSQL
- Local-only connections
- Dedicated database and application user
- Restricted permissions
- Database migrations
- Backups and recovery procedures

PostgreSQL must never be exposed directly to the public internet.

### Reverse Proxy

Use Caddy for:

- HTTPS termination.
- TLS certificate management.
- Static frontend hosting.
- Reverse proxy for `/api`.
- HTTP-to-HTTPS redirection.

Automatic public TLS certificates require a valid domain name and working DNS. Ask for the intended GO Hub hostname before configuring production HTTPS.

## 5. Phase 0 — Server Audit

Before installing anything, perform a read-only inspection.

Verify:

1. Ubuntu version and kernel.
2. CPU and RAM.
3. Disk capacity and utilization.
4. Swap configuration.
5. Running system services.
6. Open network ports.
7. SSH configuration.
8. Firewall configuration.
9. Existing users and permissions.
10. Available package updates.
11. Whether Node.js, PostgreSQL, Git, or Caddy are installed.
12. Whether old WordPress components remain.
13. Current backup availability.
14. Disk encryption status.

Create:

`docs/deployment/LINODE_AUDIT.md`

Document findings, risks, and recommendations.

Do not modify the server during this initial audit.

## 6. Security Hardening Requirements

After the audit is approved:

### Linux Administration

- Create a dedicated sudo-enabled administrative user.
- Configure SSH key authentication for that user.
- Verify a second SSH connection works before restricting root access.
- Disable direct root SSH login.
- Disable SSH password authentication.
- Apply operating system security updates.
- Configure automatic security updates.

### Firewall

Coordinate the existing Linode Cloud Firewall with UFW.

Expected public inbound access:

| Port | Purpose | Access |
|---|---|---|
| 22/TCP | SSH | Restricted to approved administrative IPs where practical |
| 80/TCP | HTTP / certificate validation | Public |
| 443/TCP | HTTPS | Public |
| 5432/TCP | PostgreSQL | Not public |
| 3000/TCP | Node.js API | Not public |

Do not activate firewall changes that could interrupt SSH without first verifying access.

### Application Security

- Enforce authentication for private membership data.
- Implement server-side authorization.
- Use least-privilege database accounts.
- Protect application secrets.
- Configure secure session handling.
- Apply rate limiting.
- Maintain audit logs.
- Avoid logging personal membership information.
- Keep real member data out of GitHub and test fixtures.

## 7. Resource Management

The existing server has only 1 GB RAM.

This is sufficient for initial infrastructure experimentation and potentially a small, carefully optimized application, but production capacity must be measured.

Do not assume PostgreSQL, Node.js, and the operating system will comfortably support production workloads without testing.

Requirements:

- Avoid Kubernetes.
- Avoid unnecessary Docker containers.
- Avoid Redis unless justified.
- Avoid Elasticsearch.
- Avoid running frontend development tools permanently.
- Keep background processes minimal.
- Use systemd for service management.
- Monitor memory and swap.
- Set reasonable process memory limits.
- Use pagination for membership queries.
- Avoid importing large datasets entirely into memory.

If the VPS cannot reliably support the application, recommend a modest RAM upgrade with supporting measurements and estimated costs before making changes.

## 8. Database and Membership Data

The first application module is the Membership Directory.

Initial data will be imported from the existing Google Sheets workbook, which contains:

- `visitors`
- `group`
- `members`
- `Consolidated`
- `Directory`

The import system must preserve original source records, identify duplicate candidates, and avoid automatically merging ambiguous identities.

The application must support multiple congregation affiliations for the same person.

The database should be designed for future expansion into households, ministries, volunteer teams, and church events.

**Do not import actual membership data until authentication, authorization, HTTPS, and backup procedures are verified.**

## 9. Backup and Recovery

Before GO Hub becomes operational with real membership information, implement:

- Scheduled PostgreSQL backups.
- Encrypted backup storage.
- Backup retention policies.
- Off-server backup copies.
- Restricted access to backup files.
- A documented restoration procedure.
- At least one successful restoration test.

A backup stored only on the same Linode is not sufficient for disaster recovery.

Discuss any additional backup storage cost before provisioning services.

## 10. Deployment Workflow

The local `go-hub` repository is the source of truth.

Preferred deployment workflow:

1. Develop locally in Cursor.
2. Commit changes to the independent GO Hub Git repository.
3. Run tests and production builds.
4. Deploy application artifacts to Linode through SSH.
5. Apply database migrations.
6. Restart the API service.
7. Verify application health.
8. Verify HTTPS and authentication.
9. Document the deployment result.

Do not edit production source code directly as root.

Create reproducible deployment scripts.

Keep production secrets on the server or in an approved secrets-management system, not in Git.

## 11. Required Infrastructure Deliverables

Create and maintain the following documentation:

```text
go-hub/
├── docs/
│   ├── GO_HUB_REQUIREMENTS.md
│   ├── deployment/
│   │   ├── LINODE_AUDIT.md
│   │   ├── SERVER_SETUP.md
│   │   ├── SSH_SECURITY.md
│   │   ├── FIREWALL.md
│   │   ├── DEPLOYMENT.md
│   │   └── BACKUP_RECOVERY.md
│   └── architecture/
│       ├── OVERVIEW.md
│       └── INFRASTRUCTURE.md
├── infrastructure/
│   ├── caddy/
│   └── systemd/
└── scripts/
```

These files should document actual implementation, not merely planned features.

## 12. Infrastructure Completion Criteria

Phase 0 is complete when:

- Ubuntu 24.04 LTS is verified.
- SSH access works through a dedicated administrative user.
- Root SSH access is restricted.
- Password-based SSH access is disabled after verification.
- Firewall rules are verified.
- Security updates are configured.
- Server resources and limitations are documented.
- The backup approach is defined.
- Deployment architecture is approved.
- No unnecessary publicly accessible services are running.

Application deployment begins only after Phase 0 approval.

## 13. Instructions for Cursor Agent

You are responsible for planning and implementing GO Hub's infrastructure incrementally.

You may inspect the existing Linode through SSH.

Begin with read-only commands.

Do not install packages, modify SSH settings, change firewall rules, create databases, or deploy code until the proposed changes are approved.

Never execute destructive commands without explicit authorization.

Do not access or modify unrelated local projects.

### Immediate Task

1. Confirm SSH connectivity to `198.58.114.26`.
2. Verify Ubuntu 24.04 LTS.
3. Perform a read-only server audit.
4. Evaluate the 1 GB RAM limitation.
5. Create `docs/deployment/LINODE_AUDIT.md`.
6. Present a prioritized infrastructure setup plan.
7. Stop and request approval before implementation.

**Target outcome:** A secure, maintainable, low-cost infrastructure capable of hosting the first GO Hub Membership Directory MVP and expanding into a bilingual church engagement platform.
