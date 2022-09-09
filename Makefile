CMP		        = docker-compose -f compose.yml
COMPOSE       = ${CMP} -f compose.tools.yml
COMPOSE_PROD  = ${COMPOSE} -f compose.prod.yml

# c = Container name; change it when calling enter/rerun
c			        = api

all:
	$(COMPOSE) up

prod:
	$(COMPOSE_PROD) up --build

config:
	$(COMPOSE) config

detached:
	$(COMPOSE) up -d

build:
	$(COMPOSE) up --build

down:
	$(COMPOSE) down -v

clear:
	$(COMPOSE) down -v
	docker system -f prune

enter:
	$(COMPOSE) exec $(c) /bin/sh

log:
	$(COMPOSE) logs $(c)

precommit:
	yarn --cwd ./apps/api index &
	yarn --cwd ./apps/api format &
	yarn --cwd ./apps/api lint &
	yarn --cwd ./apps/front lint &

run:
	$(COMPOSE) up --build $(c)

hostinstall:
	yarn --cwd ./apps/api &
	yarn --cwd ./apps/front &


.PHONY: all build clear down run log config precommit
