# Quadlet units

The source of truth for production units is in `infra/ansible/templates/*.container.j2`.

Rendered units live on the VPS under:

`/home/<deploy_user>/.config/containers/systemd/`

They are managed as rootless user services:

```bash
systemctl --user daemon-reload
systemctl --user restart 3k-api.service goatcounter.service
```
