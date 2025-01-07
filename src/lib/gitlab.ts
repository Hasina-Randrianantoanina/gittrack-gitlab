// lib/gitlab.ts
import axios, { AxiosError } from "axios";
import { Role } from "./roles";

const createGitlabApi = (gitlabApiUrl: string, gitlabAccessToken: string) => {
  if (!gitlabApiUrl.startsWith("https://")) {
    throw new Error("GITLAB_API_URL must use HTTPS");
  }
  return axios.create({
    baseURL: gitlabApiUrl + "/api/v4",
    headers: {
      "PRIVATE-TOKEN": gitlabAccessToken,
    },
  });
};

export interface IssueNote {
  id: number;
  body: string;
  author: {
    id: number;
    username: string;
  };
  created_at: string;
  updated_at: string;
  // Ajoutez d'autres propriétés si nécessaire
}

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
  open_issues_count?: number;
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
  blocked_by_issue_ids?: number[]; // Ajoutez cette ligne pour les dépendances
}

export interface Label {
  id: number;
  name: string;
  description?: string;
  description_html?: string;
  text_color?: string;
  color?: string;
  subscribed?: boolean;
  priority?: number;
  is_project_label?: boolean;
}

export interface Milestone {
  id: number;
  title: string;
  description: string | null;
  state: string;
  created_at: string;
  updated_at: string;
  due_date: string | null;
}

export interface IssuesStatistics {
  total_count: number;
  opened_count: number;
  closed_count: number;
}

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

export interface UserInfo {
  id: number;
  name: string;
  username: string;
  email: string;
  avatar_url: string;
  role: Role;
}

// Exemple de type pour les merge requests
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

// Fonction pour récupérer les projets
export const getProjects = async (
  gitlabApiUrl: string,
  gitlabAccessToken: string
): Promise<Project[]> => {
  try {
    const gitlabApi = createGitlabApi(gitlabApiUrl, gitlabAccessToken);
    const response = await gitlabApi.get("/projects");
    return response.data;
  } catch (error) {
    console.error("Error fetching projects:", error);
    throw error; // Re-throw the error after logging
  }
};

// Fonction pour récupérer les issues d'un projet
export const getProjectIssues = async (
  projectId: number,
  gitlabApiUrl: string,
  gitlabAccessToken: string
): Promise<Issue[]> => {
  try {
    const gitlabApi = createGitlabApi(gitlabApiUrl, gitlabAccessToken);
    const response = await gitlabApi.get(`/projects/${projectId}/issues`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching issues for project ID ${projectId}:`, error);
    throw error; // Re-throw the error after logging
  }
};

// Fonction pour récupérer les membres d'un projet
export const getProjectMembers = async (
  projectId: number,
  gitlabApiUrl: string,
  gitlabAccessToken: string
): Promise<ProjectMember[]> => {
  try {
    const gitlabApi = createGitlabApi(gitlabApiUrl, gitlabAccessToken);
    const response = await gitlabApi.get(`/projects/${projectId}/members/all`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching members for project ID ${projectId}:`, error);
    throw error;
  }
};

// Fonction pour assigner un membre à une issue
export const assignMemberToIssue = async (
  projectId: number,
  issueIid: number,
  userId: number,
  gitlabApiUrl: string,
  gitlabAccessToken: string
): Promise<void> => {
  try {
    const gitlabApi = createGitlabApi(gitlabApiUrl, gitlabAccessToken);
    await gitlabApi.put(`/projects/${projectId}/issues/${issueIid}`, {
      assignee_ids: [userId],
    });
  } catch (error) {
    console.error(
      `Error assigning user ${userId} to issue ${issueIid} in project ${projectId}:`,
      error
    );
    throw error;
  }
};

// Fonction pour récupérer les informations de l'utilisateur
export const getUserInfo = async (
  gitlabApiUrl: string,
  gitlabAccessToken: string
): Promise<UserInfo> => {
  try {
    const gitlabApi = createGitlabApi(gitlabApiUrl, gitlabAccessToken);
    const response = await gitlabApi.get("/user");
    const userInfo = response.data;

    // Mappez le niveau d'accès à un rôle
    userInfo.role = mapGitLabAccessLevelToRole(userInfo.access_level);

    return userInfo;
  } catch (error) {
    console.error("Error fetching user information:", error);
    throw error;
  }
};

