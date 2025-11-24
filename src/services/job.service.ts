import { Job, JobProposal } from "../db/entity/Job.entity";
import { User } from "../db/entity/User";
import { JobValues, JobCreateRequest } from "../types/job.types";

export class JobService {
  /**
   * Create a new job posting
   */
  async createJob(data: JobCreateRequest): Promise<Job> {
    const owner = await User.findOne({ where: { id: parseInt(data.owner) } });

    if (!owner) {
      throw new Error("Job owner not found");
    }

    const job = Job.create({
      title: data.values.title,
      description: data.values.description,
      gender: data.values.gender,
      availability: data.values.availability,
      location: data.values.location,
      category: data.values.category,
      age: data.values.age,
      experience: data.values.experience,
      priority: data.values.priority,
      visibility: data.values.visibility,
      payment: data.values.payment,
      paymentdesc: data.values.paymentdesc,
      link: data.values.link,
      years: data.values.years,
      goals: data.goals,
      skills: data.skills,
      contents: data.contents,
      platforms: data.platforms,
      owner,
      owner_id: owner.id,
      proposals: [],
      isActive: true,
    });

    return await job.save();
  }

  /**
   * Get all jobs
   */
  async getAllJobs(): Promise<Job[]> {
    return await Job.find({
      relations: ["owner", "proposals"],
      where: { isActive: true },
    });
  }

  /**
   * Get job by ID
   */
  async getJobById(id: number): Promise<Job | null> {
    return await Job.findOne({
      where: { id },
      relations: ["owner", "proposals", "proposals.proposer"],
    });
  }

  /**
   * Get jobs by owner
   */
  async getJobsByOwner(ownerId: number): Promise<Job[]> {
    return await Job.find({
      where: { owner_id: ownerId, isActive: true },
      relations: ["proposals"],
    });
  }

  /**
   * Update job
   */
  async updateJob(
    id: number,
    data: Partial<JobValues & { goals?: string[]; skills?: string[]; contents?: string[]; platforms?: string[] }>
  ): Promise<Job | null> {
    const job = await this.getJobById(id);
    if (!job) return null;

    if (data.title) job.title = data.title;
    if (data.description) job.description = data.description;
    if (data.gender) job.gender = data.gender;
    if (data.availability) job.availability = data.availability;
    if (data.location) job.location = data.location;
    if (data.category) job.category = data.category;
    if (data.age) job.age = data.age;
    if (data.experience) job.experience = data.experience;
    if (data.priority) job.priority = data.priority;
    if (data.visibility) job.visibility = data.visibility;
    if (data.payment) job.payment = data.payment;
    if (data.paymentdesc) job.paymentdesc = data.paymentdesc;
    if (data.link) job.link = data.link;
    if (data.years) job.years = data.years;
    if (data.goals) job.goals = data.goals;
    if (data.skills) job.skills = data.skills;
    if (data.contents) job.contents = data.contents;
    if (data.platforms) job.platforms = data.platforms;

    return await job.save();
  }

  /**
   * Delete job (soft delete via isActive flag)
   */
  async deleteJob(id: number): Promise<boolean> {
    const job = await this.getJobById(id);
    if (!job) return false;

    job.isActive = false;
    await job.save();
    return true;
  }

  /**
   * Search jobs by title, description, or skills
   */
  async searchJobs(query: string): Promise<Job[]> {
    return await Job.createQueryBuilder("job")
      .where("job.isActive = :isActive", { isActive: true })
      .andWhere("job.title ILIKE :query OR job.description ILIKE :query", {
        query: `%${query}%`,
      })
      .leftJoinAndSelect("job.owner", "owner")
      .leftJoinAndSelect("job.proposals", "proposals")
      .getMany();
  }

  /**
   * Get jobs by category
   */
  async getJobsByCategory(category: string): Promise<Job[]> {
    return await Job.find({
      where: { category, isActive: true },
      relations: ["owner", "proposals"],
    });
  }

  /**
   * Create a job proposal
   */
  async createProposal(
    jobId: number,
    proposerId: number,
    data: {
      title: string;
      description?: string;
      proposedBudget?: string;
      deliverables?: string[];
    }
  ): Promise<JobProposal> {
    const job = await this.getJobById(jobId);
    const proposer = await User.findOne({ where: { id: proposerId } });

    if (!job) {
      throw new Error("Job not found");
    }

    if (!proposer) {
      throw new Error("Proposer not found");
    }

    const proposal = JobProposal.create({
      title: data.title,
      description: data.description,
      proposedBudget: data.proposedBudget,
      deliverables: data.deliverables || [],
      job,
      proposer,
      proposer_id: proposerId,
      status: "pending",
    });

    return await proposal.save();
  }

  /**
   * Get proposals for a job
   */
  async getJobProposals(jobId: number): Promise<JobProposal[]> {
    return await JobProposal.find({
      where: { job: { id: jobId } },
      relations: ["proposer"],
    });
  }

  /**
   * Update proposal status
   */
  async updateProposalStatus(proposalId: number, status: string): Promise<JobProposal | null> {
    const proposal = await JobProposal.findOne({ where: { id: proposalId } });
    if (!proposal) return null;

    proposal.status = status;
    return await proposal.save();
  }

  /**
   * Delete proposal
   */
  async deleteProposal(proposalId: number): Promise<boolean> {
    const proposal = await JobProposal.findOne({ where: { id: proposalId } });
    if (!proposal) return false;

    await proposal.remove();
    return true;
  }
}

export default new JobService();
