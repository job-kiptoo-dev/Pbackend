import { DataSource } from "typeorm";
import { User } from "./entity/User";
import { SocialVerification } from "./entity/SocialVerification";
import { Business } from "./entity/Business.entity";
import { BusinessMember } from "./entity/BusinessMember.entity";
import { CreatorProfile } from "./entity/CreatorProfile.entity";
import {
  Campaign,
  CampaignMilestone,
  CampaignTeam,
  CampaignFeedback,
  CampaignTeamMember,
} from "./entity/Campaign.entity";
import { CollaborationEntity } from "./entity/Collaboration.entity";
import { Job, JobProposal } from "./entity/Job.entity";
import { BrandProfile } from "./entity/BrandProfile.entity";
import dotenv from "dotenv";

dotenv.config();

const isRender = !!process.env.RENDER;

const AppDataSource = new DataSource({
  type: "postgres",

  url: process.env.DATABASE_URL,

  ssl: isRender
    ? { rejectUnauthorized: false }
    : false,

  entities: [
    User,
    SocialVerification,
    Business,
    BusinessMember,
    CreatorProfile,
    Campaign,
    CampaignMilestone,
    CampaignTeam,
    CampaignFeedback,
    CampaignTeamMember,
    CollaborationEntity,
    Job,
    JobProposal,
    BrandProfile,
  ],

  synchronize: true,
});

export default AppDataSource;
