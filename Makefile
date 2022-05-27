COMPOSE		=docker-compose

FRONT		=front
API			=api

all:
	$(COMPOSE) up

build:
	$(COMPOSE) up --build

clear:
	$(COMPOSE) down -v
	docker system prune -f
	docker rmi $(shell docker image ls -qa)

install:
	$(COMPOSE) run --rm $(FRONT) yarn
	$(COMPOSE) run --rm $(API) yarn

$(FRONT):
	$(COMPOSE) exec $(FRONT) /bin/bash

$(API):
	$(COMPOSE) exec $(API) /bin/bash

.PHONY: all build clear install $(FRONT) $(API) $(COMMON)
