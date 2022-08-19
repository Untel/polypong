CMP		        = docker-compose -f compose.yml
COMPOSE       = ${CMP} -f compose.tools.yml

# c = Container name; change it when calling enter/rerun
c			        = api

all:
	$(COMPOSE) up

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

run:
	$(COMPOSE) up --build $(c)

.PHONY: all build clear install config $(FRONT) $(API) $(COMMON) $(DB) $(NGINX)
