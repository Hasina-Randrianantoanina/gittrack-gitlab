// lib/gitlab.ts
import axios from "axios";

const gitlabApiUrl = process.env.NEXT_PUBLIC_GITLAB_API_URL;
const gitlabAccessToken = process.env.NEXT_PUBLIC_GITLAB_ACCESS_TOKEN;

console.log("GITLAB_API_URL:", gitlabApiUrl); // Ajout de log
console.log("GITLAB_ACCESS_TOKEN:", gitlabAccessToken ? "Set" : "Not set"); // Ajout de log

if (!gitlabApiUrl) {
  throw new Error("GITLAB_API_URL is not defined");
}

if (!gitlabAccessToken) {
  throw new Error("GITLAB_ACCESS_TOKEN is not defined");
}

const gitlabApi = axios.create({
  baseURL: gitlabApiUrl,
  headers: { "PRIVATE-TOKEN": gitlabAccessToken },
});

export interface Project {
  id: number;
  name: string;
  description?: string | null;
  name_with_namespace?: string;
  path?: string;
  path_with_namespace?: string;
  created_at?: string;
  default_branch?: string;
  tag_list?: string[];
  topics?: string[];
  ssh_url_to_repo?: string;
  http_url_to_repo?: string;
  web_url?: string;
  readme_url?: string;
  avatar_url?: string | null;
  forks_count?: number;
  star_count?: number;
  last_activity_at?: string;
  namespace?: {
    id: number;
    name: string;
    path: string;
    kind: string;
    full_path: string;
    parent_id?: number;
    avatar_url?: string | null;
    web_url: string;
  };
  creator_id: number;
  creator: {
    id: number;
    name: string;
    username: string;
  };
}

export interface Issue {
  id: number;
  iid: number;
  project_id: number;
  title: string;
  description: string;
  state: string;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  labels: string[];
  milestone: {
    id: number;
    iid: number;
    project_id: number;
    title: string;
    description: string;
    state: string;
    created_at: string;
    updated_at: string;
    due_date: string;
    start_date: string;
  } | null;
  assignees: {
    id: number;
    name: string;
    username: string;
    state: string;
    avatar_url: string;
    web_url: string;
  }[];
  author: {
    id: number;
    name: string;
    username: string;
    state: string;
    avatar_url: string;
    web_url: string;
  };
  assignee: {
    id: number;
    name: string;
    username: string;
    state: string;
    avatar_url: string;
    web_url: string;
  } | null;
  user_notes_count: number;
  merge_requests_count: number;
  upvotes: number;
  downvotes: number;
  due_date: string | null;
  confidential: boolean;
  discussion_locked: boolean | null;
  web_url: string;
  time_stats: {
    time_estimate: number;
    total_time_spent: number;
    human_time_estimate: string | null;
    human_total_time_spent: string | null;
  };
  task_completion_status: {
    count: number;
    completed_count: number;
  };
  weight: number | null;
  has_tasks: boolean;
}


export interface ProjectMember {
  id: number;
  name: string;
  username: string;
  access_level: number;
}

export const getProjects = async (): Promise<Project[]> => {
  try {
    console.log("Fetching projects from:", `${gitlabApiUrl}/projects`);
    const response = await gitlabApi.get("/projects");
    return response.data;
  } catch (error) {
    console.error("Error fetching projects:", error);
    throw error; // Re-throw the error after logging
  }
};

export const getProjectIssues = async (projectId: number): Promise<Issue[]> => {
  try {
    console.log(
      `Fetching issues for project ID ${projectId} from: ${gitlabApiUrl}/projects/${projectId}/issues`
    );
    const response = await gitlabApi.get(`/projects/${projectId}/issues`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching issues for project ID ${projectId}:`, error);
    throw error; // Re-throw the error after logging
  }
};

// récupérer les membres du projet
export const getProjectMembers = async (
  projectId: number
): Promise<ProjectMember[]> => {
  try {
    console.log(
      `Fetching members for project ID ${projectId} from: ${gitlabApiUrl}/projects/${projectId}/members/all`
    );
    const response = await gitlabApi.get(`/projects/${projectId}/members/all`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching members for project ID ${projectId}:`, error);
    throw error;
  }
};

// assigner un membre à une issue
export const assignMemberToIssue = async (projectId: number, issueIid: number, userId: number): Promise<void> => {
  try {
    console.log(`Assigning user ${userId} to issue ${issueIid} in project ${projectId}`);
    await gitlabApi.put(`/projects/${projectId}/issues/${issueIid}`, {
      assignee_ids: [userId]
    });
  } catch (error) {
    console.error(`Error assigning user ${userId} to issue ${issueIid} in project ${projectId}:`, error);
    throw error;
  }
};
