import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "./User";
import { Business } from "./Business.entity";

@Entity("jobs")
export class Job extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: "text" })
  description: string;

  @Column({ nullable: true })
  gender: string;

  @Column({ nullable: true })
  availability: string;

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  category: string;

  @Column({ nullable: true })
  age: string;

  @Column({ nullable: true })
  experience: string;

  @Column({ nullable: true })
  priority: string;

  @Column({ nullable: true })
  visibility: string;

  @Column({ nullable: true })
  payment: string;

  @Column({ type: "text", nullable: true })
  paymentdesc: string;

  @Column({ nullable: true })
  link: string;

  @Column({ nullable: true })
  years: string;

  @Column({ type: "simple-array", nullable: true })
  goals: string[];

  @Column({ type: "simple-array", nullable: true })
  skills: string[];

  @Column({ type: "simple-array", nullable: true })
  contents: string[];

  @Column({ type: "simple-array", nullable: true })
  platforms: string[];

  @ManyToOne(() => User, { nullable: false })
  owner: User;

  @Column()
  owner_id: number;

  @ManyToOne(() => Business, { nullable: true })
  business: Business | null;

  @Column({ type: "int", nullable: true })
  business_id: number | null;

  @OneToMany(() => JobProposal, (proposal) => proposal.job, {
    cascade: true,
    eager: true,
  })
  proposals: JobProposal[];

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity("job_proposals")
export class JobProposal extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({ nullable: true })
  proposedBudget: string;

  @Column({ type: "simple-array", nullable: true })
  deliverables: string[];

  @ManyToOne(() => User, { nullable: false })
  proposer: User;

  @Column()
  proposer_id: number;

  @ManyToOne(() => Job, (job) => job.proposals, { onDelete: "CASCADE" })
  job: Job;

  @Column({ default: "pending" })
  status: string; // pending, accepted, rejected

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
