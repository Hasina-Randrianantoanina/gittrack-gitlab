// src/pages/unauthorized.tsx

import { FC } from "react";
import { Container, Alert } from "reactstrap";

const UnauthorizedPage: FC = () => (
  <Container>
    <Alert color="danger">
      Vous n&apos;avez pas les permissions nécessaires pour accéder à cette
      page.
    </Alert>
  </Container>
);

export default UnauthorizedPage;
