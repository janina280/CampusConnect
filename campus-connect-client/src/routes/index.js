import { Suspense, lazy } from "react";
import { Navigate, useRoutes } from "react-router-dom";

// layouts
import DashboardLayout from "../layouts/dashboard";

// config
import { DEFAULT_PATH } from "../config";
import LoadingScreen from "../components/LoadingScreen";
import MainLayout from "../layouts/main";
import Test from "../layouts/dashboard/index-test";

const Loadable = (Component) => (props) => {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Component {...props} />
    </Suspense>
  );
};

export default function Router() {
  return useRoutes([
    {
      path: "/auth",
      element: <MainLayout />,
      children: [
        {
          element: <LoginPage />,
          path: "login",
        },
        {
          element: <RegisterPage />,
          path: "register",
        },
      ],
    },
    {
      path: "/welcome",
      element: <Welcome />, 
    },
    {
      path: "/404",
      element: <Page404 />, 
    },
    {
      path: "/",
      element: <DashboardLayout />,
      children: [
        { element: <Navigate to={DEFAULT_PATH} replace />, index: true },
        { path: "app", element: <GeneralApp /> },
        { path: "settings", element: <Settings /> },
        { path: "group", element: <GroupPage /> },
        { path: "profile", element: <ProfilePage /> },
        { path: "*", element: <Navigate to="/404" replace /> },
        {
          path: "/test",
          element: <Test />
        },
      ],
    },
    { path: "*", element: <Navigate to="/404" replace /> },
  ]);
}
const Welcome = Loadable(
  lazy(() => import("../pages/dashboard/Welcome"))
);
const GeneralApp = Loadable(
  lazy(() => import("../pages/dashboard/GeneralApp"))
);
const Settings = Loadable(lazy(() => import("../pages/dashboard/Settings")));
const GroupPage = Loadable(lazy(() => import("../pages/dashboard/Group")));
const LoginPage = Loadable(lazy(() => import("../pages/auth/Login")));
const ProfilePage = Loadable(lazy(()=> import("../pages/dashboard/Profile")));
const RegisterPage = Loadable(lazy(() => import("../pages/auth/Register")));
const Page404 = Loadable(lazy(() => import("../pages/Page404")));
