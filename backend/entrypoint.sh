#!/bin/bash
set -e

echo "Executando migrações..."
uv run python manage.py migrate --noinput

echo "Iniciando o servidor..."
exec uv run gunicorn mini_twitter.wsgi:application --bind 0.0.0.0:8000
