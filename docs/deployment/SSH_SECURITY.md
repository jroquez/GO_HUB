# GO Hub SSH security

**Date:** 23 October 2026  
**Host:** `198.58.114.26` (`ssh go-hub`)  
**Status:** In effect after reboot

## Access

| Item | Value |
|---|---|
| Administrative user | `gohub` |
| Login | SSH public key only |
| Key | `~/.ssh/renova_hub_ed25519` (`renova-hub-linode`) |
| Fingerprint | `SHA256:z+piLW+KIYasXRkvKlqw3wWQYIxfMg0CKQY+ejjmI78` |
| sudo | `gohub` is in group `sudo`. `/etc/sudoers.d/gohub` allows `NOPASSWD:ALL` because the account password is locked. |
| Local alias | `Host go-hub` uses `User gohub` |

Root SSH was confirmed denied after the change and again after reboot. A second session as `gohub` succeeded before root login was turned off. The original root session stayed open until that check passed.

## sshd

Effective settings from `sshd -T`:

- `permitrootlogin no`
- `passwordauthentication no`
- `kbdinteractiveauthentication no`
- `pubkeyauthentication yes`
- `x11forwarding no`

These values are in `/etc/ssh/sshd_config.d/00-gohub-hardening.conf`. That file is included before the defaults in `/etc/ssh/sshd_config`, so it takes effect. `sshd -t` succeeded before `systemctl reload ssh`.

## Recovery

`MainFW` allows TCP 22 only from the current admin address. That address can change. If SSH stops connecting, use the Linode LISH console. Do not re-enable root or password login to work around a changed IP. Update the `MainFW` SSH source instead.
