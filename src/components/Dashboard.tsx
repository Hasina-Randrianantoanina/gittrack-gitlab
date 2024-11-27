import React from "react";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  CardTitle,
  CardText,
} from "reactstrap";

// Importez le type Project depuis votre fichier de définition de types
import { Project } from "../lib/gitlab";

interface DashboardProps {
  projects: Project[];
}

const Dashboard: React.FC<DashboardProps> = ({ projects }) => {
  return (
    <Container>
      <h2 className="mb-4">Tableau de bord</h2>
      <Row>
        {projects.map((project) => (
          <Col key={project.id} md={4} className="mb-3">
            <Card>
              <CardBody>
                <CardTitle tag="h5">{project.name}</CardTitle>
                <CardText>
                  <strong>Issues ouvertes:</strong>{" "}
                  {project.open_issues_count || "N/A"}
                  <br />
                  <strong>Dernière activité:</strong>{" "}
                  {project.last_activity_at
                    ? new Date(project.last_activity_at).toLocaleDateString()
                    : "N/A"}
                </CardText>
              </CardBody>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default Dashboard;
