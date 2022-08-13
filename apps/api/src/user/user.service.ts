import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, FindOptionsWhere, In, Repository } from 'typeorm';
import { UserInterface } from './interfaces/UserInterface';
import { User } from './user.entity';
import * as gravatar from 'gravatar';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  logger = new Logger('UserService');
  connectedUsers = new Map<number, string>();

  setUserAsConnected(id: number, socketId: string) {
    this.connectedUsers.set(id, socketId);
    return true;
  }
  setSocketAsDisconnected(socketId: string) {
    const user = [...this.connectedUsers.entries()].find(
      ([uId, sId]) => sId === socketId,
    );
    if (user) {
      this.connectedUsers.delete(user[0]);
    }
  }
  userConnectedSocketId(id: number): string {
    return this.connectedUsers.get(id);
  }


  async findById(id: string | number): Promise<User> {
    // this.logger.log(`findById - id = ${id}`);
    if (id) {
      const res = await this.userRepository.findOne({ where: { id: +id } });
      // this.logger.log(`findById - res = ${JSON.stringify(res)}`);
      return res;
    }
    return null;
  }

  async find(
    where: FindOptionsWhere<User>,
    withPassword = false,
  ): Promise<User> | null {
    const user = await this.userRepository.findOne({ where });
    if (!user) {
      return;
    }
    if (!withPassword) {
      delete user.password;
    }
    return user;
  }

  async findMany(ids: number[]) {
    return await this.userRepository.find({ where: { id: In(ids) } });
  }

  // save the 2fa secret in the database
  async setTwoFactorAuthenticationSecret(secret: string, id: number) {
    this.logger.log(
      `setTwoFactorAuthenticationSecret - secret : ${secret}, id: ${id}`,
    );
    return this.userRepository.update(id, {
      twoFactorAuthenticationSecret: secret,
    });
  }

  // activate 2fa
  async turnOnTwoFactorAuthentication(id: number) {
    return this.userRepository.update(id, {
      isTwoFactorAuthenticationEnabled: true,
    });
  }

  /**
   * create a new user entry in the database
   * @param user : the user interface
   * @returns : the newly created user entity
   */
  async createUser(user: UserInterface): Promise<User> {
    const {
      name,
      email,
      isTwoFactorAuthenticationEnabled,
      password,
      coalition,
      avatar,
      socialChannel,
      emailVerified,
    } = user;

    const newUser = await this.userRepository.create({
      name,
      email,
      isTwoFactorAuthenticationEnabled:
        isTwoFactorAuthenticationEnabled || false,
      coalition,
      password: password,
      avatar:
        avatar || gravatar.url(email, { s: '100', r: 'x', d: 'retro' }, true),
      socialChannel: socialChannel,
      emailVerified: emailVerified || false,
    });
    const result = await this.userRepository.save(newUser);
    return result;
  }

  async updateUser(id: string | number, properties: any) {
    const user = await this.findById(id);
    this.logger.log(`in updateUser, user.name = ${user.name}`);
    this.logger.log(
      `in updateUser, properties = ${JSON.stringify(properties)}`,
    );

    if (!user) {
      throw new BadRequestException('User not found');
    }

    try {
      const updatedUser = await this.userRepository.save({
        ...user,
        ...properties,
      });
      return updatedUser;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async updateSelf(user: UserInterface, properties: any) {
    this.logger.log(`updateSelf - properties = ${JSON.stringify(properties)}`);
    let res = null;
    this.logger.log(`updateSelf - properties.name = ${properties.name}`);
    this.logger.log(`updateSelf - user.name = ${user.name}`);
    try {
      if (properties.hasOwnProperty('name')) {
        res = await this.setName(user, properties.name);
        this.logger.log(`updateSelf - res = ${JSON.stringify(res)}`);
      }
      this.logger.log(
        `properties.hasOwnProperty('isTwoFactorAuthenticationEnabled')) = ${properties.hasOwnProperty(
          'isTwoFactorAuthenticationEnabled',
        )}`,
      );
      if (properties.hasOwnProperty('isTwoFactorAuthenticationEnabled')) {
        this.logger.log('lala');
        res = await this.set2fa(
          user,
          properties.isTwoFactorAuthenticationEnabled,
        );
        this.logger.log(`updateSelf - res = ${JSON.stringify(res)}`);
      }
    } catch (error) {
      this.logger.log(`updateSelf - caught error = ${JSON.stringify(error)}`);
      this.logger.log('updateSelf - rethrowing error');
      throw error;
    }
    this.logger.log(`updateSelf - returning res = ${JSON.stringify(res)}`);
    if (!res) {
      throw new BadRequestException('no properties were updated');
    }
    return res;
  }

  async updateOther(
    user: UserInterface,
    properties: any,
    targetId: string | number,
  ) {
    this.logger.log(`updateOther - properties = ${JSON.stringify(properties)}`);
    return null;
  }

  /**
   * set the name of an user
   * @param user : the user interface
   * @param name : the new name
   * @returns : the updated user entity
   */
  async setName(user: UserInterface, name: string) {
    const existingName = await this.find({ name });
    this.logger.log(`in setName, user.email = ${user.email}`);
    this.logger.log(`in setName, name = ${name}`);
    this.logger.log(`in setName, existingName = ${existingName}`);
    if (existingName) {
      this.logger.log(
        'in setName, existingName found, throwing error : name already taken',
      );
      throw new ConflictException('Name already taken');
    }
    if (name.length < 3) {
      this.logger.log(
        'in setName, existingName found, throwing error : name too short',
      );
      throw new BadRequestException('Name needs to be at least 3 letters long');
    }
    const email = user.email;
    const localUser = await this.find({ email });
    const res = await this.updateUser(localUser.id, { name: name });
    return res;
  }

  /**
   * set 2fa on or off
   * @param user : the user interface
   * @param isTwoFactorAuthenticationEnabled : 2fa status
   * @returns : the updated user entity
   */
  async set2fa(user: UserInterface, isTwoFactorAuthenticationEnabled: boolean) {
    const email = user.email;
    const localUser = await this.find({ email });
    const res = await this.updateUser(localUser.id, {
      isTwoFactorAuthenticationEnabled: isTwoFactorAuthenticationEnabled,
    });
    return res;
  }

  /**
   * set the avatar of an user
   * @param user : the user interface
   * @param file : the new image file
   * @returns : the updated user entity
   */
  async setAvatar(user: UserInterface, avatarUrl: string) {
    this.logger.log(`in setAvatar, user.email = ${user.email}`);
    this.logger.log(`in setAvatar, avatarUrl = ${avatarUrl}`);
    const email = user.email;
    const localUser = await this.find({ email });
    this.logger.log(`in setAvatar, localUser = ${localUser}`);
    const res = await this.updateUser(localUser.id, { avatar: avatarUrl });
    this.logger.log(`in setAvatar, res = ${JSON.stringify(res)}`);
    return res;
  }

  /**
   * get the avatar of an user
   * @param user : the user interface
   * @returns : the user avatar
   */
  async getAvatar(user: UserInterface) {
    this.logger.log(`in getAvatar, user.email = ${user.email}`);
    const email = user.email;
    const localUser = await this.find({ email });
    return localUser.avatar;
  }

  setIsConnected() {}
}
