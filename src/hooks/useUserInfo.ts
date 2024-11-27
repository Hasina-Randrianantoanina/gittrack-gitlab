// src/hooks/useUserInfo.ts

import { useState, useEffect } from "react";
import { getUserInfo, UserInfo } from "../lib/gitlab";

export const useUserInfo = () => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const info = await getUserInfo();
        setUserInfo(info);
      } catch (error) {
        console.error("Failed to fetch user info:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  return { userInfo, loading };
};
