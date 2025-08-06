# Gittrack

Gittrack est une application web développée avec Next.js et React, utilisant l'API de GitLab pour permettre aux utilisateurs de suivre et gérer leurs projets, issues, et merge requests.  
L'application offre une interface intuitive pour visualiser les données sous forme de tableaux de bord, calendriers interactifs, et diagrammes de Gantt.

---

## Technologies utilisées

### Next.js  
C’est un framework React pour construire des applications web de haute performance. Il offre des fonctionnalités comme la renderisation serveur (SSR), la génération de sites statiques (SSG), et les routes API.  
Next.js est utilisé pour créer les pages de l'application, gérer la navigation, et optimiser les performances. Les fichiers comme `_app.tsx` et les pages individuelles (`login.tsx`, `overview.tsx`, etc.) sont des exemples d'utilisation de Next.js.

### TypeScript  
C’est un langage de programmation typé statiquement qui se compile en JavaScript. Il améliore la maintenabilité et la sécurité du code en fournissant un système de types.  
TypeScript est utilisé pour typer les composants, les hooks, et les fonctions de l'application. Les interfaces et les types définis dans `lib/gitlab.ts` et les hooks comme `useUserInfo.ts` sont des exemples d'utilisation de TypeScript.

### Reactstrap  
C’est une bibliothèque de composants UI pour React, basée sur Bootstrap. Elle fournit des composants pré-conçus pour créer des interfaces utilisateur cohérentes et responsives.  
Reactstrap est utilisé pour créer des composants UI tels que des boutons, des formulaires, des cartes, etc. Les fichiers comme `components/Dashboard.tsx` et `pages/login.tsx` utilisent des composants Reactstrap pour construire l'interface utilisateur.

### GitLab API  
L'API de GitLab permet d'interagir avec les ressources de GitLab, telles que les projets, les issues, les merge requests, et les membres.  
L'API de GitLab est utilisée pour récupérer et manipuler les données de GitLab. Le fichier `lib/gitlab.ts` contient des fonctions pour interagir avec l'API de GitLab, comme `getProjects`, `getProjectIssues`, et `assignMemberToIssue`.

---

## Environnement de développement et de production

### Node.js  
C’est un environnement d'exécution JavaScript côté serveur. Il permet de créer des applications serveur et de gérer les requêtes HTTP.  
Node.js est nécessaire pour exécuter le serveur de développement et de production de Next.js. Les commandes `npm run dev` et `npm run start` utilisent Node.js pour démarrer le serveur.

### npm ou Yarn  
npm (Node Package Manager) et Yarn sont des gestionnaires de packages pour Node.js. Ils permettent d'installer, de mettre à jour et de gérer les dépendances du projet.  
npm ou Yarn sont utilisés pour installer les dépendances nécessaires au projet, comme Next.js, TypeScript, Reactstrap, et les bibliothèques GitLab API.  
Les commandes `npm install` et `yarn install` sont utilisées pour installer les dépendances, tandis que `npm run dev` et `yarn dev` sont utilisées pour démarrer le serveur de développement.
