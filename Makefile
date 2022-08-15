CMP		        = docker-compose -f compose.yml
COMPOSE       = ${CMP} -f compose.tools.yml

# c = Container name; change it when calling enter/rerun
c			        = api

all:
	$(COMPOSE) up

detached:
	$(COMPOSE) up -d

build:
	$(COMPOSE) up --build

down:
	$(COMPOSE) down

clear:
	$(COMPOSE) down -v
	docker system -f prune

enter:
	$(COMPOSE) exec $(c) /bin/bash

log:
	$(COMPOSE) logs $(c) -f


.PHONY: all build clear install nginx reload $(FRONT) $(API) $(COMMON) $(DB) $(NGINX)
