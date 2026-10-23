# GO Hub firewall

**Date:** 23 October 2026  
**Host:** `198.58.114.26`  
**Status:** In effect after reboot

Two layers are in place.

## Linode Cloud Firewall `MainFW`

Inbound:

| Port | Source | Action |
|---|---|---|
| 22/tcp | `172.59.194.147/32` | Accept |
| 80/tcp | All IPv4 and IPv6 | Accept |
| 443/tcp | All IPv4 and IPv6 | Accept |

Default inbound policy: Drop. Default outbound policy: Accept.

No rule was added for PostgreSQL or the API. SSH stays limited to the admin address. When that address changes, edit this SSH rule. Do not open port 22 to the internet.

## Host UFW

UFW is active and enabled at boot.

- Default incoming: deny
- Default outgoing: allow
- Allow 22/tcp (OpenSSH), 80/tcp, and 443/tcp on IPv4 and IPv6

The only public listener on the guest is `sshd` on port 22. Port 443 is allowed and currently has nothing listening, so a connection is refused. `systemd-resolved` listens on `127.0.0.53:53` only.

UFW was enabled only after a separate `gohub` login had succeeded. SSH as `gohub` was checked again after UFW was enabled and after the reboot.
