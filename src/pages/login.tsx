// src/pages/login.tsx
import { useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import {
  Container,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  Alert,
} from "reactstrap";

const LoginPage = () => {
  const [token, setToken] = useState("");
  const [gitlabUrl, setGitlabUrl] = useState(""); // État pour l'URL de l'instance GitLab
  const [error, setError] = useState("");
  const [supportUrl, setSupportUrl] = useState("https://git.soa.mg/"); // État pour l'URL de support
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Empêche le rechargement de la page
    if (token && gitlabUrl) {
      try {
        // Vérifiez que l'URL commence par HTTPS
        if (!gitlabUrl.startsWith("https://")) {
          throw new Error(
            "L'URL de l'instance GitLab doit commencer par https://"
          );
        }

        // Vérifiez l'URL de l'instance GitLab avec le token
        const response = await axios.get(`${gitlabUrl}/api/v4/user`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Si la requête réussit, stockez le token et redirigez
        if (response.status === 200 && typeof window !== "undefined") {
          localStorage.setItem("gitlab_token", token); // Stocker le token
          localStorage.setItem("gitlab_url", gitlabUrl); // Stocker l'URL de l'instance
          router.push("/"); // Rediriger vers la page d'accueil après la connexion
        }
      } catch (err) {
        console.log(err);
        setError("Token invalide ou URL de l'instance GitLab."); // Gérer les erreurs
      }
    } else {
      setError("Veuillez saisir l’URL GitLab et votre token d’accès."); // Message d'erreur si les champs sont vides
    }
  };

  const handleGitlabUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedUrl = e.target.value;
    setGitlabUrl(selectedUrl);
    if (selectedUrl === "https://git.soa.mg/") {
      setSupportUrl("https://git.soa.mg/");
    } else if (selectedUrl === "https://git.softia.fr/") {
      setSupportUrl("https://git.softia.fr/");
    }
  };

  return (
    <Container
      style={{ padding: "20px", maxWidth: "400px", marginTop: "50px" }}
      className="shadow-sm"
    >
      <h1 className="text-center mb-4">Connexion à GitTrack</h1>
      <Form onSubmit={handleLogin}>
        <FormGroup>
          <Label for="gitlabUrl" className="form-label">
            Instance GitLab
          </Label>
          <Input
            type="select"
            id="gitlabUrl"
            value={gitlabUrl}
            onChange={handleGitlabUrlChange}
            aria-label="Sélectionnez votre instance GitLab"
          >
            <option value="">Sélectionnez votre instance GitLab</option>
            <option value="https://git.soa.mg/">Soa (git.soa.mg)</option>
            <option value="https://git.softia.fr/">
              Softia (git.softia.fr)
            </option>
          </Input>
        </FormGroup>
        <FormGroup>
          <Label for="token" className="form-label">
            Token d&apos;accès
          </Label>
          <Input
            type="text"
            id="token"
            placeholder="Entrer votre Token d'accès Gitlab"
            value={token}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setToken(e.target.value)
            }
            aria-label="Entrer votre Token d'accès Gitlab"
          />
        </FormGroup>
        <Button color="primary" type="submit" block>
          Se connecter
        </Button>
        {error && (
          <Alert color="danger" className="mt-3" role="alert">
            {error}
          </Alert>
        )}
      </Form>
      <div className="text-center mt-3">
        <a
          href={supportUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted"
        >
          Besoin d&apos;aide ?
        </a>
      </div>
    </Container>
  );
};

export default LoginPage;
