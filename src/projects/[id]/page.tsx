// app/projects/[id]/page.tsx
import { getProjectIssues } from "@/lib/gitlab";
import { Container, ListGroup } from "react-bootstrap";

export default async function ProjectPage({
  params,
}: {
  params: { id: string };
}) {
   const token = localStorage.getItem("gitlab_token");
   const url = localStorage.getItem("gitlab_url");
   if (!token || !url) {
     throw new Error("Token or URL not defined");
   }
   console.log("Fetching user info from:", url);
  const issues = await getProjectIssues(parseInt(params.id), url, token);

  return (
    <Container>
      <h1>Project Issues</h1>
      <ListGroup>
        {issues.map((issue) => (
          <ListGroup.Item key={issue.id}>{issue.title}</ListGroup.Item>
        ))}
      </ListGroup>
    </Container>
  );
}
