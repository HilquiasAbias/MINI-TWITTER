#!/bin/bash
set -e

echo "Executando migrações..."
uv run python manage.py migrate --noinput

if [ "$POPULATE_DB" = "true" ]; then
    echo "Populando banco de dados com dados de mock..."
    uv run python populate_db.py
fi

echo "Iniciando o servidor..."
exec uv run gunicorn mini_twitter.wsgi:application --bind 0.0.0.0:8000
