// lib/gitlab.ts
import axios from "axios";
import { Role } from "./roles";

// const gitlabApiUrl = process.env.NEXT_PUBLIC_GITLAB_API_URL;
// const gitlabAccessToken = process.env.NEXT_PUBLIC_GITLAB_ACCESS_TOKEN;
const gitlabApiUrl = localStorage.getItem("gitlab_url");
const gitlabAccessToken = localStorage.getItem("gitlab_token");

console.log("GITLAB_API_URL:", gitlabApiUrl); // Ajout de log
console.log("GITLAB_ACCESS_TOKEN:", gitlabAccessToken ? "Set" : "Not set"); // Ajout de log

if (!gitlabApiUrl) {
  throw new Error("GITLAB_API_URL is not defined");
}

if (!gitlabAccessToken) {
  throw new Error("GITLAB_ACCESS_TOKEN is not defined");
}

// const gitlabApi = axios.create({
//   baseURL: gitlabApiUrl,
//   headers: { "PRIVATE-TOKEN": gitlabAccessToken },
// });

const gitlabApi = axios.create({
  baseURL: gitlabApiUrl + "/api/v4",
  headers: {
    "PRIVATE-TOKEN": gitlabAccessToken,
  },
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
  open_issues_count?: number; // Ajoutez cette ligne
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

// Dans lib/gitlab.ts
export interface Label {
  id: number;
  name: string;
  description?: string; // Ajoutez d'autres propriétés si nécessaire
  description_html?: string;
  text_color?: string;
  color?: string;
  subscribed?: boolean;
  priority?: number;
  is_project_label?: boolean;
}

// Exemple de type pour les jalons
export interface Milestone {
  id: number;
  title: string;
  description: string | null;
  state: string;
  created_at: string;
  updated_at: string;
  due_date: string | null;
}

// Exemple de type pour les statistiques des problèmes
export interface IssuesStatistics {
  total_count: number;
  opened_count: number;
  closed_count: number;
}

// Exemple de type pour les événements
export interface Event {
  id: number;
  action_name: string;
  author?: UserInfo; // Utilisez votre interface UserInfo existante
  created_at: string;
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

export interface UserInfo {
  id: number;
  name: string;
  username: string;
  email: string;
  avatar_url: string;
  role: Role;
}

export const getUserInfo = async (): Promise<UserInfo> => {
  try {
    const response = await axios.get(`${gitlabApiUrl}/user`, {
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_GITLAB_ACCESS_TOKEN}`,
      },
    });

    const userInfo = response.data;

    // Mappez le niveau d'accès à un rôle
    userInfo.role = mapGitLabAccessLevelToRole(userInfo.access_level);

    return userInfo;
  } catch (error) {
    console.error("Error fetching user information:", error);
    throw error;
  }
};

const mapGitLabAccessLevelToRole = (accessLevel: number): Role => {
  switch (accessLevel) {
    case 10:
      return Role.Guest;
    case 20:
      return Role.Reporter;
    case 30:
      return Role.Developer;
    case 40:
      return Role.Maintainer;
    case 50:
      return Role.Owner;
    default:
      return Role.Guest; // Par défaut, renvoyez Guest
  }
};

// Récupérer les informations d'un utilisateur par ID
export const fetchUserById = async (userId: number): Promise<UserInfo> => {
  try {
    const response = await gitlabApi.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user information:", error);
    throw error;
  }
};

// Récupérer les détails d'un projet par ID
export const getProjectDetails = async (projectId: number): Promise<Project> => {
  try {
    const response = await gitlabApi.get(`/projects/${projectId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching project details for project ID ${projectId}:`, error);
    throw error;
  }
};

// Récupérer les jalons associés à un projet
export const getProjectMilestones = async (projectId: number): Promise<Milestone[]> => {
  try {
    const response = await gitlabApi.get(`/projects/${projectId}/milestones`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching milestones for project ID ${projectId}:`, error);
    throw error;
  }
};

// Récupérer les labels d'un projet
/* export const getProjectLabels = async (
  projectId: number
): Promise<{ id: number; name: string }[]> => {
  try {
    const response = await gitlabApi.get(`/projects/${projectId}/labels`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching labels for project ID ${projectId}:`, error);
    throw error;
  }
}; */

// Récupérer les labels d'un projet
export const getProjectLabels = async (projectId: number): Promise<Label[]> => {
  try {
    const response = await gitlabApi.get(`/projects/${projectId}/labels`);
    // Transformez les labels en objets avec id et name
    return response.data.map((label: Label) => ({
      id: label.id, // Assurez-vous que l'API renvoie un ID valide
      name: label.name,
    }));
  } catch (error) {
    console.error(`Error fetching labels for project ID ${projectId}:`, error);
    throw error;
  }
};
// Récupérer les statistiques des problèmes d'un projet
export const getProjectIssuesStatistics = async (
  projectId: number
): Promise<IssuesStatistics> => {
  try {
    const response = await gitlabApi.get(
      `/projects/${projectId}/issues_statistics`
    );
    return response.data;
  } catch (error) {
    console.error(
      `Error fetching issues statistics for project ID ${projectId}:`,
      error
    );
    throw error;
  }
};

// Récupérer l'historique des activités d'un projet
export const getProjectEvents = async (projectId: number): Promise<Event[]> => {
  try {
    const response = await gitlabApi.get(`/projects/${projectId}/events`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching events for project ID ${projectId}:`, error);
    throw error;
  }
};

// In src/lib/gitlab.ts
export interface MergeRequest {
  id: number;
  iid: number;
  project_id: number;
  title: string;
  description: string;
  state: string;
  created_at: string;
  updated_at: string;
  merge_status: string;
  merge_when_pipeline_succeeds?: boolean;
  // Add other necessary properties
}

const getToken = (): string => {
  return process.env.NEXT_PUBLIC_GITLAB_ACCESS_TOKEN || "";
};

export const getProjectMergeRequests = async (
  projectId: number
): Promise<MergeRequest[]> => {
  try {
    const response = await axios.get(
      `${gitlabApiUrl}/projects/${projectId}/merge_requests`,
      {
        headers: { Authorization: `Bearer ${getToken()}` },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des merge requests:", error);
    throw error;
  }
};