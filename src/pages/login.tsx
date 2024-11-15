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
  const router = useRouter();

  const handleLogin = async () => {
    if (token && gitlabUrl) {
      try {
        // Vérifiez l'URL de l'instance GitLab avec le token
        const response = await axios.get(`${gitlabUrl}/api/v4/user`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Si la requête réussit, stockez le token et redirigez
        if (response.status === 200) {
          localStorage.setItem("gitlab_token", token); // Stocker le token
          localStorage.setItem("gitlab_url", gitlabUrl); // Stocker l'URL de l'instance
          router.push("/"); // Rediriger vers la page d'accueil après la connexion
        }
      } catch (err) {
        console.log(err);
        setError("Invalid token or GitLab instance URL."); // Gérer les erreurs
      }
    } else {
      setError("Veuillez saisir l’URL GitLab et votre token d’accès."); // Message d'erreur si les champs sont vides
    }
  };

  return (
    <Container
      style={{ padding: "20px", maxWidth: "400px", marginTop: "50px" }}
    >
      <h1 className="text-center">GitTrack</h1>
      <Form>
        <FormGroup>
          <Label for="gitlabUrl">URL de votre instance GitLab</Label>
          <Input
            type="text"
            id="gitlabUrl"
            placeholder="Entrer l'URL de votre instance GitLab"
            value={gitlabUrl}
            onChange={(e) => setGitlabUrl(e.target.value)} // Mettre à jour l'état de l'URL
          />
        </FormGroup>
        <FormGroup>
          <Label for="token">Token d&apos;accès</Label>
          <Input
            type="text"
            id="token"
            placeholder="Entrer votre Token d'accès Gitlab"
            value={token}
            onChange={(e) => setToken(e.target.value)}
          />
        </FormGroup>
        <Button color="primary" onClick={handleLogin} block>
          Se connecter
        </Button>
        {error && (
          <Alert color="danger" className="mt-3">
            {error}
          </Alert>
        )}{" "}
        {/* Afficher les erreurs */}
      </Form>
    </Container>
  );
};

export default LoginPage;
