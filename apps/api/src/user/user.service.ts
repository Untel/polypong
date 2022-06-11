import { BadRequestException, ConflictException, HttpException, HttpStatus, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, FindOptionsWhere, Repository } from 'typeorm';
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

	logger = new Logger(`UserService`);

	async findById(id: string | number): Promise<User> {
		return this.userRepository.findOne({ where: { id: +id } });
	}

	async find(where: FindOptionsWhere<User>, withPassword = false): Promise<User> | null {
		const user = await this.userRepository.findOne({ where });
		if (!user) {
		  return;
		}
		if (!withPassword) {
		  delete user.password;
		}
		return user;
	}

	// save the hash of the current refresh token in db
	async setCurrentRefreshToken(
		refreshToken: string, userId: number
	) {
		const currentHashedRefreshToken = await bcrypt.hash(refreshToken, 10);
		await this.userRepository.update(userId, {
		  currentHashedRefreshToken
		});
	}
	// compare a refresh token to an user's and return info if matching
	async getUserIfRefreshTokenMatches(
		refreshToken: string, userId: number
	) {
		const user = await this.findById(userId);

		const isRefreshTokenMatching = await bcrypt.compare(
		  refreshToken,
		  user.currentHashedRefreshToken
		);

		if (isRefreshTokenMatching) { return user; }
	}
	// clear refresh tokens from the db
	async removeRefreshToken(userId: number) {
		return this.userRepository.update(userId, {
		  currentHashedRefreshToken: null
		});
	}

	// save the 2fa secret in the database
	async setTwoFactorAuthenticationSecret(
		secret: string, userId: number
	) {
		return this.userRepository.update(userId, {
			twoFactorAuthenticationSecret: secret
		});
	}

	// activate 2fa
	async turnOnTwoFactorAuthentication(userId: number) {
		return this.userRepository.update(userId, {
		  isTwoFactorAuthenticationEnabled: true
		})
	}

	/**
	 * create a new user entry in the database
	 * @param user : the user interface
	 * @returns : the newly created user entity
	 */
	async createUser(user: UserInterface): Promise<User> {
		const {
			name, email, password, coalition,
			avatar, social_channel, email_verified
		} = user;

		const newUser = await this.userRepository.create({
			name,
			email,
      coalition,
			password: password,
			avatar: avatar || gravatar.url(email, { s: '100', r: 'x', d: 'retro' }, true),
			social_channel: social_channel,
			email_verified: email_verified || false,
		});
		const result = await this.userRepository.save(newUser);
		return result;
	}

	async updateUser(id: string | number, properties: any) {
		const user = await this.findById(id);
		this.logger.log(`in updateUser, user.name = ${user.name}`);
		this.logger.log(`in updateUser, properties = ${properties}`);

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

	/**
	 * set the name of an user
	 * @param user : the user interface
	 * @param name : the new name
	 * @returns : the updated user entity
	 */
	async setNickname(user: UserInterface, name: string) {
		const existingName = await this.find({ name });
		this.logger.log(`in setName, user.email = ${user.email}`);
		this.logger.log(`in setName, name = ${name}`);
		this.logger.log(`in setName, existingName = ${existingName}`);
		if (existingName) {
			this.logger.log(`in setName, existingName found, throwing error`);
			throw new ConflictException('Name already taken');
		}
		const email = user.email;
		const localUser = await this.find({email});
		const res = await this.updateUser(
			localUser.id,
			{ name: name},
		);
		return (res);
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
		const localUser = await this.find({email});
		this.logger.log(`in setAvatar, localUser = ${localUser}`);
		const res = await this.updateUser(
			localUser.id,
			{ avatar: avatarUrl},
		);
		return (res);
	}

	/**
	 * get the avatar of an user
	 * @param user : the user interface
	 * @returns : the user avatar
	 */
	async getAvatar(user: UserInterface) {
		this.logger.log(`in getAvatar, user.email = ${user.email}`);
		const email = user.email;
		const localUser = await this.find({email});
		return localUser.avatar;
	}

}
