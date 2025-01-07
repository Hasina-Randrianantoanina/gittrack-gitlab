// pages/help.tsx
import React from "react";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  CardTitle,
  CardText,
  Button,
  ListGroup,
  ListGroupItem,
} from "reactstrap";
import Link from "next/link";

const HelpPage: React.FC = () => {
  return (
    <Container className="py-5">
      <Row>
        <Col md={12}>
          <CardTitle tag="h1" className="text-center mb-4">
            Centre d&apos;aide
          </CardTitle>
        </Col>
      </Row>
      <Row>
        <Col md={12}>
          <Card>
            <CardBody>
              <CardTitle tag="h2">1. Description Fonctionnelle</CardTitle>
              <CardTitle tag="h3">1.1 Fonctionnalités Principales :</CardTitle>
              <CardTitle tag="h4">
                1.1.1 Connexion à GitLab via token d&apos;accès.
              </CardTitle>
              <CardText>
                Les utilisateurs se connectent à l&apos;application en utilisant
                un token d&apos;accès GitLab. Cette fonctionnalité est
                implémentée dans la page de connexion (login.tsx) et utilise
                l&apos;API de GitLab pour valider le token et récupérer les
                informations de l&apos;utilisateur.
              </CardText>
              <CardTitle tag="h4">
                1.1.2 Affichage des projets, issues, et merge requests.
              </CardTitle>
              <CardText>
                L&apos;application affiche les projets, issues, et merge
                requests associés au compte GitLab de l&apos;utilisateur. Ces
                données sont récupérées via les API de GitLab et affichées dans
                les pages correspondantes (overview.tsx).
              </CardText>
              <CardTitle tag="h4">
                1.1.3 Calendrier des issues et merge requests.
              </CardTitle>
              <CardText>
                Un calendrier interactif affiche les issues et les merge
                requests, permettant aux utilisateurs de visualiser les dates de
                début et de fin de ces éléments. Cette fonctionnalité est
                implémentée dans le composant Calendar.tsx et utilise la
                bibliothèque react-big-calendar.
              </CardText>
              <CardTitle tag="h4">1.1.4 Tableau de bord des projets.</CardTitle>
              <CardText>
                Le tableau de bord affiche des informations clés sur les
                projets, telles que le nombre d&apos;issues ouvertes, la
                dernière activité, etc. Cette fonctionnalité est implémentée
                dans le composant Dashboard.tsx.
              </CardText>
              <CardTitle tag="h4">
                1.1.5 Gestion des permissions et des rôles.
              </CardTitle>
              <CardText>
                L&apos;application gère les permissions et les rôles des
                utilisateurs, en vérifiant leurs accès avant de leur accorder
                certaines fonctionnalités. Cette gestion est réalisée via le
                hook useUserInfo et le composant withPermission.
              </CardText>

              <CardTitle tag="h2">2. Cas d&apos;Utilisation</CardTitle>
              <CardTitle tag="h3">2.1 Acteurs et Scénarios :</CardTitle>
              <CardText>Utilisateurs avec différents rôles :</CardText>
              <ListGroup>
                <ListGroupItem style={{ border: "none" }}>
                  Guest : Peut voir les projets publics et les issues ouvertes.
                </ListGroupItem>
                <ListGroupItem style={{ border: "none" }}>
                  Reporter : Peut créer des issues, commenter les discussions,
                  et voir les pipelines publics.
                </ListGroupItem>
                <ListGroupItem style={{ border: "none" }}>
                  Developer : Peut push des branches, créer et éditer des merge
                  requests, et gérer les artifacts.
                </ListGroupItem>
                <ListGroupItem style={{ border: "none" }}>
                  Maintainer : Peut gérer les branches protégées, supprimer des
                  projets, et configurer les intégrations.
                </ListGroupItem>
                <ListGroupItem style={{ border: "none" }}>
                  Owner : Peut transférer des projets, gérer les rôles de
                  groupe, et accéder aux factures.
                </ListGroupItem>
                <ListGroupItem style={{ border: "none" }}>
                  Administrator : Peut supprimer des utilisateurs et des
                  projets, modifier les paramètres globaux, et accéder à toutes
                  les données.
                </ListGroupItem>
              </ListGroup>
              <CardText>Scénarios d&apos;utilisation :</CardText>
              <ListGroup>
                <ListGroupItem style={{ border: "none" }}>
                  Connexion : L&apos;utilisateur se connecte à
                  l&apos;application en entrant son token d&apos;accès GitLab et
                  l&apos;URL de son instance GitLab.
                </ListGroupItem>
                <ListGroupItem style={{ border: "none" }}>
                  Affichage des Projets : L&apos;utilisateur navigue vers la
                  page d&apos;accueil ou la page de vue d&apos;ensemble pour
                  voir la liste des projets associés à son compte.
                </ListGroupItem>
                <ListGroupItem style={{ border: "none" }}>
                  Assignation des Issues : L&apos;utilisateur sélectionne un
                  projet et une issue, puis assigne un membre du projet à cette
                  issue en utilisant les fonctionnalités de gestion des issues.
                </ListGroupItem>
              </ListGroup>

              <CardTitle tag="h2">3. Flux de Travail</CardTitle>
              <CardTitle tag="h3">3.1 Workflow des Utilisateurs :</CardTitle>
              <CardText>Étape 1 : Connexion</CardText>
              <CardText>
                L&apos;utilisateur accède à la page de connexion et entre son
                token d&apos;accès GitLab et l&apos;URL de son instance GitLab.
              </CardText>
              <CardText>Étape 2 : Sélection du Projet</CardText>
              <CardText>
                Après la connexion, l&apos;utilisateur est redirigé vers la page
                d&apos;accueil ou la page de vue d&apos;ensemble où il peut
                sélectionner un projet.
              </CardText>
              <CardText>
                Étape 3 : Affichage des Issues et Merge Requests
              </CardText>
              <CardText>
                L&apos;utilisateur navigue vers la page des issues ou du
                calendrier pour voir les issues et les merge requests associés
                au projet sélectionné.
              </CardText>
              <CardText>
                Étape 4 : Gestion des Issues et Merge Requests
              </CardText>
              <CardText>
                L&apos;utilisateur peut assigner des membres aux issues, créer
                de nouvelles issues ou merge requests, et gérer les permissions
                selon son rôle.
              </CardText>
              <CardText>Étape 5 : Visualisation du Tableau de Bord</CardText>
              <CardText>
                L&apos;utilisateur peut consulter le tableau de bord pour voir
                les informations clés sur les projets.
              </CardText>

              <CardTitle tag="h2">4. Interface Utilisateur</CardTitle>
              <CardTitle tag="h3">
                4.1 Description de l&apos;Interface :
              </CardTitle>
              <CardText>Structure et navigation :</CardText>
              <ListGroup>
                <ListGroupItem style={{ border: "none" }}>
                  L&apos;application est structurée en pages principales
                  (connexion, accueil, vue d&apos;ensemble, calendrier) avec une
                  navigation intuitive.
                </ListGroupItem>
                <ListGroupItem style={{ border: "none" }}>
                  Les composants UI clés incluent des boutons, des formulaires,
                  des calendriers, et des tableaux de bord.
                </ListGroupItem>
              </ListGroup>
              <CardText>Composants UI clés et leur rôle :</CardText>
              <ListGroup>
                <ListGroupItem style={{ border: "none" }}>
                  Boutons : Utilisés pour les actions comme se connecter,
                  assigner des membres, créer des issues, etc.
                </ListGroupItem>
                <ListGroupItem style={{ border: "none" }}>
                  Formulaires : Utilisés pour la connexion et la saisie des
                  informations nécessaires.
                </ListGroupItem>
                <ListGroupItem style={{ border: "none" }}>
                  Calendrier : Affiche les issues et les merge requests dans un
                  format calendrier interactif.
                </ListGroupItem>
                <ListGroupItem style={{ border: "none" }}>
                  Tableau de Bord : Affiche des informations clés sur les
                  projets, comme le nombre d&apos;issues ouvertes et la dernière
                  activité.
                </ListGroupItem>
              </ListGroup>

              <CardTitle tag="h2">5. Exigences Fonctionnelles</CardTitle>
              <CardTitle tag="h3">5.1 Exigences Utilisateur :</CardTitle>
              <CardText>Liste des Exigences fonctionnelles :</CardText>
              <ListGroup>
                <ListGroupItem style={{ border: "none" }}>
                  Connexion sécurisée via token d&apos;accès GitLab.
                </ListGroupItem>
                <ListGroupItem style={{ border: "none" }}>
                  Affichage des projets, issues, et merge requests associés au
                  compte GitLab.
                </ListGroupItem>
                <ListGroupItem style={{ border: "none" }}>
                  Calendrier interactif pour les issues et les merge requests.
                </ListGroupItem>
                <ListGroupItem style={{ border: "none" }}>
                  Tableau de bord des projets avec des informations clés.
                </ListGroupItem>
                <ListGroupItem style={{ border: "none" }}>
                  Gestion des permissions et des rôles.
                </ListGroupItem>
                <ListGroupItem style={{ border: "none" }}>
                  Assignation des membres aux issues.
                </ListGroupItem>
                <ListGroupItem style={{ border: "none" }}>
                  Création et édition des issues et merge requests.
                </ListGroupItem>
              </ListGroup>
              <CardText>Priorisation des exigences :</CardText>
              <ListGroup>
                <ListGroupItem style={{ border: "none" }}>
                  Connexion Sécurisée : Priorité haute.
                </ListGroupItem>
                <ListGroupItem style={{ border: "none" }}>
                  Affichage des Projets et Issues : Priorité haute.
                </ListGroupItem>
                <ListGroupItem style={{ border: "none" }}>
                  Calendrier Interactif : Priorité moyenne.
                </ListGroupItem>
                <ListGroupItem style={{ border: "none" }}>
                  Tableau de Bord : Priorité moyenne.
                </ListGroupItem>
                <ListGroupItem style={{ border: "none" }}>
                  Gestion des Permissions et Rôles : Priorité haute.
                </ListGroupItem>
                <ListGroupItem style={{ border: "none" }}>
                  Assignation des Membres : Priorité moyenne.
                </ListGroupItem>
                <ListGroupItem style={{ border: "none" }}>
                  Création et Édition des Issues et Merge Requests : Priorité
                  moyenne.
                </ListGroupItem>
              </ListGroup>

              <CardTitle tag="h2">6. Intégrations et API</CardTitle>
              <CardTitle tag="h3">
                6.1 Intégrations avec d&apos;autres Systèmes :
              </CardTitle>
              <CardText>
                L&apos;application utilise l&apos;API de GitLab pour récupérer
                les projets, issues, merge requests, et membres. Les endpoints
                utilisés incluent /projects, /projects/project_id/issues,
                /projects/project_id/merge_requests,
                /projects/project_id/members, etc.
              </CardText>
              <CardTitle tag="h3">
                6.2 API utilisée et leurs endpoints.
              </CardTitle>
              <ListGroup>
                <ListGroupItem style={{ border: "none" }}>
                  Récupération des Projets : GET /projects
                </ListGroupItem>
                <ListGroupItem style={{ border: "none" }}>
                  Récupération des Issues d&apos;un Projet : GET
                  /projects/project_id/issues
                </ListGroupItem>
                <ListGroupItem style={{ border: "none" }}>
                  Récupération des Merge Requests d&apos;un Projet : GET
                  /projects/project_id/merge_requests
                </ListGroupItem>
                <ListGroupItem style={{ border: "none" }}>
                  Récupération des Membres d&apos;un Projet : GET
                  /projects/project_id/members
                </ListGroupItem>
                <ListGroupItem style={{ border: "none" }}>
                  Assignation d&apos;un Membre à une Issue : PUT
                  /projects/project_id/issues/issue_iid
                </ListGroupItem>
              </ListGroup>

              <CardTitle tag="h2">7. Documentation Utilisateur</CardTitle>
              <CardTitle tag="h3">7.1 Guide de l&apos;Utilisateur :</CardTitle>
              <CardText>
                Instructions étape par étape pour utiliser l&apos;application :
              </CardText>
              <ListGroup>
                <ListGroupItem style={{ border: "none" }}>
                  Connexion :
                  <ListGroup>
                    <ListGroupItem style={{ border: "none" }}>
                      Accédez à la page de connexion.
                    </ListGroupItem>
                    <ListGroupItem style={{ border: "none" }}>
                      Entrez votre token d&apos;accès GitLab et l&apos;URL de
                      votre instance GitLab.
                    </ListGroupItem>
                    <ListGroupItem style={{ border: "none" }}>
                      Cliquez sur le bouton &quot;Se connecter&quot;.
                    </ListGroupItem>
                  </ListGroup>
                </ListGroupItem>
                <ListGroupItem style={{ border: "none" }}>
                  Sélection du Projet :
                  <ListGroup>
                    <ListGroupItem style={{ border: "none" }}>
                      Naviguez vers la page d&apos;accueil ou la page de vue
                      d&apos;ensemble.
                    </ListGroupItem>
                    <ListGroupItem style={{ border: "none" }}>
                      Sélectionnez un projet dans la liste.
                    </ListGroupItem>
                  </ListGroup>
                </ListGroupItem>
                <ListGroupItem style={{ border: "none" }}>
                  Affichage des Issues et Merge Requests :
                  <ListGroup>
                    <ListGroupItem style={{ border: "none" }}>
                      Naviguez vers la page des issues ou du calendrier.
                    </ListGroupItem>
                    <ListGroupItem style={{ border: "none" }}>
                      Visualisez les issues et les merge requests associés au
                      projet sélectionné.
                    </ListGroupItem>
                  </ListGroup>
                </ListGroupItem>
                <ListGroupItem style={{ border: "none" }}>
                  Gestion des Issues et Merge Requests :
                  <ListGroup>
                    <ListGroupItem style={{ border: "none" }}>
                      Assignez des membres aux issues en utilisant les boutons
                      d&apos;assignation.
                    </ListGroupItem>
                    <ListGroupItem style={{ border: "none" }}>
                      Créez de nouvelles issues ou merge requests en utilisant
                      les formulaires correspondants.
                    </ListGroupItem>
                  </ListGroup>
                </ListGroupItem>
                <ListGroupItem style={{ border: "none" }}>
                  Visualisation du Tableau de Bord :
                  <ListGroup>
                    <ListGroupItem style={{ border: "none" }}>
                      Naviguez vers la page du tableau de bord.
                    </ListGroupItem>
                    <ListGroupItem style={{ border: "none" }}>
                      Visualisez les informations clés sur les projets.
                    </ListGroupItem>
                  </ListGroup>
                </ListGroupItem>
              </ListGroup>
              <CardTitle tag="h3">
                7.2 Conseils et astuces pour une utilisation optimale.
              </CardTitle>
              <ListGroup>
                <ListGroupItem style={{ border: "none" }}>
                  Utilisez le Calendrier pour une Vue Globale : Le calendrier
                  permet de visualiser les dates de début et de fin des issues
                  et merge requests de manière interactive.
                </ListGroupItem>
                <ListGroupItem style={{ border: "none" }}>
                  Assignez des Membres aux Issues : Assigner des membres aux
                  issues aide à gérer les tâches de manière efficace.
                </ListGroupItem>
                <ListGroupItem style={{ border: "none" }}>
                  Utilisez le Tableau de Bord pour les Informations Clés : Le
                  tableau de bord fournit une vue d&apos;ensemble des projets,
                  incluant le nombre d&apos;issues ouvertes et la dernière
                  activité.
                </ListGroupItem>
              </ListGroup>
              <CardText>
                En suivant ces instructions et en comprenant les fonctionnalités
                et les intégrations de l&apos;application, les utilisateurs
                pourront utiliser GitTrack de manière efficace et optimale.
              </CardText>

              <CardTitle tag="h2">
                8. Créer des Issues avec des Dépendances
              </CardTitle>
              <CardText>
                Pour s&apos;assurer que les issues dans GitLab ont des
                dépendances correctement spécifiées, vous pouvez suivre ces
                étapes :
              </CardText>
              <ListGroup>
                <ListGroupItem style={{ border: "none" }}>
                  Accédez à votre projet GitLab.
                </ListGroupItem>
                <ListGroupItem style={{ border: "none" }}>
                  Connectez-vous à votre instance GitLab.
                </ListGroupItem>
                <ListGroupItem style={{ border: "none" }}>
                  Sélectionnez le projet dans lequel vous souhaitez ajouter des
                  issues.
                </ListGroupItem>
                <ListGroupItem style={{ border: "none" }}>
                  Créez une nouvelle issue :
                  <ListGroup>
                    <ListGroupItem style={{ border: "none" }}>
                      Cliquez sur &quot;Issues&quot; dans le menu de gauche.
                    </ListGroupItem>
                    <ListGroupItem style={{ border: "none" }}>
                      Cliquez sur le bouton &quot;New issue&quot;.
                    </ListGroupItem>
                    <ListGroupItem style={{ border: "none" }}>
                      Ajoutez des dépendances dans la description :
                      <CardText>
                        Dans le champ de description de l&apos;issue, ajoutez
                        une section &quot;Dépendances&quot; où vous listez les
                        issues dont cette issue dépend. Par exemple :
                      </CardText>
                      <pre>
                        <code>
                          ## Dépendances
                          <br />
                          - Issue #15
                          <br />- Issue #14
                        </code>
                      </pre>
                      <CardText>
                        Remplacez #15 et #14 par les numéros des issues réelles.
                      </CardText>
                    </ListGroupItem>
                  </ListGroup>
                </ListGroupItem>
                <ListGroupItem style={{ border: "none" }}>
                  Cliquez sur &quot;Submit new issue&quot; pour créer
                  l&apos;issue.
                </ListGroupItem>
              </ListGroup>
              <CardText>
                En suivant ces étapes, vous aurez des flèches de suivi dans le
                tableau Gantt de GitTrack.
              </CardText>
            </CardBody>
          </Card>
        </Col>
      </Row>
      <Row className="mt-4">
        <Col md={12} className="text-center">
          <Link href="/" passHref>
            <Button color="primary">Retour à l&apos;accueil</Button>
          </Link>
        </Col>
      </Row>
    </Container>
  );
};

export default HelpPage;
