// src/app/login.tsx
import { useState } from "react";
import { useRouter } from "next/router";

const LoginPage = () => {
  const [token, setToken] = useState("");
  const router = useRouter();

  const handleLogin = () => {
    if (token) {
      localStorage.setItem("gitlab_token", token); // Stocker le token
      router.push("/"); // Rediriger vers la page d'accueil après la connexion
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Login to GitLab</h1>
      <input
        type="text"
        placeholder="Enter your GitLab Access Token"
        value={token}
        onChange={(e) => setToken(e.target.value)}
      />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
};

export default LoginPage;
