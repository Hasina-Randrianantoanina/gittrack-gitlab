// src/pages/report.tsx
import React, { useEffect, useState } from "react";
import {
  getProjects,
  getProjectIssues,
  fetchUserById,
  getProjectDetails,
  getProjectMilestones,
  getProjectLabels,
  getProjectIssuesStatistics,
  getProjectEvents,
  Project,
  Issue,
  UserInfo,
  Milestone, // Assurez-vous d'importer vos types définis
  IssuesStatistics, // Assurez-vous d'importer vos types définis
  Event, // Assurez-vous d'importer vos types définis
} from "../lib/gitlab";
import { Container, Row, Col, Table, Button} from "reactstrap";
import { FiEye } from "react-icons/fi";
import { FaInfoCircle } from "react-icons/fa";

const ReportPage = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [userDetails, setUserDetails] = useState<{ [key: number]: UserInfo }>({} );

  // Nouveaux états pour stocker les détails supplémentaires
  const [projectDetails, setProjectDetails] = useState<Project | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [labels, setLabels] = useState<{ id: number; name: string }[]>([]); // Modifiez le type pour correspondre à la structure des labels
  const [issuesStatistics, setIssuesStatistics] =
    useState<IssuesStatistics | null>(null);
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await getProjects();
        setProjects(data);
      } catch (error) {
        console.error("Erreur lors de la récupération des projets:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const fetchIssuesAndDetails = async (projectId: number) => {
    setLoading(true);
    try {
      // Récupérer les issues du projet
      const data = await getProjectIssues(projectId);
      setIssues(data);

      // Récupérer les détails du projet
      const details = await getProjectDetails(projectId);
      setProjectDetails(details);

      // Récupérer les jalons associés
      const milestonesData = await getProjectMilestones(projectId);
      setMilestones(milestonesData);

      // Récupérer les labels associés
      const labelsData = await getProjectLabels(projectId);
      setLabels(labelsData); // Assurez-vous que labelsData est un tableau d'objets avec id et name

      // Récupérer les statistiques des issues
      const statisticsData = await getProjectIssuesStatistics(projectId);
      setIssuesStatistics(statisticsData);

      // Récupérer l'historique des activités
      const eventsData = await getProjectEvents(projectId);
      setEvents(eventsData);

      // Récupérer les IDs des utilisateurs assignés
      const userIds = data.flatMap((issue) =>
        issue.assignees.map((assignee) => assignee.id)
      );
      const uniqueUserIds = Array.from(new Set(userIds));

      // Récupérer les détails des utilisateurs assignés
      const userPromises = uniqueUserIds.map((id) => fetchUserById(id));
      const users = await Promise.all(userPromises);
      const userMap = users.reduce((acc, user) => {
        acc[user.id] = user;
        return acc;
      }, {} as { [key: number]: UserInfo });

      setUserDetails(userMap);
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des issues et détails:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

    const [activeRow, setActiveRow] = useState<number | null>(null); // État pour suivre la ligne active
    const [hoveredRow, setHoveredRow] = useState<number | null>(null); // État pour suivre la ligne survolée

    const handleRowClick = (projectId: number) => {
      setActiveRow(projectId); // Met à jour l'état avec l'ID du projet cliqué
      fetchIssuesAndDetails(projectId); // Appelle la fonction pour récupérer les détails
    };

   if (loading) return <div>Chargement...</div>;

  return (
    <Container fluid>
      <h1 className="text-left my-4">Rapports</h1>

      <Row>
        {/* Colonne des projets */}
        <Col xs={12} md={4} className="mb-4">
          <h2 className="h5">Projets</h2>
          <div className="table-responsive">
            <Table hover>
              <thead>
                <tr>
                  <th>Nom du Projet</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => (
                  <tr
                    key={project.id}
                    onClick={() => handleRowClick(project.id)} // Gère le clic sur la ligne
                    onMouseEnter={() => setHoveredRow(project.id)} // Gère le survol de la ligne
                    onMouseLeave={() => setHoveredRow(null)} // Réinitialise le survol
                    style={{
                      backgroundColor:
                        activeRow === project.id || hoveredRow === project.id
                          ? "#ffeb3b"
                          : "transparent", // Change la couleur de fond si actif ou survolé
                      cursor: "pointer", // Change le curseur pour indiquer que c'est cliquable
                    }}
                  >
                    <td>{project.name}</td>
                    <td>
                      <Button
                        color={activeRow === project.id ? "success" : "primary"} // Change la couleur du bouton si la ligne est active
                        onClick={(e) => {
                          e.stopPropagation(); // Empêche le clic sur le bouton de déclencher l'événement de ligne
                          fetchIssuesAndDetails(project.id);
                          setActiveRow(project.id); // Met à jour l'état avec l'ID du projet cliqué
                        }}
                        className="d-flex align-items-center px-2 py-1"
                      >
                        {activeRow === project.id ? (
                          <>
                            <FaInfoCircle size={18} className="me-2" />
                            {project.name} {/* Affiche le nom du projet */}
                          </>
                        ) : (
                          <>
                            <FiEye size={18} className="me-2" />
                            Voir
                          </>
                        )}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Col>

        {/* Colonne des détails */}
        <Col xs={12} md={8}>
          {projectDetails && (
            <>
              <h2 className="h5">Détails du Projet</h2>
              <p>
                <strong>Nom :</strong> {projectDetails.name}
              </p>
              <p>
                <strong>Description :</strong> {projectDetails.description}
              </p>
              <p>
                <strong>Créé le :</strong>{" "}
                {projectDetails.created_at
                  ? new Date(projectDetails.created_at).toLocaleDateString()
                  : "Date inconnue"}
              </p>
            </>
          )}

          {/* Issues */}
          <h2 className="h5">Issues du Projet</h2>
          <div className="table-responsive">
            {issues.length > 0 ? (
              <Table striped>
                <thead>
                  <tr>
                    <th>Titre</th>
                    <th>État</th>
                    <th>Assigné à</th>
                    <th>Date de création</th>
                  </tr>
                </thead>
                <tbody>
                  {issues.map((issue) => (
                    <tr key={issue.id}>
                      <td>{issue.title}</td>
                      <td>{issue.state}</td>
                      <td>{issue.assignee?.name || "Non assigné"}</td>
                      <td>{new Date(issue.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            ) : (
              <p>Aucun problème trouvé pour ce projet.</p>
            )}
          </div>

          {/* Milestones */}
          <h2 className="h5">Milestones Associés</h2>
          <div className="table-responsive">
            {milestones.length > 0 ? (
              <Table striped>
                <thead>
                  <tr>
                    <th>Titre</th>
                    <th>Date d&apos;échéance</th>
                    <th>État</th>
                  </tr>
                </thead>
                <tbody>
                  {milestones.map((milestone) => (
                    <tr key={milestone.id}>
                      <td>{milestone.title}</td>
                      <td>
                        {milestone.due_date
                          ? new Date(milestone.due_date).toLocaleDateString()
                          : "Date inconnue"}
                      </td>
                      <td>{milestone.state}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            ) : (
              <p>Aucun jalon trouvé.</p>
            )}
          </div>

          {/* Labels */}
          <h2 className="h5">Labels des Issues</h2>
          <ul className="list-unstyled">
            {labels.length > 0 ? (
              labels.map((label) => <li key={label.id}>{label.name}</li>)
            ) : (
              <p>Aucun label trouvé.</p>
            )}
          </ul>

          {/* Statistiques */}
          <h2 className="h5">Statistiques des Issues</h2>
          {issuesStatistics && (
            <div className="table-responsive">
              <Table striped>
                <thead>
                  <tr>
                    <th>Total</th>
                    <th>Ouverts</th>
                    <th>Fermés</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{issuesStatistics.total_count}</td>
                    <td>{issuesStatistics.opened_count}</td>
                    <td>{issuesStatistics.closed_count}</td>
                  </tr>
                </tbody>
              </Table>
            </div>
          )}

          {/* Utilisateurs assignés */}
          <h2 className="h5">Détails des Utilisateurs Assignés</h2>
          <div className="table-responsive">
            {Object.keys(userDetails).length > 0 ? (
              <Table striped>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nom</th>
                    <th>Nom d&apos;utilisateur</th>
                    <th>Email</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.values(userDetails).map((user) => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>{user.name}</td>
                      <td>{user.username}</td>
                      <td>{user.email}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            ) : (
              <p>Aucun utilisateur assigné trouvé.</p>
            )}
          </div>

          {/* Historique des Activités */}
          {/* Nouvelle section pour afficher les événements */}
          <h2 className="h5">Historique des Activités</h2>
          <div className="table-responsive">
            {events.length > 0 ? (
              <Table striped>
                <thead>
                  {/* En-têtes de colonne pour l'historique des activités */}{" "}
                  <tr>
                    <th>Date</th>
                    <th>Action</th>
                    <th>Auteur</th>
                  </tr>
                </thead>
                {/* Corps du tableau pour afficher les événements */}
                {/* Ajoutez ici le corps du tableau comme précédemment */}
                {/* Exemple de corps de tableau pour les événements */}
                <tbody>
                  {events.map((event) => (
                    <tr key={event.id}>
                      {/* Assurez-vous que la structure de l'événement contient ces propriétés */}{" "}
                      <td>{new Date(event.created_at).toLocaleDateString()}</td>
                      {/* Affichez l'action ou le nom de l'événement */}{" "}
                      <td>{event.action_name}</td>
                      {/* Remplacez par le nom réel de l'auteur si disponible */}
                      {/* Utilisez l'option de sécurité pour accéder à l'auteur */}
                      {/* Vérifiez si l'auteur est défini avant d'accéder à son nom */}
                      {/* Si event.author est un objet avec une propriété name */}
                      {/* Vous pouvez également vérifier si author existe avant d'accéder à name */}
                      {/* Si author n'est pas un objet ou si name n'existe pas, affichez "Inconnu" */}{" "}
                      <td>{event.author?.name || "Inconnu"}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            ) : (
              // Message si aucun événement n'est trouvé
              <p>Aucune activité trouvée.</p>
            )}
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default ReportPage;
