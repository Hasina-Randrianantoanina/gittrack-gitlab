// src/hooks/useUserInfo.ts
import { useState, useEffect } from "react";
import {
  getUserInfo,
  getProjects,
  getProjectIssues,
  UserInfo,
  Project,
  Issue,
} from "../lib/gitlab";
import { useRouter } from "next/router";

export const useUserInfo = () => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [issues, setIssues] = useState<Issue[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        // Vérifiez si localStorage est accessible
        if (typeof window === "undefined") {
          throw new Error("localStorage is not available in this environment");
        }

        const token = localStorage.getItem("gitlab_token");
        const url = localStorage.getItem("gitlab_url");

        if (!token || !url) {
          // Rediriger vers la page de connexion si le token ou l'URL ne sont pas définis
          router.push("/login");
          return;
        }

        if (!url.startsWith("https://")) {
          throw new Error("GITLAB_API_URL must use HTTPS");
        }

        console.log("Fetching user info from:", url);
        const info = await getUserInfo(url, token);
        setUserInfo(info);

        const projectsData = await getProjects(url, token);
        setProjects(projectsData);

        if (projectsData.length > 0) {
          const issuesData = await getProjectIssues(
            projectsData[0].id,
            url,
            token
          );
          setIssues(issuesData);
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error("Failed to fetch user info:", error);
          setError(error.message);
        } else {
          console.error("An unknown error occurred:", error);
          setError("An unknown error occurred");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  return { userInfo, projects, issues, loading, error };
};
