# polypong
---

## Usage

Fill the .env file from .env.example
```
  make prod
```
---

## Description
Last project of 42 Cursus
Make a pong game, with social features (chat, profile, friendship)
It's a Battle royal Pong game, each player have to defend his side. Once a player die, the polygon reduce until becoming the regular 1v1 pong game
Built with:
  - Back: NestJS, TypeOrm, Swagger, Passort: Jwt + Oauth 42/Google
  - Data: PostgresSQL, Redis,
  - Front: VueJS 3.0 (With composition API only), Quasar, PiniaJS, Mande, VueUse, AnimeJS
  - Other: Docker, Docker Compose, Nginx as reverse proxy, Mailhog, Geometric.js, Collider2d, Flat Surface Shaders, Socket.io

---
## Demo
![login](./polypong_login.gif)
![inbox](./polypong_inbox.png)
![game](./polypong_game.gif)
