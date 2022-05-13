COMPOSE=docker-compose
FRONT=front
API=api
COMMON=common

all:
	$(COMPOSE) up

build:
	$(COMPOSE) up --build

clear:
	$(COMPOSE) down -v
	docker system prune

install:
	$(COMPOSE) run --rm $(FRONT) yarn
	$(COMPOSE) run --rm $(API) yarn

$(FRONT):
	$(COMPOSE) exec $(FRONT) /bin/bash
$(API):
	$(COMPOSE) exec $(API) /bin/bash
$(COMMON):
	$(COMPOSE) exec $(COMMON) /bin/bash

.PHONY: all build clear install $(FRONT) $(API) $(COMMON) 