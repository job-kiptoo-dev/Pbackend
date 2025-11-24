import { Campaign, CampaignMilestone, CampaignTeam, CampaignFeedback } from "../db/entity/Campaign.entity";

export class CampaignService {
  /**
   * Create a new campaign
   */
  async createCampaign(data: {
    title: string;
    description?: string;
    goals?: string[];
    budget?: number;
    createdby?: string;
    cocampaign?: string;
    jobId?: string;
  }): Promise<Campaign> {
    const campaign = Campaign.create({
      title: data.title,
      description: data.description,
      goals: data.goals,
      budget: data.budget,
      createdby: data.createdby,
      cocampaign: data.cocampaign,
      jobId: data.jobId,
      active: true,
      milestones: [],
      teams: [],
      feedback: [],
    });

    return await campaign.save();
  }

  /**
   * Get all campaigns
   */
  async getAllCampaigns(): Promise<Campaign[]> {
    return await Campaign.find({
      relations: ["milestones", "teams", "teams.members", "feedback"],
    });
  }

  /**
   * Get a campaign by ID
   */
  async getCampaignById(id: number): Promise<Campaign | null> {
    return await Campaign.findOne({
      where: { id },
      relations: ["milestones", "teams", "teams.members", "feedback"],
    });
  }

  /**
   * Update a campaign
   */
  async updateCampaign(
    id: number,
    data: {
      title?: string;
      description?: string;
      goals?: string[];
      budget?: number;
      active?: boolean;
      cocampaign?: string;
    }
  ): Promise<Campaign | null> {
    const campaign = await this.getCampaignById(id);
    if (!campaign) return null;

    if (data.title) campaign.title = data.title;
    if (data.description) campaign.description = data.description;
    if (data.goals) campaign.goals = data.goals;
    if (data.budget) campaign.budget = data.budget;
    if (typeof data.active === "boolean") campaign.active = data.active;
    if (data.cocampaign) campaign.cocampaign = data.cocampaign;

    return await campaign.save();
  }

  /**
   * Delete a campaign
   */
  async deleteCampaign(id: number): Promise<boolean> {
    const campaign = await this.getCampaignById(id);
    if (!campaign) return false;

    await campaign.remove();
    return true;
  }

  /**
   * Add milestone to campaign
   */
  async addMilestone(campaignId: number, milestone: Partial<CampaignMilestone>): Promise<Campaign | null> {
    const campaign = await this.getCampaignById(campaignId);
    if (!campaign) return null;

    // Create instance and assign properties to avoid TypeORM create() overload
    const newMilestone = new CampaignMilestone();
    Object.assign(newMilestone, milestone);
    newMilestone.campaign = campaign;

    await newMilestone.save();

    // Refresh campaign to get updated milestones
    return await this.getCampaignById(campaignId);
  }

  /**
   * Update milestone
   */
  async updateMilestone(
    campaignId: number,
    milestoneId: number,
    data: Partial<CampaignMilestone>
  ): Promise<CampaignMilestone | null> {
    const milestone = await CampaignMilestone.findOne({
      where: { id: milestoneId, campaign: { id: campaignId } },
    });

    if (!milestone) return null;

    Object.assign(milestone, data);
    return await milestone.save();
  }

  /**
   * Delete milestone
   */
  async deleteMilestone(campaignId: number, milestoneId: number): Promise<boolean> {
    const milestone = await CampaignMilestone.findOne({
      where: { id: milestoneId, campaign: { id: campaignId } },
    });

    if (!milestone) return false;

    await milestone.remove();
    return true;
  }

  /**
   * Add team to campaign
   */
  async addTeam(campaignId: number, team: Partial<CampaignTeam>): Promise<Campaign | null> {
    const campaign = await this.getCampaignById(campaignId);
    if (!campaign) return null;

    const newTeam = new CampaignTeam();
    newTeam.name = team.name || "";
    newTeam.members = team.members || [];
    newTeam.campaign = campaign;

    await newTeam.save();

    // Refresh campaign
    return await this.getCampaignById(campaignId);
  }

  /**
   * Delete team
   */
  async deleteTeam(campaignId: number, teamId: number): Promise<boolean> {
    const team = await CampaignTeam.findOne({
      where: { id: teamId, campaign: { id: campaignId } },
    });

    if (!team) return false;

    await team.remove();
    return true;
  }

  /**
   * Add feedback to campaign
   */
  async addFeedback(campaignId: number, feedback: Partial<CampaignFeedback>): Promise<Campaign | null> {
    const campaign = await this.getCampaignById(campaignId);
    if (!campaign) return null;

    const newFeedback = new CampaignFeedback();
    Object.assign(newFeedback, feedback);
    newFeedback.campaign = campaign;

    await newFeedback.save();

    // Refresh campaign
    return await this.getCampaignById(campaignId);
  }

  /**
   * Get feedback for a campaign
   */
  async getCampaignFeedback(campaignId: number): Promise<CampaignFeedback[]> {
    return await CampaignFeedback.find({
      where: { campaign: { id: campaignId } },
    });
  }

  /**
   * Delete feedback
   */
  async deleteFeedback(campaignId: number, feedbackId: number): Promise<boolean> {
    const feedback = await CampaignFeedback.findOne({
      where: { id: feedbackId, campaign: { id: campaignId } },
    });

    if (!feedback) return false;

    await feedback.remove();
    return true;
  }

  /**
   * Get campaigns by user (created by)
   */
  async getCampaignsByUser(createdby: string): Promise<Campaign[]> {
    return await Campaign.find({
      where: { createdby },
      relations: ["milestones", "teams", "teams.members", "feedback"],
    });
  }

  /**
   * Search campaigns by title or description
   */
  async searchCampaigns(query: string): Promise<Campaign[]> {
    return await Campaign.createQueryBuilder("campaign")
      .where("campaign.title ILIKE :query", { query: `%${query}%` })
      .orWhere("campaign.description ILIKE :query", { query: `%${query}%` })
      .leftJoinAndSelect("campaign.milestones", "milestones")
      .leftJoinAndSelect("campaign.teams", "teams")
      .leftJoinAndSelect("teams.members", "members")
      .leftJoinAndSelect("campaign.feedback", "feedback")
      .getMany();
  }
}

export default new CampaignService();
