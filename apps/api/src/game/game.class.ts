/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   game.class.ts                                      :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: adda-sil <adda-sil@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/06/13 03:00:00 by adda-sil          #+#    #+#             */
/*   Updated: 2022/08/30 21:28:36 by adda-sil         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import Lobby from './lobby.class';
import { Bot } from '.';
import { pointOnLine, Line, lineLength } from 'geometric';
import { Vector } from 'collider2d';
import PolygonMap from './polygon.class';
import { Power, PowerList } from './power.class';
import { Ball, Wall, Paddle } from '.';
import { shuffle } from 'lodash';
import GameTools from './gametools.class';
import Player from './player.class';
import { Exclude, Expose } from 'class-transformer';
import { Logger } from '@nestjs/common';
import { last } from 'rxjs';

const FRAME_RATE = 30;
const TEST_MODE = false;

export enum MODE {
  Coalition = 'coalition',
  Battleground = 'battleground',
}

export class Finalist {
  isHuman: boolean;
  index: number;
  hp = 11;

  constructor(isHuman: boolean, index: number, hp: number) {
    this.isHuman = isHuman;
    this.index = index;
    this.hp = hp;
  }
}

export default class Game {
  lobby: Lobby;
  balls: Ball[] = [];
  nBall = 1;
  players: Map<number, Player> = new Map();
  bots: Bot[];
  paddles: Paddle[] = [];
  walls: Wall[] = [];
  powers: Power[] = [];
  map: PolygonMap;
  mode: MODE = MODE.Battleground;
  timeElapsed = 0;
  finalePoints = 1;
  finalists: Finalist[] = [];
  paused = false;

  @Exclude()
  interval: NodeJS.Timer;
  @Exclude()
  intervalPowers: NodeJS.Timer;
  @Exclude()
  waitTimeout: NodeJS.Timeout;
  @Exclude()
  sayInterval: NodeJS.Timeout;

  constructor(lobby: Lobby) {
    this.lobby = lobby;
    this.bots = lobby.bots.map((v) => new Bot(v));
    this.players = new Map(this.lobby.players);
    this.finalePoints = lobby.finalePoints;
    this.newRound(7);
  }

  logger = new Logger('Game')

  addBall(hotBall : boolean = false) {
    const ball = new Ball(
      this,
      this.map.center.clone(),
    );
    // ball.setAngle(angleToRadians(this.map.angles[1]));
    this.balls.push(ball);
    ball.setAngle(GameTools.getRandomFloatArbitrary(0, Math.PI * 2));
    ball.findTarget();
    if (hotBall)
      ball.unFreeze();
    console.log(`new ball x:${ball.position.x} y:${ball.position.y}`);
  }

  generateMap(n = 0) {
    this.balls = [];
    this.powers = [];
    this.timeElapsed = 0;

    this.map = new PolygonMap((this.nPlayers === 2 && 4) || this.nPlayers);
    this.paddles = [];
    const playersAndBotsToAssign = [...this.players.values(), ...this.bots];
    const randomPlayers: (Bot | Player)[] = shuffle(playersAndBotsToAssign);

    this.walls = this.map.edges.map((line: Line, index) => {
      let paddle = null;
      if (this.nPlayers > 2 || !(index % 2)) {
        const player = randomPlayers.pop();
        paddle = new Paddle(line, player.color);
        this.paddles.push(paddle);
        const wall = new Wall(line, paddle, player);
        player.attachWall(wall);
        return wall;
      }
      return new Wall(line, paddle);
    });
    for (let i = 0; i < this.nBall; i++) this.addBall(true);
    this.socket.emit('mapChange', this.mapNetScheme);
    this.socket.emit('gameUpdate', this.networkState);
  }

  run() {
    this.stop();
    // this.generateMap(this.nPlayers);
    this.interval = setInterval(() => this.tick(), 1000 / FRAME_RATE);
    this.intervalPowers = setInterval(() => this.addRandomPower(), 5000);
  }
  stop() {
    clearInterval(this.interval);
    clearInterval(this.intervalPowers);
    clearInterval(this.sayInterval);
    this.interval = null;
    this.intervalPowers = null;
    this.sayInterval = null;
  }

  newRound(timer = 5) {
    this.generateMap();
    this.socket.emit('mapChange', this.mapNetScheme);
    this.resume(timer);
  }

  resume(timer = 5) {
    console.log('New round', this.players.size, this.bots.length);
    this.paused = true;
    // eslint-disable-next-line prettier/prettier
    this.logger.log(`&&&&&&&& RESUME this.isStopped = ${this.isStopped} &&&&&&&`);
    if (this.isStopped) this.run();
    // eslint-disable-next-line prettier/prettier
    this.logger.log(`&&&&&&&& After this.run, this.isStopped = ${this.isStopped} &&&&&&&`);
    clearInterval(this.sayInterval);
    this.sayInterval = setInterval(() => {
      timer -= 1;
      if (timer === 0) {
        this.socket.emit('message', 'Goooo ooo ooo o o o o o o');
        this.paused = false;
        this.run();
      } else {
        this.socket.emit('message', `Game resume in ${timer}s`);
      }
    }, 1000);
  }

  updatePaddlePercent(userId, percent: number) {
    const player = this.players.get(userId);
    if (player) player.wall.paddle.updatePercentOnAxis(percent);
  }

  async runPhysics() {
    this.balls.forEach( async (ball) => {
      const dtc = lineLength([
        [ball.position.x, ball.position.y],
        [this.map.center.x, this.map.center.y],
      ]);

      const testDist : number = lineLength(
        [[this.map.center.x, this.map.center.y],
        this.map.edges[0][0]]
        );
      // console.log("dtc vs dist ", dtc, " ", testDist)
      // console.log("edges ", this.map.edges[0])

        if (testDist != 0 && dtc > testDist * 1.1 && dtc < testDist * 1.3) {
        console.log('Ded ball :', dtc);
        // ball.lastHitten.score++
        this.balls.forEach((e) => {
          //          if (e !== ball) e.stop();
        });
      } else if (dtc >= 70) {
        if (this.nPlayers === 2) {
          await this.finalReduce(ball.target.wall);
        } else {
          await this.reduce(ball.target.wall);
        }

        // this.reduce(ball.target.wall);
      }
      const wall = ball.target.wall;

      if (wall.paddle === null) {
        const test = GameTools.lineCircleCollision(
          wall.line[0][0],
          wall.line[0][1],
          wall.line[1][0],
          wall.line[1][1],
          ball.position.x,
          ball.position.y,
          ball.radius,[0,0]
        );
        if (test === true) {
          ball.bounceTargetWall();
          // console.log('wall collision');
        }
      } else {
        let ret = [0,0];
        const test = GameTools.wallBallCollision(wall.paddle.line, ball,ret);
        if (test === true) {
          ball.bouncePaddle(wall.paddle, ret);
          // console.log('paddle collision at,', ret);
          ball.closestP[0] = ret[0];
          ball.closestP[1] = ret[1];
        }
      }
      ball.move();
    });
  }

  runBots() {
    this.bots.forEach((e) => {
      e.think();
    });
  }

  public get ended() {
    this.logger.log('--------------- ended -------------');
    this.logger.log(`this.players.size = ${this.players.size}`);
    this.logger.log(`this.nPlayers = ${this.nPlayers}`);
    //return this.nPlayers === 1 || this.players.size === 0;
    // if there's still at least one human player
    if (this.players.size >= 1) {
      this.logger.log('still a human left');
      // if there's still at least someone else to play with (human or bot)
      if (this.nPlayers >= 2) {
        this.logger.log('still someone else to play with');
        return false;
      }
    }
    this.logger.log('no humans left');
    return true;
  }

  async killPlayer(player: Player) {
    this.logger.log('===============killPlayer============');
    this.logger.log('player = ', player.user.email);
    this.stop();
    // eslint-disable-next-line prettier/prettier
    this.logger.log(`BEFORE players.delete, players.size = ${this.players.size}`);
    this.logger.log(`BEFORE players.delete, nPlayers = ${this.nPlayers}`);
    this.players.delete(player.user.id);
    // eslint-disable-next-line prettier/prettier
    this.logger.log(`AFTER players.delete, players.size = ${this.players.size}`);
    this.logger.log(`AFTER players.delete, nPlayers = ${this.nPlayers}`);
    await this.lobby.createPlayerRank(Object.assign({}, player), this.nPlayers);
//    if (this.ended) {
//      this.logger.log('{{{{{{{{{{{{{{ CLOSING LOBBY }}}}}}}}}}}}}}');
//      this.logger.log('=====================================');
//      return await this.lobby.service.closeLobby(this.lobby);
//    }
//    this.logger.log('[[[[[[[[[[[CONTINUING]]]]]]]]]]]');
//    this.logger.log('1lala');
//    this.newRound();
//    this.logger.log('2lele');
//    this.run();
//    this.logger.log('3lolo');
  }

  public async reduce(wall: Wall) {
    this.stop();
    this.logger.log('~~~~~~~~~~~~~~reduce~~~~~~~~~~~~~~');
    if (wall.bot) {
      this.logger.log('REDUCING BOT');
      this.bots = this.bots.filter((b) => b !== wall.bot);
//      if (this.ended) {
//        this.killPlayer([...this.players.values()][0]);
//      } else {
//        this.newRound();
//      }
    } else if (wall.player) {
      this.logger.log('REDUCING PLAYER');
      await this.killPlayer(wall.player);
      this.logger.log('4lulu');
    }
    if (this.ended) {
      if (this.players.size === 1) {
        this.logger.log('$$$$$$ LONE PLAYER LEFT $$$$$');
        const lastHuman = [...this.players.values()][0];
        this.logger.log(`last human : ${lastHuman.user.email}`);
        await this.killPlayer(lastHuman);
        this.logger.log('$$$$$$$$$$$$$$$$$$$$$$$$$');
      }
      return await this.lobby.service.closeLobby(this.lobby);
    }
    return this.newRound();

//    if (this.ended) {
//      this.logger.log('{{{{{{{{{{{{{{ CLOSING LOBBY }}}}}}}}}}}}}}');
//      this.logger.log('=====================================');
//      return await this.lobby.service.closeLobby(this.lobby);
//    }
//    this.logger.log('[[[[[[[[[[[CONTINUING]]]]]]]]]]]');
//    this.logger.log('1lala');
//    this.newRound();
//    this.logger.log('2lele');
//    this.run();
//    this.logger.log('3lolo');
  }

  private setFinalists() {
    this.logger.log('~~~~~~~~~~~~~~setFinalists~~~~~~~~~~~~~~');
    const humans = [...this.players.values()];
    // eslint-disable-next-line prettier/prettier
    this.logger.log('humans = '); console.log(humans);
    humans.forEach((p, index) => {
      const f = new Finalist(true, index, this.finalePoints);
      this.finalists.push(f);
    });
    this.bots.forEach((b, index) => {
      const f = new Finalist(false, index, this.finalePoints);
      this.finalists.push(f);
    });
  }

  private async decrementHp(wall: Wall) {
    if (wall.bot) {
      this.logger.log(`BOT ${wall.bot.name} took a hit`);
      const botIndex = this.bots.findIndex((bot) => bot.name === wall.bot.name);
      this.logger.log(`BOTINDEX = ${botIndex}`);
      for (let i = 0; i < 2; i++) {
        const f = this.finalists[i];
        if (!f.isHuman) {
          if (f.index === botIndex) {
            f.hp--;
            this.logger.log(`REMOVED HP FROM FINALIST: ${f}`);
            if (f.hp <= 0) {
              this.logger.log(`FINALIST: ${f} IS DEAD`);
              this.bots = this.bots.filter((b) => b !== wall.bot);
              break;
            }
          }
        }
      }
    } else {
      this.logger.log(`HUMAN ${wall.player.user.name} took a hit`);
      const humanIndex = [...this.players.values()].findIndex((p) => {
        console.log(
          'p.user.id = ',
          p.user.id,
          ', wall.player.user.id = ',
          wall.player.user.id,
          ' === : ',
          p.user.id === wall.player.user.id,
        );
        return p.user.id === wall.player.user.id;
      });
      this.logger.log(`HUMANINDEX = ${humanIndex}`);
      for (let i = 0; i < 2; i++) {
        const f = this.finalists[i];
        if (f.isHuman) {
          if (f.index === humanIndex) {
            f.hp--;
            this.logger.log(`REMOVED HP FROM FINALIST: ${f}`);
            if (f.hp <= 0) {
              this.logger.log(`FINALIST: ${f} IS DEAD`);
              await this.killPlayer(wall.player);
              break;
            }
          }
        }
      }
    }
  }

  public async finalReduce(wall: Wall) {
    this.stop();
    this.logger.log('~~~~~~~~~~~~~~finalReduce~~~~~~~~~~~~~~');
    if (this.finalists.length !== 2) {
      this.setFinalists();
    }
    // eslint-disable-next-line prettier/prettier
    this.logger.log('Finalists : '); console.log(this.finalists);
    await this.decrementHp(wall);
    // eslint-disable-next-line prettier/prettier
    this.logger.log('After Decrement, Finalists : '); console.log(this.finalists);
    if (this.ended) {
      if (this.players.size === 1) {
        this.logger.log('$$$$$$ LONE PLAYER LEFT $$$$$');
        const lastHuman = [...this.players.values()][0];
        this.logger.log(`last human : ${lastHuman.user.email}`);
        await this.killPlayer(lastHuman);
        this.logger.log('$$$$$$$$$$$$$$$$$$$$$$$$$');
      }
      return await this.lobby.service.closeLobby(this.lobby);
    }
    return this.newRound();
  }

  @Expose()
  public get isStopped() {
    return !this.interval;
  }

  public get ballsNetScheme() {
    return this.balls.map((b) => b.netScheme);
  }

  public get paddlesNetScheme() {
    return this.paddles.map((b) => b.netScheme);
  }

  public get powersNetScheme() {
    return this.powers.map((p) => p.netScheme);
  }

  public get nPlayers() {
    return this.players.size + this.bots.length;
  }

  public get networkState() {
    return {
      balls: this.ballsNetScheme,
      paddles: this.paddlesNetScheme,
    };
  }
  public get mapNetScheme() {
    return {
      walls: this.walls.map((w) => w.netScheme),
      wallWidth: this.walls[0].width,
      angles: this.map.angles,
      verticles: this.map.verticles,
      inradius: this.map.inradius,
    };
  }

  public get netScheme() {
    return {
      map: this.mapNetScheme,
      balls: this.ballsNetScheme,
      paddles: this.paddlesNetScheme,
      powers: this.powersNetScheme,
    };
  }

  public get devTick() {
    return {
      ...this.map,
      paddles: [...this.paddles],
      balls: [...this.balls],
    };
  }

  public get id() {
    return `${this.lobby.id}`;
  }

  public ballsCollides() {
    for (let bIdx = 0; bIdx < this.balls.length; bIdx++) {
      const currBall = this.balls[bIdx];
      // Ball Collide with other balls
      for (let cIdx = bIdx + 1; cIdx < this.balls.length; cIdx++) {
        const compared: Ball = this.balls[cIdx];
        if (currBall.collideWithBall(compared)) {
          currBall.swapAngles(compared);
          currBall.findTarget();
          compared.findTarget();
          break;
        }
      }

      // Ball Collide with powers
      for (let pIdx = 0; pIdx < this.powers.length; pIdx++) {
        const power: Power = this.powers[pIdx];
        if (power.collideWithBall(currBall)) {
          power.effect(currBall);
          this.powers.splice(pIdx, 1);
          this.socket.emit('powers', this.powersNetScheme);
          // this.socket.emit('removePower', power.netScheme, pIdx);
        }
      }
    }
  }

  public addRandomPower() {
    const powerClass =
      PowerList[GameTools.getRandomArbitrary(0, PowerList.length)];
    const powerObj: Power = new powerClass(this, this.map.randomPosition());
    this.powers.push(powerObj);
    console.log(
      'Adding new power',
      powerObj.name,
      Object.keys(powerObj),
      typeof powerObj,
    );
    // this.socket.emit('power', (this.powers.indexOf(powerObj), powerObj.netScheme))
    this.socket.emit(
      'powers',
      this.powers.map((p) => p.netScheme),
    );
  }

  public tick() {
    if (!this.paused) {
      this.timeElapsed += 1 / FRAME_RATE;
      this.ballsCollides();
      this.runPhysics();
      this.runBots();
    }
    this.socket.emit(
      'p',
      this.paddles.map((p) => [
        [p.line[0][0].toFixed(2), p.line[0][1].toFixed(2)],
        [p.line[1][0].toFixed(2), p.line[1][1].toFixed(2)],
      ]),
      this.balls.map(({ position: { x, y } }) => ({
        x: x.toFixed(2),
        y: y.toFixed(2),
      })),
    );
  }

  public get socket() {
    return this.lobby.sock;
  }
}
