// src/app/_app.tsx
import "bootstrap/dist/css/bootstrap.min.css"; // Importer Bootstrap
import { AppProps } from "next/app"; // Importer AppProps de Next.js
import { useEffect } from "react";
import { useRouter } from "next/router";

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("gitlab_token");
    if (!token && router.pathname !== "/login") {
      router.push("/login"); // Rediriger vers la page de connexion si non authentifié
    }
  }, [router]);

  return <Component {...pageProps} />;
}

export default MyApp;
