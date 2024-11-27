import { FC, ComponentType } from "react";
import { useRouter } from "next/router";
import { useUserInfo } from "../hooks/useUserInfo"; // Un hook que nous allons créer
import { permissions } from "../lib/roles";

interface WithPermissionProps {
  requiredPermission: string;
}

const withPermission = <P extends object>(
  WrappedComponent: ComponentType<P>,
  requiredPermission: string
): FC<P & WithPermissionProps> => {
  const ComponentWithPermission: FC<P & WithPermissionProps> = (props) => {
    const router = useRouter();
    const { userInfo, loading } = useUserInfo(); // Récupérez les informations utilisateur

    if (loading) return <div>Loading...</div>; // Affichez un loader pendant le chargement

    if (!userInfo || !permissions[userInfo.role].includes(requiredPermission)) {
      router.push("/unauthorized"); // Redirigez vers une page d'erreur si l'utilisateur n'a pas accès
      return null; // Ne pas rendre le composant
    }

    return <WrappedComponent {...props} />;
  };

  ComponentWithPermission.displayName = `WithPermission(${
    WrappedComponent.displayName || WrappedComponent.name || "Component"
  })`;

  return ComponentWithPermission;
};

export default withPermission;
