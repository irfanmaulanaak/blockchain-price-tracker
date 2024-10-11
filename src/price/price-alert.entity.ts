import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class PriceAlert {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  chain: string;

  @Column('decimal', { precision: 18, scale: 8 })
  targetPrice: number;

  @Column()
  email: string;

  @Column({ default: false })
  triggered: boolean;
}