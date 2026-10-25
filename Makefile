
.PHONY: up down build rebuild delete logs logs-api logs-frontend logs-db logs-n8n \
        shell frontend-shell db-shell admin evento restart restart-api \
        restart-frontend restart-n8n ps status api frontend db n8n n8n-stop n8n-start test

# Subir todos os serviços
up:
	docker compose up -d

# Construir as imagens e subir os containers
build:
	docker compose up --build -d

# Reconstruir as imagens sem usar o cache
rebuild:
	docker compose build --no-cache
	docker compose up -d

# Parar e remover os containers, mantendo os dados do banco
down:
	docker compose down

# APAGA os volumes e as imagens do projeto
delete:
	docker compose down -v --rmi all --remove-orphans

# Logs de todos os serviços
logs:
	docker compose logs -f

# Logs individuais
logs-api:
	docker compose logs -f api

logs-frontend:
	docker compose logs -f frontend

logs-db:
	docker compose logs -f db

logs-n8n:
	docker compose logs -f n8n

# Acessar o terminal do backend
shell:
	docker compose exec api sh

# Acessar o terminal do frontend
frontend-shell:
	docker compose exec frontend sh

# Acessar o PostgreSQL
db-shell:
	docker compose exec db psql -U postgres -d meu_banco

# Criar administrador
admin:
	docker compose exec api python -m app.scripts.criar_adm

# Criar eventos
evento:
	docker compose exec api python -m app.scripts.criar_eventos

# Reiniciar todos os serviços
restart:
	docker compose restart

# Reiniciar serviços individuais
restart-api:
	docker compose restart api

restart-frontend:
	docker compose restart frontend

restart-n8n:
	docker compose restart n8n

# Verificar containers em execução
ps:
	docker compose ps

status: ps

# Subir apenas um serviço e suas dependências
api:
	docker compose up -d api

frontend:
	docker compose up -d frontend

db:
	docker compose up -d db

# Gerenciar o n8n
n8n:
	docker compose up -d n8n

n8n-stop:
	docker compose stop n8n

n8n-start:
	docker compose start n8n
