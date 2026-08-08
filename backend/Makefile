
.PHONY: up down build logs shell db-shell admin restart

up:
	docker-compose up -d

build:
	docker-compose up --build -d

down:
	docker-compose down 

delete:
	docker-compose down -v --rmi all --remove-orphans
	
logs:
	docker-compose logs -f api

restart:
	docker-compose restart api

shell:
	docker-compose exec api bash

db-shell:
	docker-compose exec db psql -U postgres -d meu_banco

admin:
	docker-compose exec api python -m app.scripts.criar_adm

evento:
	docker-compose exec api python -m app.scripts.criar_eventos