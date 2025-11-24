import { Request, Response } from "express";
import jobService from "../services/job.service";
import { JobCreateRequest } from "../types/job.types";

export class JobController {
  /**
   * Create a new job
   */
  public async createJob(req: Request, res: Response): Promise<Response> {
    try {
      const { owner, values, goals, skills, contents, platforms } = req.body as JobCreateRequest;

      if (!owner || !values || !values.title || !values.description) {
        return res.status(400).json({
          error: "Job creation failed",
          message: "owner, values.title, and values.description are required",
        });
      }

      const job = await jobService.createJob({
        owner,
        values,
        goals: goals || [],
        skills: skills || [],
        contents: contents || [],
        platforms: platforms || [],
      });

      return res.status(201).json({
        message: "Job created successfully",
        job: {
          insertedId: job.id.toString(),
        },
        data: job,
      });
    } catch (error) {
      console.error("Create job error:", error);
      return res.status(500).json({
        error: "Job creation failed",
        message: error instanceof Error ? error.message : "Internal server error",
      });
    }
  }

  /**
   * Get all jobs
   */
  public async getAllJobs(req: Request, res: Response): Promise<Response> {
    try {
      const jobs = await jobService.getAllJobs();

      return res.status(200).json({
        message: "Jobs retrieved successfully",
        data: jobs,
      });
    } catch (error) {
      console.error("Get all jobs error:", error);
      return res.status(500).json({
        error: "Fetch jobs failed",
        message: "Internal server error while fetching jobs",
      });
    }
  }

  /**
   * Get job by ID
   */
  public async getJobById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const jobId = Number(id);

      if (isNaN(jobId)) {
        return res.status(400).json({
          error: "Invalid request",
          message: "Job ID must be a number",
        });
      }

      const job = await jobService.getJobById(jobId);

      if (!job) {
        return res.status(404).json({
          error: "Job not found",
          message: `Job with ID ${jobId} not found`,
        });
      }

