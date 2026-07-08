import { Refine, CanAccess } from "@refinedev/core";
import { DevtoolsPanel, DevtoolsProvider } from "@refinedev/devtools";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";

import routerProvider, {
  DocumentTitleHandler,
  UnsavedChangesNotifier,
} from "@refinedev/react-router";
import { BrowserRouter, Outlet, Route, Routes } from "react-router";
import "./App.css";
import { Toaster } from "./components/refine-ui/notification/toaster";
import { useNotificationProvider } from "./components/refine-ui/notification/use-notification-provider";
import { ThemeProvider } from "./components/refine-ui/theme/theme-provider";
import { dataProvider } from "./providers/data";
import { authProvider } from "./providers/auth";
import { Authenticated } from "@refinedev/core";
import { CatchAllNavigate } from "@refinedev/react-router";
import Login from "./pages/login";
import Register from "./pages/register";
import Dashboard from "./pages/dashboard";
import { BookOpen, Building2, GraduationCap, Home, Users } from "lucide-react";

import { Layout } from "./components/refine-ui/layout/layout";
import SubjectsList from "./pages/subjects/list";
import SubjectsCreate from "./pages/subjects/create";
import SubjectsEdit from "./pages/subjects/edit";
import SubjectsShow from "./pages/subjects/show";
import ClassesList from "./pages/classes/list";
import ClassesCreate from "./pages/classes/create";
import ClassesEdit from "./pages/classes/edit";
import Show from "./pages/classes/show";
import DepartmentsList from "./pages/departments/list";
import DepartmentsCreate from "./pages/departments/create";
import DepartmentsEdit from "./pages/departments/edit";
import DepartmentsShow from "./pages/departments/show";
import UsersList from "./pages/users/list";
import UsersCreate from "./pages/users/create";
import UsersEdit from "./pages/users/edit";

import { accessControlProvider } from "./providers/accessControl";

function App() {
  return (
    <BrowserRouter>
      <RefineKbarProvider>
        <ThemeProvider>
          <DevtoolsProvider>
            <Refine
              dataProvider={dataProvider} 
              authProvider={authProvider}
              accessControlProvider={accessControlProvider}
              notificationProvider={useNotificationProvider()}
              routerProvider={routerProvider}
              options={{
                syncWithLocation: true,
                warnWhenUnsavedChanges: true,
                projectId: "0ZOkI0-nAMkf2-BI4YkH",
              }}

              resources={[
                {
                  name: 'dashboard',
                  list: '/',
                  meta: { label: 'Home', icon: <Home /> },
                },
                {
                  name: 'departments',
                  list: '/departments',
                  create: '/departments/create',
                  show: '/departments/show/:id',
                  edit: '/departments/edit/:id',
                  meta: { label: 'Departments', icon: <Building2 /> },
                },
                {
                  name: 'subjects',
                  list: '/subjects',
                  create: '/subjects/create',
                  edit: '/subjects/edit/:id',
                  show: '/subjects/show/:id',
                  meta: { label: 'Subjects', icon: <BookOpen /> },
                },
                {
                  name: 'classes',
                  list: '/classes',
                  create: '/classes/create',
                  edit: '/classes/edit/:id',
                  show: '/classes/show/:id',
                  meta: { label: 'Classes', icon: <GraduationCap /> },
                },
                {
                  name: 'enrollments',
                },
                {
                  name: 'users',
                  list: '/users',
                  create: '/users/create',
                  edit: '/users/edit/:id',
                  meta: { label: 'Users', icon: <Users /> },
                }
              ]}
            >
              <Routes>
                <Route element={
                    <Authenticated key="authenticated" fallback={<CatchAllNavigate to="/login" />}>
                        <Layout> 
                          <Outlet />
                        </Layout>
                    </Authenticated>
                }>
                
                <Route path="/" element={<Dashboard />}  />

                <Route path="/departments">
                    <Route index element={<DepartmentsList />} />
                    <Route path="create" element={
                        <CanAccess resource="departments" action="create" fallback={<CatchAllNavigate to="/" />}>
                            <DepartmentsCreate />
                        </CanAccess>
                    } />
                    <Route path="edit/:id" element={
                        <CanAccess resource="departments" action="edit" fallback={<CatchAllNavigate to="/" />}>
                            <DepartmentsEdit />
                        </CanAccess>
                    } />
                    <Route path="show/:id" element={<DepartmentsShow />} />
                </Route>
                <Route path="/subjects">  
                    <Route index element={<SubjectsList />} />
                    <Route path="create" element={
                        <CanAccess resource="subjects" action="create" fallback={<CatchAllNavigate to="/" />}>
                            <SubjectsCreate />
                        </CanAccess>
                    } />
                    <Route path="edit/:id" element={
                        <CanAccess resource="subjects" action="edit" fallback={<CatchAllNavigate to="/" />}>
                            <SubjectsEdit />
                        </CanAccess>
                    } />
                    <Route path="show/:id" element={<SubjectsShow />} />
                </Route>
                 <Route path="classes">  
                    <Route index element={<ClassesList />} />
                    <Route path="create" element={
                        <CanAccess resource="classes" action="create" fallback={<CatchAllNavigate to="/" />}>
                            <ClassesCreate />
                        </CanAccess>
                    } />
                    <Route path="edit/:id" element={
                        <CanAccess resource="classes" action="edit" fallback={<CatchAllNavigate to="/" />}>
                            <ClassesEdit />
                        </CanAccess>
                    } />
                    <Route path="show/:id" element={<Show />} />
                </Route>
                <Route path="users">
                    <Route index element={
                        <CanAccess resource="users" action="list" fallback={<CatchAllNavigate to="/" />}>
                            <UsersList />
                        </CanAccess>
                    } />
                    <Route path="create" element={
                        <CanAccess resource="users" action="create" fallback={<CatchAllNavigate to="/" />}>
                            <UsersCreate />
                        </CanAccess>
                    } />
                    <Route path="edit/:id" element={
                        <CanAccess resource="users" action="edit" fallback={<CatchAllNavigate to="/" />}>
                            <UsersEdit />
                        </CanAccess>
                    } />
                </Route>
                
                </Route>
                
                <Route element={
                    <Authenticated key="unauthenticated" fallback={<Outlet />}>
                        <CatchAllNavigate to="/" />
                    </Authenticated>
                }>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                </Route>
              </Routes>
              <Toaster />
              <RefineKbar />
              <UnsavedChangesNotifier />
              <DocumentTitleHandler />
            </Refine>
            <DevtoolsPanel />
          </DevtoolsProvider>
        </ThemeProvider>
      </RefineKbarProvider>
    </BrowserRouter>
  );
}

export default App;
