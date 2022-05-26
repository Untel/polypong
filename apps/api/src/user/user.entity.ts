import {
	Entity,
	Column,
	PrimaryGeneratedColumn,
	CreateDateColumn,
	UpdateDateColumn,
	OneToMany,
} from 'typeorm';
import { Exclude } from 'class-transformer';
// import Message from 'src/chat/entities/message.entity';
  
@Entity()
export class User {
	@PrimaryGeneratedColumn()
	id: number;
	
	@Column({ nullable: true })
	@Exclude()
	public currentHashedRefreshToken?: string;

	@Column({ nullable: true })
	twoFactorAuthenticationSecret?: string;

	@Column({ default: false })
	public isTwoFactorAuthenticationEnabled: boolean;
 
	@Column({ type: 'text', unique: true })
	name: string;

	@Column({ type: 'text', nullable: true })
	status: string;

	@Column()
	email: string;
 
	@Column()
	password?: string;
 
	@Column({ default: true })
	isActive: boolean;
 
	@Column({ default: false })
	email_verified: boolean;
 
	@Column({ default: false })
	require_email_verification: boolean;
 
	@Column({ nullable: true })
	social_channel: string;
 
	@Column({ nullable: true })
	avatar: string;
 
	@CreateDateColumn()
	created_at: Date;
 
	@UpdateDateColumn()
	updated_at: Date;

	// @OneToMany(() => Message, message => message.author)
	// public message: Message;
}