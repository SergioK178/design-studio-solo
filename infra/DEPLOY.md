# Деплой-раннбук (первый провижн VPS)

Инфра здесь код-комплит: Ansible, Quadlet-юниты, Caddyfile, Dockerfile образа API и CI-джоба сборки/паблиша — всё готово к применению, но **живой VPS не провижен**. Этот документ — точные шаги, когда он появится.

## 1. Подготовка

- Ubuntu 22.04+ VPS с root-доступом по SSH.
- DNS: A-запись `{{ domain }}` → IP VPS.
- Сгенерировать SSH-ключ деплоя: `ssh-keygen -t ed25519 -f deploy_key -N ""`. Публичный ключ — в `~/.ssh/authorized_keys` root/деплой-юзера на VPS.
- Секреты в GitHub Actions (Settings → Secrets and variables → Actions):
  - `DEPLOY_SSH_KEY` — приватный ключ (`deploy_key`).
  - `DEPLOY_HOST`, `DEPLOY_USER`, `DOMAIN`.
  - `METRICS_WRITE_TOKEN` — тот же токен, что в `api.env` на сервере.
  - `GITHUB_TOKEN` уже доступен автоматически для паблиша образов в GHCR.

## 2. Секреты на сервере (sops/age)

- Сгенерировать пару age: `age-keygen -o age-key.txt`. Публичный ключ → `age_recipient` в `infra/ansible/inventory.yml`.
- Создать `{{ app_root }}/shared/api.env` на сервере (не в git) с:
  ```
  DB_PATH=/data/app.db
  PORT=8787
  METRICS_WRITE_TOKEN=<сгенерировать>
  RELAY_URL=https://<worker>.workers.dev
  RELAY_TOKEN=<сгенерировать>
  PANEL_BASE_URL=https://{{ domain }}
  ```
- Захешировать basic-auth пароль для `/admin/*`: `caddy hash-password --plaintext '<пароль>'` → вписать в `admin_basic_auth` в `inventory.yml` вида `admin $2a$14$...`.

## 3. Ansible: первый провижн

```bash
cp infra/ansible/inventory.example.yml infra/ansible/inventory.yml
# заполнить domain, deploy_user, api_image, admin_basic_auth, age_recipient, rclone_remote
ansible-playbook -i infra/ansible/inventory.yml infra/ansible/site.yml
```

Плейбук ставит Caddy, rootless Podman/Quadlet, cron бэкапов, и включает `3k-api.service` (образ ещё не запушен — первый старт может упасть, это нормально до шага 4).

## 4. Первый образ API + деплой

```bash
cd api && npm ci && npm run build
docker build -t ghcr.io/<owner>/design-studio-api:bootstrap .
docker push ghcr.io/<owner>/design-studio-api:bootstrap
```

На VPS указать этот тег в `~/.config/containers/systemd/3k-api.container` (`Image=...`), затем:
```bash
systemctl --user daemon-reload
systemctl --user restart 3k-api.service
```

Дальше CI подхватывает автоматически: джоба `deploy` в `.github/workflows/deploy.yml` на каждый пуш в `main` собирает и паблишит `ghcr.io/<owner>/design-studio-api:<sha>` и `:latest`. Шаг `Deploy API image` в этом воркфлоу помечен `if: false` — включить (`if: true`) только после того, как выполнены шаги 1–3 этого раннбука.

### Схема SQLite

API применяет версионные SQL-миграции при старте и отмечает их в таблице
`schema_migrations`. Для обычного обновления не удаляйте production-базу:
данные заявок и WAL остаются на persistent volume `shared/`. Перед обновлением
достаточно выполнить резервную копию и перезапустить `3k-api.service`.

## 5. TG-релей (Cloudflare Worker)

```bash
cd relay && npm ci
npx wrangler secret put RELAY_TOKEN
npx wrangler secret put TG_BOT_TOKEN
npx wrangler secret put TG_CHAT_ID
npm run deploy
```

Записать URL воркера в `RELAY_URL` в `api.env` на сервере (шаг 2) и перезапустить `3k-api.service`.

## 6. Проверка после первого деплоя

```bash
curl -fsS https://{{ domain }}/healthz            # ожидание: ok
curl -u admin:<пароль> https://{{ domain }}/admin/leads   # 200, HTML-таблица
```

## 7. Restore-проверка (без живого VPS уже покрыта тестом)

`api/test/restore.test.ts` гоняет `db.backup()` → `PRAGMA integrity_check` в CI на каждый `npm test`. На живом сервере — после первого ночного бэкапа:

```bash
# скопировать один зашифрованный бэкап на локальную машину, расшифровать age-ключом
sqlite3 restored.sqlite 'pragma integrity_check;'
```
(см. также `infra/ansible/README.md#restore-drill`).

## Вне scope этого раннбука

Живой uptime-пинг (внешний мониторинг типа UptimeRobot/Healthchecks.io на `/healthz`) настраивается вручную в консоли выбранного сервиса — вне кода репозитория.
