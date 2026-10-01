#!/bin/sh
# Создаёт файл .env: случайные пароль базы и ключ подписи, логин и пароль первого администратора.
set -e
cd "$(dirname "$0")/.."

if [ -f .env ]; then
  echo "Файл .env уже существует, ничего не изменено."
  exit 0
fi
if [ -z "$ADMIN_PASSWORD" ]; then
  echo "Укажите пароль администратора: ADMIN_PASSWORD='ваш_пароль' sh scripts/init-env.sh"
  exit 1
fi

cp .env.example .env
DB_PASS=$(openssl rand -hex 16)
KEY=$(openssl rand -hex 32)
sed -i "s|^POSTGRES_PASSWORD=.*|POSTGRES_PASSWORD=$DB_PASS|" .env
sed -i "s|^SECRET_KEY=.*|SECRET_KEY=$KEY|" .env
sed -i "s|^ADMIN_LOGIN=.*|ADMIN_LOGIN=${ADMIN_LOGIN:-admin}|" .env
sed -i "s|^ADMIN_PASSWORD=.*|ADMIN_PASSWORD=$ADMIN_PASSWORD|" .env
echo "Файл .env создан."
