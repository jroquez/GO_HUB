# GO Hub Linode Audit

**Date:** 23 October 2026  
**Linode name:** `woocommerce-us-central`  
**Public IPv4:** `198.58.114.26`  
**IPv6:** `2600:3c00::f03c:93ff:febf:2958`  
**Region:** Dallas, Texas  
**Plan:** Nanode 1 GB  
**Cloud firewall:** `MainFW`  
**Access:** `ssh go-hub` as root, ED25519 key `renova-hub-linode`  
**Status:** Read-only audit completed. No packages, users, firewall rules, or SSH settings were changed.

## 1. Guest operating system

| Item | Observed |
|---|---|
| OS | Ubuntu 22.04.5 LTS |
| Kernel | `5.15.0-185-generic` #195, built 19 June 2026 |
| Virtualization | KVM |
| Hostname | `localhost` |
| Uptime at audit | 30 minutes |
| Clock | UTC, NTP synchronized |

The requested target was Ubuntu Server 24.04 LTS. This guest is **22.04.5**, so the rebuild did not land on 24.04. The disk is a clean install: no `/var/www`, nginx, Apache, PHP, MySQL, MariaDB, or `wp-config.php`. The old WordPress/WooCommerce stack is not present.

Ubuntu 22.04 standard support runs through April 2027. Rebuilding to 24.04 is cheapest now, before any application data exists. That rebuild needs a separate approval and a repeat of the SSH key install.

## 2. Capacity

| Resource | Observed |
|---|---|
| CPU | 1 vCPU, AMD EPYC 7713 (host), 1 thread |
| RAM | 957 MiB total, 125 MiB used, about 700 MiB available |
| Swap | 512 MiB on `/dev/sdb`, unused |
| Disk | 25 GB ext4 on `/dev/sda`, 2.7 GB used (12%), 21 GB free |
| Inodes | 6% used |
| Load | 0.00 |

Idle headroom is about 700 MiB. A membership MVP can fit if the server runs only Ubuntu, Caddy, one Node.js process, and a small PostgreSQL, with the React app built on the Mac or in CI. A Vite or `npm` build on this VPS can exhaust RAM. Swap will keep the machine alive and will make it slow if the app relies on it. Kubernetes, extra Docker services, Redis, and Elasticsearch stay out.

25 GB is enough for the OS and a church directory. Backup copies have to leave this disk. A RAM upgrade, or any paid backup store, needs measurements and a separate cost approval.

## 3. Accounts and SSH

| Item | Observed |
|---|---|
| Login shells | `root` only (`/bin/bash`) |
| `sudo` group | Empty |
| `PermitRootLogin` | yes |
| `PubkeyAuthentication` | yes |
| `PasswordAuthentication` | yes |
| `KbdInteractiveAuthentication` | no |
| `PermitEmptyPasswords` | no |
| `X11Forwarding` | yes |
| `AuthorizedKeysFile` | `.ssh/authorized_keys` |
| Host key | ED25519 `SHA256:QUyUaUqOOIp1aFMw58QopmvxsUTvSXgjCU/HUslKMxU` |
| Client key | `SHA256:z+piLW+KIYasXRkvKlqw3wWQYIxfMg0CKQY+ejjmI78` (`renova-hub-linode`) |

The private key is passphrase-protected. It is loaded in `ssh-agent` for this session. `MainFW` allows TCP 22 from `172.59.194.147/32`. That address is carrier-grade NAT and can change.

## 4. Network and firewall

Listening sockets:

- TCP 22 on `0.0.0.0` and `::` (`sshd`)
- TCP/UDP 53 on `127.0.0.53` (`systemd-resolved`)

Nothing else is listening. UFW is **inactive**. `MainFW` is the active perimeter: SSH from the current admin address, HTTP and HTTPS from the public internet, default inbound Drop. Port 443 from this Mac returns connection refused because no web server is installed.

PostgreSQL and Node.js are not installed, so they are not exposed.

## 5. Software present

| Component | Status |
|---|---|
| Git | 2.34.1 |
| Node.js / npm | Not installed |
| PostgreSQL | Not installed |
| Caddy | Not installed |
| nginx, Apache, PHP, MySQL, MariaDB | Not installed |
| Docker, Redis | Not installed |
| fail2ban | Not installed |
| UFW | Installed, inactive |
| unattended-upgrades | Installed and enabled. Automatic reboot is not turned on. |

`/usr/lib/update-notifier/apt-check` reported `0;0` against the current cache. `/var/lib/apt/lists` has no `InRelease` files, and the login banner said the update list was more than a week old. Pending security updates are **not confirmed** until `apt update` is approved and run. No reboot is currently required.

## 6. Disk encryption and backups

`/dev/sda` is plain ext4. `/etc/crypttab` has no active entries. Guest-level disk encryption is not in place. Linode account-level disk encryption was not visible from the guest and still needs a check in Cloud Manager.

No restic, borg, duplicity, or rclone. No application backup jobs. Linode Backups must be confirmed in Cloud Manager. A copy that lives only on this Linode does not meet disaster recovery.

## 7. Running services

cron, dbus, getty, haveged, networkd-dispatcher, rsyslog, serial getty, ssh, journald, logind, systemd-networkd, systemd-resolved, systemd-timesyncd, and udev. No failed units.

`haveged` is unnecessary on a current kernel and is a candidate to disable later, not during this audit.

## 8. Risks

- The image is Ubuntu 22.04, not the required 24.04.
- Root SSH and password authentication are both enabled.
- The only login account is root. The `sudo` group is empty.
- UFW is off. Protection depends on `MainFW`, whose SSH rule is a single address that can change.
- Package update freshness is unverified.
- No off-server backup exists yet.
- Real membership data stays off this server until authentication, authorization, HTTPS, and a tested restore exist.
- Production HTTPS still needs a hostname and DNS.

## 9. Prioritized setup after approval

1. Decide whether to rebuild this empty disk to Ubuntu 24.04 LTS before any application install. If yes, reinstall the current public key through LISH and repeat this audit.
2. If staying on 22.04 for now, refresh package lists and apply security updates.
3. Create a dedicated sudo administrator, authorize the same ED25519 key, and prove a second SSH session. Keep the first session open.
4. Then disable root SSH login and password authentication. Turn off X11 forwarding.
5. Enable UFW without cutting off the working SSH session: allow OpenSSH, then 80/tcp and 443/tcp. Leave `MainFW` in place. Keep LISH as the recovery path.
6. Install Git (already present), Node.js LTS, PostgreSQL, and Caddy only when application deployment is approved. Bind PostgreSQL and the API to localhost. Ask for the GO Hub hostname before Caddy requests a public certificate.
7. Define encrypted off-server backups, retention, and one successful restore test before any real member import.
8. Monitor disk, memory, swap, failed units, and health with tooling that fits 1 GB RAM.

## 10. Phase 0 gate

The read-only audit is complete. Phase 0 hardening is not. Ubuntu 24.04 is not what is installed. SSH still uses root, password authentication is on, UFW is inactive, update freshness is unconfirmed, and backups are undefined.

No packages were installed. SSH settings, firewall rules, databases, and application code on the server were not changed. The Linode instance was not deleted. No additional server or paid service was provisioned.
