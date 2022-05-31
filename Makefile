CMP		        = docker-compose -f compose.yml
COMPOSE       = ${CMP} -f compose.tools.yml

# c = Container name; change it when calling enter/rerun
c			        =

all:
	$(COMPOSE) up

detach:
	$(COMPOSE) up -d

build:
	$(COMPOSE) up --build

clear:
	$(COMPOSE) down -v
	docker system prune -f
	docker rmi $(shell docker image ls -qa)

install:
	$(COMPOSE) run --rm install

enter:
	$(COMPOSE) exec $(C) /bin/bash

rerun:
	$(COMPOSE) down $(C)
	$(COMPOSE) run $(C) -d

.PHONY: all build clear install $(FRONT) $(API) $(COMMON) $(DB) $(NGINX)
