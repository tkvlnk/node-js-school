import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { IsDateString, Length } from 'class-validator';
import { User } from './user';

@Entity()
export class Book {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    length: 80
  })
  @Length(3, 80)
  name: string;

  @Column({
    length: 80
  })
  @Length(10, 80)
  description: string;

  @Column({
    type: 'timestamp without time zone',
    transformer: {
      to: v => v,
      from: v => v.toISOString(),
    },
  })
  @IsDateString()
  date: string;

  @ManyToOne(() => User, user => user.books)
  user: User;
}
