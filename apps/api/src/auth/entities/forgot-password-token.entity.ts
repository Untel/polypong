import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class ForgotPasswordToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column({ length: 400 })
  token: string;

  @CreateDateColumn()
  createdAtt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