// Fonction pour mapper le niveau d'accès à un rôle
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
export const fetchUserById = async (
  userId: number,
  gitlabApiUrl: string,
  gitlabAccessToken: string
): Promise<UserInfo> => {
  try {
    const gitlabApi = createGitlabApi(gitlabApiUrl, gitlabAccessToken);
    const response = await gitlabApi.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user information:", error);
    throw error;
  }
};

// Récupérer les détails d'un projet par ID
export const getProjectDetails = async (
  projectId: number,
  gitlabApiUrl: string,
  gitlabAccessToken: string
): Promise<Project> => {
  try {
    const gitlabApi = createGitlabApi(gitlabApiUrl, gitlabAccessToken);
    const response = await gitlabApi.get(`/projects/${projectId}`);
    return response.data;
  } catch (error) {
    console.error(
      `Error fetching project details for project ID ${projectId}:`,
      error
    );
    throw error;
  }
};

// Récupérer les jalons associés à un projet
export const getProjectMilestones = async (
  projectId: number,
  gitlabApiUrl: string,
  gitlabAccessToken: string
): Promise<Milestone[]> => {
  try {
    const gitlabApi = createGitlabApi(gitlabApiUrl, gitlabAccessToken);
    const response = await gitlabApi.get(`/projects/${projectId}/milestones`);
    return response.data;
  } catch (error) {
    console.error(
      `Error fetching milestones for project ID ${projectId}:`,
      error
    );
    throw error;
  }
};

// Récupérer les labels d'un projet
export const getProjectLabels = async (
  projectId: number,
  gitlabApiUrl: string,
  gitlabAccessToken: string
): Promise<Label[]> => {
  try {
    const gitlabApi = createGitlabApi(gitlabApiUrl, gitlabAccessToken);
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
  projectId: number,
  gitlabApiUrl: string,
  gitlabAccessToken: string
): Promise<IssuesStatistics> => {
  try {
    const gitlabApi = createGitlabApi(gitlabApiUrl, gitlabAccessToken);
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
export const getProjectEvents = async (
  projectId: number,
  gitlabApiUrl: string,
  gitlabAccessToken: string
): Promise<Event[]> => {
  try {
    const gitlabApi = createGitlabApi(gitlabApiUrl, gitlabAccessToken);
    const response = await gitlabApi.get(`/projects/${projectId}/events`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching events for project ID ${projectId}:`, error);
    throw error;
  }
};

// Fonction pour récupérer les merge requests d'un projet
export const getProjectMergeRequests = async (
  projectId: number,
  gitlabApiUrl: string,
  gitlabAccessToken: string
): Promise<MergeRequest[]> => {
  try {
    const gitlabApi = createGitlabApi(gitlabApiUrl, gitlabAccessToken);
    console.log(
      `Fetching merge requests for project ID ${projectId} from ${gitlabApiUrl}`
    );
    const response = await gitlabApi.get(
      `/projects/${projectId}/merge_requests`
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      if (axiosError.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error(`Error response: ${axiosError.response.status}`);
        console.error(
          `Error data: ${JSON.stringify(axiosError.response.data)}`
        );
      } else if (axiosError.request) {
        // The request was made but no response was received
        console.error(`Error request: ${axiosError.request}`);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error(`Error message: ${axiosError.message}`);
      }
    } else {
      // Handle non-Axios errors
      console.error(`Non-Axios error: ${error}`);
    }
    throw error;
  }
};

// Fonction pour récupérer les commentaires d'une issue
export const getIssueNotes = async (
  projectId: number,
  issueIid: number,
  gitlabApiUrl: string,
  gitlabAccessToken: string
): Promise<IssueNote[]> => {
  try {
    const gitlabApi = createGitlabApi(gitlabApiUrl, gitlabAccessToken);
    const response = await gitlabApi.get(`/projects/${projectId}/issues/${issueIid}/notes`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching notes for issue ${issueIid} in project ${projectId}:`, error);
    throw error;
  }
};

