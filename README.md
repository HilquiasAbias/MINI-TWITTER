# services:
#   db:
#     image: postgres:15
#     restart: always
#     volumes:
#       - postgres_data:/var/lib/postgresql/data/
#     environment:
#       POSTGRES_USER: ${DB_USER}
#       POSTGRES_PASSWORD: ${DB_PASSWORD}
#       POSTGRES_DB: ${DB_NAME}
#     networks:
#       - mini-twitter-network

#   api:
#     build:
#       context: .
#       dockerfile: ./Dockerfile.backend
#     env_file:
#       - .env
#     environment:
#       DB_HOST: ${DB_HOST}
#     volumes:
#       - static_volume:/home/mini-twitter-user/app/staticfiles
#     restart: always
#     healthcheck:
#       test: [ "CMD", "wget", "--spider", "-q", "http://localhost:8000/admin/" ]
#       interval: 10s
#       timeout: 3s
#       retries: 5
#     depends_on:
#       - db
#     networks:
#       - mini-twitter-network

#   # frontend:
#   #   build:
#   #     context: .
#   #     dockerfile: Dockerfile.frontend
#   #   restart: always
#   #   environment:
#   #     - NODE_ENV=production
#   #   depends_on:
#   #     - api
#   #   networks:
#   #     - mini-twitter-network

#   nginx:
#     image: nginx:alpine
#     restart: always
#     volumes:
#       - ./nginx/nginx.conf:/etc/nginx/nginx.conf
#       # - ./index.html:/usr/share/nginx/html/index.html
#     ports:
#       - "80:80"
#     depends_on:
#       api:
#         condition: service_healthy
#     networks:
#       - mini-twitter-network

# networks:
#   mini-twitter-network:
#     driver: bridge

# volumes:
#   postgres_data:
#   static_volume: