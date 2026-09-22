# 3D Studio infrastructure

Ansible provisions one Ubuntu VPS:

- Caddy serves static Astro files and proxies `/api/*`, `/admin/*`, `/count/*`.
- rootless Podman Quadlet runs mini-api and GoatCounter.
- SQLite data lives under `/srv/3k-studio/shared`.
- nightly backup encrypts SQLite copies with age and uploads through rclone.

## Required variables

Copy `inventory.example.yml` to `inventory.yml` and set:

- `domain`
- `deploy_user`
- `admin_basic_auth`
- `age_recipient`
- `rclone_remote`

Secrets should be managed via SOPS/age or injected as Ansible extra vars. Do not commit plaintext tokens.

## Apply

```bash
ansible-playbook -i infra/ansible/inventory.yml infra/ansible/site.yml
```

## Restore drill

After the first backup run, copy one encrypted backup to `/tmp`, decrypt it with the private age key, and run:

```bash
sqlite3 restored.sqlite 'pragma integrity_check;'
```
