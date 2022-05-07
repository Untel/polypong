COMPOSE=docker-compose
FRONT=front

all:
	$(COMPOSE) up

build:
	$(COMPOSE) up --build

clear:
	$(COMPOSE) down -v
	docker system prune

install:
	$(COMPOSE) run --rm $(FRONT) yarn

$(FRONT):
	$(COMPOSE) exec $(FRONT) /bin/bash

.PHONY: all build clear install $(FRONT)