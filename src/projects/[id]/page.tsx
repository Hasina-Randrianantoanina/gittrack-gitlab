// app/projects/[id]/page.tsx
import { Container, ListGroup } from "react-bootstrap";
import { getProjectIssues } from "../../../lib/gitlab";

export default async function ProjectPage({
  params,
}: {
  params: { id: string };
}) {
  const issues = await getProjectIssues(parseInt(params.id));

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
