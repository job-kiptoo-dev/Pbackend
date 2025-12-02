import {
  BaseEntity,
  Column,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
} from "typeorm";
import { User } from "./User";

@Entity("creator_profiles")
export class CreatorProfile extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, (user) => user.creatorProfile)
  @JoinColumn()
  user: User;

  @Column({ nullable: true })
  profileUrl: string;

  @Column({ nullable: true })
  experience: string;

  @Column({ nullable: true })
  audienceType: string;

  @Column({ nullable: true })
  preferredFormat: string;

  @Column({ nullable: true })
  collaborationPreference: string;

  @Column({ nullable: true })
  industryPreference: string;

  @Column({ nullable: true })
  community: string;

  @Column({ nullable: true })
  rating: number;
}
