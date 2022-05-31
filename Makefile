COMPOSE		=docker-compose

C			=

FRONT		= front
API			= api
DB			= db
NGINX		= nginx

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
