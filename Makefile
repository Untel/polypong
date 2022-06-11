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
  # docker rmi $(shell docker image ls -qa)
	# docker network rm $(shell docker network ls -qa)
	# docker volume rm $(shell docker volume ls -qa)

install:
	$(COMPOSE) run --rm install

enter:
	$(COMPOSE) exec $(c) /bin/bash

log:
	$(COMPOSE) logs $(c) -f

rerun:
	$(COMPOSE) down $(c)
	$(COMPOSE) run $(c) -d

.PHONY: all build clear install $(FRONT) $(API) $(COMMON) $(DB) $(NGINX)
