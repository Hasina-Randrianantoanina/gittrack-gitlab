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
  Milestone,
  IssuesStatistics,
  Event,
} from "../lib/gitlab";
import { Container, Row, Col, Button } from "reactstrap";
import { FaArrowLeft } from "react-icons/fa";
import { useRouter } from "next/router";
import withPermission from "@/components/withPermission";
import ProjectList from "../components/ProjectList";
import ProjectDetails from "../components/ProjectDetails";
import IssuesTable from "../components/IssuesTable";
import MilestonesTable from "../components/MilestonesTable";
import LabelsList from "../components/LabelsList";
import IssuesStatisticsTable from "../components/IssuesStatistics";
import AssignedUsers from "../components/AssignedUsers";
import ActivityHistory from "../components/ActivityHistory";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  TextRun,
} from "docx";
import { saveAs } from "file-saver";

const ReportPage = () => {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [userDetails, setUserDetails] = useState<{ [key: number]: UserInfo }>(
    {}
  );
  const [projectDetails, setProjectDetails] = useState<Project | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [labels, setLabels] = useState<{ id: number; name: string }[]>([]);
  const [issuesStatistics, setIssuesStatistics] =
    useState<IssuesStatistics | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(
    null
  );
  const [activeRow, setActiveRow] = useState<number | null>(null);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [titleFilter, setTitleFilter] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [assigneeFilter, setAssigneeFilter] = useState("");
  const [labelFilter, setLabelFilter] = useState("");

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        if (typeof window === "undefined") return;

        const token = localStorage.getItem("gitlab_token");
        const url = localStorage.getItem("gitlab_url");

        if (!token || !url) {
          router.push("/login");
          return;
        }

        if (!url.startsWith("https://")) {
          throw new Error("GITLAB_API_URL must use HTTPS");
        }

        console.log("Fetching user info from:", url);
        const data = await getProjects(url, token);
        setProjects(data);
      } catch (error) {
        console.error("Erreur lors de la récupération des projets:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  useEffect(() => {
    const fetchIssuesAndDetails = async () => {
      if (!selectedProjectId) return;

      try {
        if (typeof window === "undefined") return;

        const token = localStorage.getItem("gitlab_token");
        const url = localStorage.getItem("gitlab_url");

        if (!token || !url) {
          router.push("/login");
          return;
        }

        if (!url.startsWith("https://")) {
          throw new Error("GITLAB_API_URL must use HTTPS");
        }

        const data = await getProjectIssues(selectedProjectId, url, token);
        setIssues(data);

        const details = await getProjectDetails(selectedProjectId, url, token);
        setProjectDetails(details);

        const milestonesData = await getProjectMilestones(
          selectedProjectId,
          url,
          token
        );
        setMilestones(milestonesData);

        const labelsData = await getProjectLabels(
          selectedProjectId,
          url,
          token
        );
        setLabels(labelsData);

        const statisticsData = await getProjectIssuesStatistics(
          selectedProjectId,
          url,
          token
        );
        setIssuesStatistics(statisticsData);

        const eventsData = await getProjectEvents(
          selectedProjectId,
          url,
          token
        );
        setEvents(eventsData);

        const userIds = data.flatMap((issue) =>
          issue.assignees.map((assignee) => assignee.id)
        );
        const uniqueUserIds = Array.from(new Set(userIds));

        const userPromises = uniqueUserIds.map((id) =>
          fetchUserById(id, url, token)
        );
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

    fetchIssuesAndDetails();
  }, [selectedProjectId]);

  const handleRowClick = (projectId: number) => {
    setActiveRow(projectId);
    setSelectedProjectId(projectId);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    let yOffset = 10;

    doc.text("Rapport des activités", 10, yOffset);
    yOffset += 10;

    doc.text(`Projet: ${projectDetails?.name || "N/A"}`, 10, yOffset);
    yOffset += 10;

    doc.text(`Issues: ${issues.length}`, 10, yOffset);
    yOffset += 10;

    doc.text(`Milestones: ${milestones.length}`, 10, yOffset);
    yOffset += 10;

    doc.text(`Labels: ${labels.length}`, 10, yOffset);
    yOffset += 10;

    doc.text(
      `Statistiques des issues: Total: ${
        issuesStatistics?.total_count || 0
      }, Ouverts: ${issuesStatistics?.opened_count || 0}, Fermés: ${
        issuesStatistics?.closed_count || 0
      }`,
      10,
      yOffset
    );
    yOffset += 10;

    doc.text(`Événements: ${events.length}`, 10, yOffset);
    yOffset += 10;

    // Add Issues Table
    if (issues.length > 0) {
      const issuesTableHeaders = [
        "Titre",
        "État",
        "Assigné à",
        "Date de création",
        "Date d'échéance",
        "Temps estimé",
        "Temps passé",
        "Écart de temps",
        "% de temps réalisé",
        "Étiquettes",
      ];
      const issuesTableData = issues.map((issue) => [
        issue.title || "N/A",
        issue.state || "N/A",
        issue.assignee?.name || "Non assigné",
        new Date(issue.created_at).toLocaleDateString() || "N/A",
        issue.due_date
          ? new Date(issue.due_date).toLocaleDateString()
          : "Pas de date",
        (issue.time_stats.time_estimate / 3600).toFixed(2) + "h" || "N/A",
        (issue.time_stats.total_time_spent / 3600).toFixed(2) + "h" || "N/A",
        (
          (issue.time_stats.time_estimate - issue.time_stats.total_time_spent) /
          3600
        ).toFixed(2) + "h" || "N/A",
        issue.time_stats.time_estimate > 0
          ? Math.min(
              100,
              (issue.time_stats.total_time_spent /
                issue.time_stats.time_estimate) *
                100
            ).toFixed(2) + "%"
          : "0%",
        issue.labels.join(", ") || "N/A",
      ]);
      autoTable(doc, {
        head: [issuesTableHeaders],
        body: issuesTableData,
        startY: yOffset,
      });
      yOffset += 10;
    }

    // Add Milestones Table
    if (milestones.length > 0) {
      const milestonesTableHeaders = ["Titre", "Date d'échéance", "État"];
      const milestonesTableData = milestones.map((milestone) => [
        milestone.title || "N/A",
        milestone.due_date
          ? new Date(milestone.due_date).toLocaleDateString()
          : "Date inconnue",
        milestone.state || "N/A",
      ]);
      autoTable(doc, {
        head: [milestonesTableHeaders],
        body: milestonesTableData,
        startY: yOffset,
      });
      yOffset += 10;
    }

    // Add Labels List
    if (labels.length > 0) {
      doc.text("Labels des Issues:", 10, yOffset);
      yOffset += 10;
      labels.forEach((label) => {
        doc.text(label.name || "N/A", 10, yOffset);
        yOffset += 10;
      });
    }

    // Add Issues Statistics Table
    if (issuesStatistics) {
      const issuesStatisticsTableHeaders = ["Total", "Ouverts", "Fermés"];
      const issuesStatisticsTableData = [
        [
          issuesStatistics?.total_count || 0,
          issuesStatistics?.opened_count || 0,
          issuesStatistics?.closed_count || 0,
        ],
      ];
      autoTable(doc, {
        head: [issuesStatisticsTableHeaders],
        body: issuesStatisticsTableData,
        startY: yOffset,
      });
      yOffset += 10;
    }

    // Add Assigned Users Table
    if (Object.values(userDetails).length > 0) {
      const assignedUsersTableHeaders = [
        "ID",
        "Nom",
        "Nom d'utilisateur",
        "Email",
      ];
      const assignedUsersTableData = Object.values(userDetails).map((user) => [
        user.id || "N/A",
        user.name || "N/A",
        user.username || "N/A",
        user.email || "N/A",
      ]);
      autoTable(doc, {
        head: [assignedUsersTableHeaders],
        body: assignedUsersTableData,
        startY: yOffset,
      });
      yOffset += 10;
    }

    // Add Activity History Table
    if (events.length > 0) {
      const activityHistoryTableHeaders = ["Date", "Action", "Auteur"];
      const activityHistoryTableData = events.map((event) => [
        new Date(event.created_at).toLocaleDateString() || "N/A",
        event.action_name || "N/A",
        event.author?.name || "Inconnu",
      ]);
      autoTable(doc, {
        head: [activityHistoryTableHeaders],
        body: activityHistoryTableData,
        startY: yOffset,
      });
    }

    doc.save("rapport.pdf");
  };

  const exportToWord = () => {
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph("Rapport des activités"),
            new Paragraph(`Projet: ${projectDetails?.name || "N/A"}`),
            new Paragraph(`Issues: ${issues.length}`),
            new Paragraph(`Milestones: ${milestones.length}`),
            new Paragraph(`Labels: ${labels.length}`),
            new Paragraph(
              `Statistiques des issues: Total: ${
                issuesStatistics?.total_count || 0
              }, Ouverts: ${issuesStatistics?.opened_count || 0}, Fermés: ${
                issuesStatistics?.closed_count || 0
              }`
            ),
            new Paragraph(`Événements: ${events.length}`),

            // Add Issues Table
            ...(issues.length > 0
              ? [
                  new Paragraph("Issues du Projet"),
                  new Table({
                    rows: [
                      new TableRow({
                        children: [
                          new TableCell({
                            children: [
                              new Paragraph({
                                children: [
                                  new TextRun({
                                    text: "Titre",
                                    color: "FFFFFF",
                                  }),
                                ],
                              }),
                            ],
                            shading: {
                              type: "solid",
                              color: "0a98d6",
                              fill: "D9D9D9",
                            },
                          }),
                          new TableCell({
                            children: [
                              new Paragraph({
                                children: [
                                  new TextRun({
                                    text: "État",
                                    color: "FFFFFF",
                                  }),
                                ],
                              }),
                            ],
                            shading: {
                              type: "solid",
                              color: "0a98d6",
                              fill: "D9D9D9",
                            },
                          }),
                          new TableCell({
                            children: [
                              new Paragraph({
                                children: [
                                  new TextRun({
                                    text: "Assigné à",
                                    color: "FFFFFF",
                                  }),
                                ],
                              }),
                            ],
                            shading: {
                              type: "solid",
                              color: "0a98d6",
                              fill: "D9D9D9",
                            },
                          }),
                          new TableCell({
                            children: [
                              new Paragraph({
                                children: [
                                  new TextRun({
                                    text: "Date de création",
                                    color: "FFFFFF",
                                  }),
                                ],
                              }),
                            ],
                            shading: {
                              type: "solid",
                              color: "0a98d6",
                              fill: "D9D9D9",
                            },
                          }),
                          new TableCell({
                            children: [
                              new Paragraph({
                                children: [
                                  new TextRun({
                                    text: "Date d'échéance",
                                    color: "FFFFFF",
                                  }),
                                ],
                              }),
                            ],
                            shading: {
                              type: "solid",
                              color: "0a98d6",
                              fill: "D9D9D9",
                            },
                          }),
                          new TableCell({
                            children: [
                              new Paragraph({
                                children: [
                                  new TextRun({
                                    text: "Temps estimé",
                                    color: "FFFFFF",
                                  }),
                                ],
                              }),
                            ],
                            shading: {
                              type: "solid",
                              color: "0a98d6",
                              fill: "D9D9D9",
                            },
                          }),
                          new TableCell({
                            children: [
                              new Paragraph({
                                children: [
                                  new TextRun({
                                    text: "Temps passé",
                                    color: "FFFFFF",
                                  }),
                                ],
                              }),
                            ],
                            shading: {
                              type: "solid",
                              color: "0a98d6",
                              fill: "D9D9D9",
                            },
                          }),
                          new TableCell({
                            children: [
                              new Paragraph({
                                children: [
                                  new TextRun({
                                    text: "Écart de temps",
                                    color: "FFFFFF",
                                  }),
                                ],
                              }),
                            ],
                            shading: {
                              type: "solid",
                              color: "0a98d6",
                              fill: "D9D9D9",
                            },
                          }),
                          new TableCell({
                            children: [
                              new Paragraph({
                                children: [
                                  new TextRun({
                                    text: "% de temps réalisé",
                                    color: "FFFFFF",
                                  }),
                                ],
                              }),
                            ],
                            shading: {
                              type: "solid",
                              color: "0a98d6",
                              fill: "D9D9D9",
                            },
                          }),
                          new TableCell({
                            children: [
                              new Paragraph({
                                children: [
                                  new TextRun({
                                    text: "Étiquettes",
                                    color: "FFFFFF",
                                  }),
                                ],
                              }),
                            ],
                            shading: {
                              type: "solid",
                              color: "0a98d6",
                              fill: "D9D9D9",
                            },
                          }),
                        ],
                      }),
                      ...issues.map(
                        (issue) =>
                          new TableRow({
                            children: [
                              new TableCell({
                                children: [new Paragraph(issue.title || "N/A")],
                              }),
                              new TableCell({
                                children: [new Paragraph(issue.state || "N/A")],
                              }),
                              new TableCell({
                                children: [
                                  new Paragraph(
                                    issue.assignee?.name || "Non assigné"
                                  ),
                                ],
                              }),
                              new TableCell({
                                children: [
                                  new Paragraph(
                                    new Date(
                                      issue.created_at
                                    ).toLocaleDateString() || "N/A"
                                  ),
                                ],
                              }),
                              new TableCell({
                                children: [
                                  new Paragraph(
                                    issue.due_date
                                      ? new Date(
                                          issue.due_date
                                        ).toLocaleDateString()
                                      : "Pas de date"
                                  ),
                                ],
                              }),
                              new TableCell({
                                children: [
                                  new Paragraph(
                                    (
                                      issue.time_stats.time_estimate / 3600
                                    ).toFixed(2) + "h" || "N/A"
                                  ),
                                ],
                              }),
                              new TableCell({
                                children: [
                                  new Paragraph(
                                    (
                                      issue.time_stats.total_time_spent / 3600
                                    ).toFixed(2) + "h" || "N/A"
                                  ),
                                ],
                              }),
                              new TableCell({
                                children: [
                                  new Paragraph(
                                    (
                                      (issue.time_stats.time_estimate -
                                        issue.time_stats.total_time_spent) /
                                      3600
                                    ).toFixed(2) + "h" || "N/A"
                                  ),
                                ],
                              }),
                              new TableCell({
                                children: [
                                  new Paragraph(
                                    issue.time_stats.time_estimate > 0
                                      ? Math.min(
                                          100,
                                          (issue.time_stats.total_time_spent /
                                            issue.time_stats.time_estimate) *
                                            100
                                        ).toFixed(2) + "%"
                                      : "0%"
                                  ),
                                ],
                              }),
                              new TableCell({
                                children: [
                                  new Paragraph(
                                    issue.labels.join(", ") || "N/A"
                                  ),
                                ],
                              }),
                            ],
                          })
                      ),
                    ],
                  }),
                ]
              : []),

            // Add Milestones Table
            ...(milestones.length > 0
              ? [
                  new Paragraph("Milestones Associés"),
                  new Table({
                    rows: [
                      new TableRow({
                        children: [
                          new TableCell({
                            children: [
                              new Paragraph({
                                children: [
                                  new TextRun({
                                    text: "Titre",
                                    color: "FFFFFF",
                                  }),
                                ],
                              }),
                            ],
                            shading: {
                              type: "solid",
                              color: "0a98d6",
                              fill: "D9D9D9",
                            },
                          }),
                          new TableCell({
                            children: [
                              new Paragraph({
                                children: [
                                  new TextRun({
                                    text: "Date d'échéance",
                                    color: "FFFFFF",
                                  }),
                                ],
                              }),
                            ],
                            shading: {
                              type: "solid",
                              color: "0a98d6",
                              fill: "D9D9D9",
                            },
                          }),
                          new TableCell({
                            children: [
                              new Paragraph({
                                children: [
                                  new TextRun({
                                    text: "État",
                                    color: "FFFFFF",
                                  }),
                                ],
                              }),
                            ],
                            shading: {
                              type: "solid",
                              color: "0a98d6",
                              fill: "D9D9D9",
                            },
                          }),
                        ],
                      }),
                      ...milestones.map(
                        (milestone) =>
                          new TableRow({
                            children: [
                              new TableCell({
                                children: [
                                  new Paragraph(milestone.title || "N/A"),
                                ],
                              }),
                              new TableCell({
                                children: [
                                  new Paragraph(
                                    milestone.due_date
                                      ? new Date(
                                          milestone.due_date
                                        ).toLocaleDateString()
                                      : "Date inconnue"
                                  ),
                                ],
                              }),
                              new TableCell({
                                children: [
                                  new Paragraph(milestone.state || "N/A"),
                                ],
                              }),
                            ],
                          })
                      ),
                    ],
                  }),
                ]
              : []),

            // Add Labels List
            ...(labels.length > 0
              ? [
                  new Paragraph("Labels des Issues"),
                  new Paragraph(
                    labels.map((label) => label.name || "N/A").join(", ")
                  ),
                ]
              : []),

            // Add Issues Statistics Table
            ...(issuesStatistics
              ? [
                  new Paragraph("Statistiques des Issues"),
                  new Table({
                    rows: [
                      new TableRow({
                        children: [
                          new TableCell({
                            children: [
                              new Paragraph({
                                children: [
                                  new TextRun({
                                    text: "Total",
                                    color: "FFFFFF",
                                  }),
                                ],
                              }),
                            ],
                            shading: {
                              type: "solid",
                              color: "0a98d6",
                              fill: "D9D9D9",
                            },
                          }),
                          new TableCell({
                            children: [
                              new Paragraph({
                                children: [
                                  new TextRun({
                                    text: "Ouverts",
                                    color: "FFFFFF",
                                  }),
                                ],
                              }),
                            ],
                            shading: {
                              type: "solid",
                              color: "0a98d6",
                              fill: "D9D9D9",
                            },
                          }),
                          new TableCell({
                            children: [
                              new Paragraph({
                                children: [
                                  new TextRun({
                                    text: "Fermés",
                                    color: "FFFFFF",
                                  }),
                                ],
                              }),
                            ],
                            shading: {
                              type: "solid",
                              color: "0a98d6",
                              fill: "D9D9D9",
                            },
                          }),
                        ],
                      }),
                      new TableRow({
                        children: [
                          new TableCell({
                            children: [
                              new Paragraph(
                                issuesStatistics?.total_count?.toString() || "0"
                              ),
                            ],
                          }),
                          new TableCell({
                            children: [
                              new Paragraph(
                                issuesStatistics?.opened_count?.toString() ||
                                  "0"
                              ),
                            ],
                          }),
                          new TableCell({
                            children: [
                              new Paragraph(
                                issuesStatistics?.closed_count?.toString() ||
                                  "0"
                              ),
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),
                ]
              : []),

            // Add Assigned Users Table
            ...(Object.values(userDetails).length > 0
              ? [
                  new Paragraph("Détails des Utilisateurs Assignés"),
                  new Table({
                    rows: [
                      new TableRow({
                        children: [
                          new TableCell({
                            children: [
                              new Paragraph({
                                children: [
                                  new TextRun({ text: "ID", color: "FFFFFF" }),
                                ],
                              }),
                            ],
                            shading: {
                              type: "solid",
                              color: "0a98d6",
                              fill: "D9D9D9",
                            },
                          }),
                          new TableCell({
                            children: [
                              new Paragraph({
                                children: [
                                  new TextRun({ text: "Nom", color: "FFFFFF" }),
                                ],
                              }),
                            ],
                            shading: {
                              type: "solid",
                              color: "0a98d6",
                              fill: "D9D9D9",
                            },
                          }),
                          new TableCell({
                            children: [
                              new Paragraph({
                                children: [
                                  new TextRun({
                                    text: "Nom d'utilisateur",
                                    color: "FFFFFF",
                                  }),
                                ],
                              }),
                            ],
                            shading: {
                              type: "solid",
                              color: "0a98d6",
                              fill: "D9D9D9",
                            },
                          }),
                          new TableCell({
                            children: [
                              new Paragraph({
                                children: [
                                  new TextRun({
                                    text: "Email",
                                    color: "FFFFFF",
                                  }),
                                ],
                              }),
                            ],
                            shading: {
                              type: "solid",
                              color: "0a98d6",
                              fill: "D9D9D9",
                            },
                          }),
                        ],
                      }),
                      ...Object.values(userDetails).map(
                        (user) =>
                          new TableRow({
                            children: [
                              new TableCell({
                                children: [
                                  new Paragraph(user.id?.toString() || "N/A"),
                                ],
                              }),
                              new TableCell({
                                children: [new Paragraph(user.name || "N/A")],
                              }),
                              new TableCell({
                                children: [
                                  new Paragraph(user.username || "N/A"),
                                ],
                              }),
                              new TableCell({
                                children: [
                                  user.email
                                    ? new Paragraph(user.email)
                                    : new Paragraph("N/A"),
                                ],
                              }),
                            ],
                          })
                      ),
                    ],
                  }),
                ]
              : []),

            // Add Activity History Table
            ...(events.length > 0
              ? [
                  new Paragraph("Historique des Activités"),
                  new Table({
                    rows: [
                      new TableRow({
                        children: [
                          new TableCell({
                            children: [
                              new Paragraph({
                                children: [
                                  new TextRun({
                                    text: "Date",
                                    color: "FFFFFF",
                                  }),
                                ],
                              }),
                            ],
                            shading: {
                              type: "solid",
                              color: "0a98d6",
                              fill: "D9D9D9",
                            },
                          }),
                          new TableCell({
                            children: [
                              new Paragraph({
                                children: [
                                  new TextRun({
                                    text: "Action",
                                    color: "FFFFFF",
                                  }),
                                ],
                              }),
                            ],
                            shading: {
                              type: "solid",
                              color: "0a98d6",
                              fill: "D9D9D9",
                            },
                          }),
                          new TableCell({
                            children: [
                              new Paragraph({
                                children: [
                                  new TextRun({
                                    text: "Auteur",
                                    color: "FFFFFF",
                                  }),
                                ],
                              }),
                            ],
                            shading: {
                              type: "solid",
                              color: "0a98d6",
                              fill: "D9D9D9",
                            },
                          }),
                        ],
                      }),
                      ...events.map(
                        (event) =>
                          new TableRow({
                            children: [
                              new TableCell({
                                children: [
                                  new Paragraph(
                                    new Date(
                                      event.created_at
                                    ).toLocaleDateString() || "N/A"
                                  ),
                                ],
                              }),
                              new TableCell({
                                children: [
                                  new Paragraph(event.action_name || "N/A"),
                                ],
                              }),
                              new TableCell({
                                children: [
                                  new Paragraph(
                                    event.author?.name || "Inconnu"
                                  ),
                                ],
                              }),
                            ],
                          })
                      ),
                    ],
                  }),
                ]
              : []),
          ],
        },
      ],
    });

    Packer.toBlob(doc).then((blob) => {
      saveAs(blob, "rapport.docx");
    });
  };


  if (loading)
    return (
      <div className="loading position-absolute top-50 start-50 translate-middle">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement ...</span>
        </div>
      </div>
    );

  return (
    <Container fluid>
      <div className="d-flex justify-content-start my-3">
        <Button
          color="secondary"
          onClick={() => router.push("/")}
          className="d-flex align-items-center"
        >
          <FaArrowLeft className="me-2" /> Retour
        </Button>
      </div>
      <h1 className="text-left my-4">Rapports des activités</h1>
      <Row>
        <Col xs={12} md={4} className="mb-4">
          <h2 className="h5">Projets</h2>
          <ProjectList
            projects={projects}
            activeRow={activeRow}
            hoveredRow={hoveredRow}
            onRowClick={handleRowClick}
            onMouseEnter={setHoveredRow}
            onMouseLeave={() => setHoveredRow(null)}
          />
        </Col>
        <Col xs={12} md={8}>
          <ProjectDetails projectDetails={projectDetails} />
          <h2 className="h5 mb-3">Issues du Projet</h2>
          <IssuesTable
            issues={issues}
            titleFilter={titleFilter}
            stateFilter={stateFilter}
            assigneeFilter={assigneeFilter}
            labelFilter={labelFilter}
            setTitleFilter={setTitleFilter}
            setStateFilter={setStateFilter}
            setAssigneeFilter={setAssigneeFilter}
            setLabelFilter={setLabelFilter}
          />
          <h2 className="h5">Milestones Associés</h2>
          <MilestonesTable milestones={milestones} />
          <h2 className="h5">Labels des Issues</h2>
          <LabelsList labels={labels} />
          <h2 className="h5">Statistiques des Issues</h2>
          <IssuesStatisticsTable issuesStatistics={issuesStatistics} />
          <h2 className="h5">Détails des Utilisateurs Assignés</h2>
          <AssignedUsers userDetails={userDetails} />
          <h2 className="h5">Historique des Activités</h2>
          <ActivityHistory events={events} />
          <div className="mt-4">
            <Button color="primary" onClick={exportToPDF}>
              Exporter en PDF
            </Button>
            <Button color="secondary" className="ms-2" onClick={exportToWord}>
              Exporter en Word
            </Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default withPermission(ReportPage, "read_public_issues");
