// src/pages/_app.tsx
import "bootstrap/dist/css/bootstrap.min.css"; // Importer Bootstrap
import { AppProps } from "next/app"; // Importer AppProps de Next.js
import { useEffect } from "react";
import { useRouter } from "next/router";
import "../globals.css";

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    // Vérifiez si localStorage est accessible
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("gitlab_token");
    const gitlabUrl = localStorage.getItem("gitlab_url");

    if (!token || (!gitlabUrl && router.pathname !== "/login")) {
      // Ajoutez une vérification pour éviter les boucles infinies
      if (router.pathname !== "/login") {
        router.push("/login"); // Rediriger vers la page de connexion si non authentifié
      }
    }
  }, [router]);

  return <Component {...pageProps} />;
}

export default MyApp;