      return res.status(200).json({
        message: "Job retrieved successfully",
        data: job,
      });
    } catch (error) {
      console.error("Get job error:", error);
      return res.status(500).json({
        error: "Fetch job failed",
        message: "Internal server error while fetching job",
      });
    }
  }

  /**
   * Get jobs by owner
   */
  public async getJobsByOwner(req: Request, res: Response): Promise<Response> {
    try {
      const { ownerId } = req.params;
      const id = Number(ownerId);

      if (isNaN(id)) {
        return res.status(400).json({
          error: "Invalid request",
          message: "Owner ID must be a number",
        });
      }

      const jobs = await jobService.getJobsByOwner(id);

      return res.status(200).json({
        message: "Owner jobs retrieved successfully",
        data: jobs,
      });
    } catch (error) {
      console.error("Get owner jobs error:", error);
      return res.status(500).json({
        error: "Fetch jobs failed",
        message: "Internal server error while fetching owner jobs",
      });
    }
  }

  /**
   * Update job
   */
  public async updateJob(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const jobId = Number(id);

      if (isNaN(jobId)) {
        return res.status(400).json({
          error: "Invalid request",
          message: "Job ID must be a number",
        });
      }

      const job = await jobService.updateJob(jobId, req.body);

      if (!job) {
        return res.status(404).json({
          error: "Job not found",
          message: `Job with ID ${jobId} not found`,
        });
      }

      return res.status(200).json({
        message: "Job updated successfully",
        data: job,
      });
    } catch (error) {
      console.error("Update job error:", error);
      return res.status(500).json({
        error: "Job update failed",
        message: error instanceof Error ? error.message : "Internal server error",
      });
    }
  }

  /**
   * Delete job
   */
  public async deleteJob(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const jobId = Number(id);

      if (isNaN(jobId)) {
        return res.status(400).json({
          error: "Invalid request",
          message: "Job ID must be a number",
        });
      }

      const deleted = await jobService.deleteJob(jobId);

      if (!deleted) {
        return res.status(404).json({
          error: "Job not found",
          message: `Job with ID ${jobId} not found`,
        });
      }

      return res.status(200).json({
        message: "Job deleted successfully",
      });
    } catch (error) {
      console.error("Delete job error:", error);
      return res.status(500).json({
        error: "Job deletion failed",
        message: "Internal server error while deleting job",
      });
    }
  }

  /**
   * Search jobs
   */
  public async searchJobs(req: Request, res: Response): Promise<Response> {
    try {
      const { query } = req.query;

      if (!query || typeof query !== "string") {
        return res.status(400).json({
          error: "Search failed",
          message: "Search query is required",
        });
      }

      const jobs = await jobService.searchJobs(query);

      return res.status(200).json({
        message: "Search completed successfully",
        data: jobs,
      });
    } catch (error) {
      console.error("Search jobs error:", error);
      return res.status(500).json({
        error: "Search failed",
        message: "Internal server error while searching jobs",
      });
    }
  }

  /**
   * Get jobs by category
   */
  public async getJobsByCategory(req: Request, res: Response): Promise<Response> {
    try {
      const { category } = req.params;

      if (!category) {
        return res.status(400).json({
          error: "Invalid request",
          message: "Category is required",
        });
      }

      const jobs = await jobService.getJobsByCategory(category);

      return res.status(200).json({
        message: "Category jobs retrieved successfully",
        data: jobs,
      });
    } catch (error) {
      console.error("Get category jobs error:", error);
      return res.status(500).json({
        error: "Fetch jobs failed",
        message: "Internal server error while fetching category jobs",
      });
    }
  }

  /**
   * Create job proposal
   */
  public async createProposal(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const jobId = Number(id);
      const { proposerId, title, description, proposedBudget, deliverables } = req.body;

      if (isNaN(jobId)) {
        return res.status(400).json({
          error: "Invalid request",
          message: "Job ID must be a number",
        });
      }

      if (!proposerId || !title) {
        return res.status(400).json({
          error: "Proposal creation failed",
          message: "proposerId and title are required",
        });
      }

      const proposal = await jobService.createProposal(jobId, proposerId, {
        title,
        description,
        proposedBudget,
        deliverables,
      });

      return res.status(201).json({
        message: "Proposal created successfully",
        data: proposal,
      });
    } catch (error) {
      console.error("Create proposal error:", error);
      return res.status(500).json({
        error: "Proposal creation failed",
        message: error instanceof Error ? error.message : "Internal server error",
      });
    }
  }

  /**
   * Get job proposals
   */
  public async getJobProposals(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const jobId = Number(id);

      if (isNaN(jobId)) {
        return res.status(400).json({
          error: "Invalid request",
          message: "Job ID must be a number",
        });
      }

      const proposals = await jobService.getJobProposals(jobId);

      return res.status(200).json({
        message: "Proposals retrieved successfully",
        data: proposals,
      });
    } catch (error) {
      console.error("Get proposals error:", error);
      return res.status(500).json({
        error: "Fetch proposals failed",
        message: "Internal server error while fetching proposals",
      });
    }
  }

  /**
   * Update proposal status
   */
  public async updateProposalStatus(req: Request, res: Response): Promise<Response> {
    try {
      const { id, proposalId } = req.params;
      const { status } = req.body;

      const pId = Number(proposalId);

      if (isNaN(pId)) {
        return res.status(400).json({
          error: "Invalid request",
          message: "Proposal ID must be a number",
        });
      }

      if (!status) {
        return res.status(400).json({
          error: "Invalid request",
          message: "Status is required",
        });
      }

      const proposal = await jobService.updateProposalStatus(pId, status);

      if (!proposal) {
        return res.status(404).json({
          error: "Proposal not found",
          message: `Proposal with ID ${pId} not found`,
        });
      }

      return res.status(200).json({
        message: "Proposal status updated successfully",
        data: proposal,
      });
    } catch (error) {
      console.error("Update proposal error:", error);
      return res.status(500).json({
        error: "Update failed",
        message: error instanceof Error ? error.message : "Internal server error",
      });
    }
  }

  /**
   * Delete proposal
   */
  public async deleteProposal(req: Request, res: Response): Promise<Response> {
    try {
      const { id, proposalId } = req.params;
      const pId = Number(proposalId);

      if (isNaN(pId)) {
        return res.status(400).json({
          error: "Invalid request",
          message: "Proposal ID must be a number",
        });
      }

      const deleted = await jobService.deleteProposal(pId);

      if (!deleted) {
        return res.status(404).json({
          error: "Proposal not found",
          message: `Proposal with ID ${pId} not found`,
        });
      }

      return res.status(200).json({
        message: "Proposal deleted successfully",
      });
    } catch (error) {
      console.error("Delete proposal error:", error);
      return res.status(500).json({
        error: "Proposal deletion failed",
        message: "Internal server error while deleting proposal",
      });
    }
  }
}

export default new JobController();
