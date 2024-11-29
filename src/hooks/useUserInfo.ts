// src/hooks/useUserInfo.ts
import { useState, useEffect } from "react";
import { getUserInfo, UserInfo } from "../lib/gitlab";

export const useUserInfo = () => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = localStorage.getItem("gitlab_token");
        const url = localStorage.getItem("gitlab_url");
        if (!token || !url) {
          throw new Error("Token or URL not defined");
        }
        console.log("Fetching user info from:", url);
        const info = await getUserInfo(url, token);
        setUserInfo(info);
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

  return { userInfo, loading, error };
};
