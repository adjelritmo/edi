import { RouterProvider } from "react-router-dom"
import { AppProvider } from "./contexts/app_context"
import { createBrowserRouter } from "react-router-dom"
import PrivateRoute from "./components/protected_routes"
import typeUserEnum from "./functions/constants/type_user_enum"

import IndexGuest from "./screens"
import Home from "./screens/onlandpage"
import News from "./screens/news"
import Resources from "./screens/resouces"
import About from "./screens/about"
import Index from "./screens/guest"
import ForgotPassword from "./screens/guest/forgotpassword"
import EmailVerification from "./screens/guest/emailverification"
import PasswordChange from "./screens/guest/chengepassword"
import AuthPage from "./components/guest/loginPage"

import IndexUser from "./screens/users/indexUser"
import Dashboard from "./screens/users/admin/dashboard"
import UsersPage from "./screens/users/admin/users"
import FormsManagement from "./screens/users/admin/forms"
import FormView from "./screens/users/admin/formView"
import ContentManagement from "./screens/users/admin/content-management"
import Centers from "./screens/users/admin/centers"
import FormResponse from "./screens/users/responseForms"

import HomeParticipant from "./screens/users/members/home"
import UserFormsDashboard from "./screens/users/members/forms"
import MyResponsePage from "./screens/users/members/myresponse"

import HomePage from "./screens/users/collaborators/home"
import CenterMembers from "./screens/users/collaborators/users"
import FormsCollaborator from "./screens/users/collaborators/forms"
import FormViewCollaborator from "./screens/users/collaborators/formView"

import Profile from "./screens/users/profile"
import NotFound from "./screens/notfound"
import getFormsUser from "./functions/user/forms/getFormsUser"
import getFormsCollaborator from "./functions/collaborator/forms/getForms"
import getCenterUsers from "./functions/collaborator/users/getUsers"
import FormResponsesView from "./screens/users/collaborators/formResponsesView"
import ReseachUnit from "./screens/users/collaborators/researchUnit"
import PrivateRouteGuest from "./components/protected_routes_guest"
import FormResponsesAdminView from "./screens/users/admin/formResponsesView"
import UserResponsePage from "./screens/users/admin/userResponse"
import FormResultPage from "./screens/users/admin/formResults"




const baseUrlPath = '/edi'

const router = createBrowserRouter([
  {
    path: `${baseUrlPath}/login`,
    element: <AuthPage />
  },

  {
    path: `${baseUrlPath}/`,
    element: <IndexGuest />,
    children: [
      { index: true, element: <Home /> },
      { path: "news", element: <News /> },
      { path: "resources", element: <Resources /> },
      { path: "about", element: <About /> },
    ],
  },

  {
    path: `${baseUrlPath}/user`,
    element: (
      <PrivateRoute accessControl={[typeUserEnum.ADMIN, typeUserEnum.ADMIN_ALPHA]}>
        <IndexUser />
      </PrivateRoute>
    ),
    children: [
      { index: true, element: <Dashboard /> },
      { path: "management-users", element: <UsersPage /> },
      { path: "management-forms", element: <FormsManagement /> },
      { path: "management-forms/view/form/:formId", element: <FormView /> },
      { path: "management-forms/view/form/:formId/responses", element: <FormResponsesAdminView /> },
      { path: "management-forms/view/form/:formId/responses/user", element: <UserResponsePage /> },
      { path: "management-forms/view/form/results", element: <FormResultPage /> },
      { path: "management-contents", element: <ContentManagement /> },
      { path: "forms-response", element: <FormResponse /> },
      { path: "management-centers", element: <Centers /> },
      { path: "resources", element: <Resources /> },
    ],
  },

  {
    path: `${baseUrlPath}/user/coordinator`,
    element: (
      <PrivateRoute accessControl={[typeUserEnum.COLLABORATOR]}>
        <IndexUser />
      </PrivateRoute>
    ),
    children: [
      { index: true, element: <HomePage /> },
      { loader: async () => { return await getCenterUsers() }, path: "management-users", element: <CenterMembers /> },
      { loader: async () => { return await getFormsCollaborator() }, path: "management-forms", element: <FormsCollaborator /> },
      { path: "forms/view", element: <FormViewCollaborator /> },
      { path: "responses-forms", element: <FormResponse /> },
      { path: "your/center", element: <ReseachUnit /> },
      { path: "form/responses/views", element: <FormResponsesView /> },
      { path: "form-response", element: <MyResponsePage /> },
      { path: "resources", element: <Resources /> },
    ],
  },


  {
    path: `${baseUrlPath}/user/participant`,
    element: (
      <PrivateRoute accessControl={[typeUserEnum.PARTICIPANT]}>
        <IndexUser />
      </PrivateRoute>
    ),
    children: [
      { index: true, element: <HomeParticipant /> },
      { path: "contents", element: <News /> },
      { loader: async () => { return await getFormsUser() }, path: "forms", element: <UserFormsDashboard /> },
      { path: "form-response", element: <MyResponsePage /> },
      { path: "resources", element: <Resources /> },
      { path: "responses-forms", element: <FormResponse /> },
    ],
  },


  {
    path: `${baseUrlPath}/profile`,
    element: (
      <PrivateRoute accessControl={[typeUserEnum.PARTICIPANT, typeUserEnum.COLLABORATOR, typeUserEnum.ADMIN, typeUserEnum.ADMIN_ALPHA]}>
        <IndexUser />
      </PrivateRoute>
    ),
    children: [{ index: true, element: <Profile /> }],
  },

  { path: "*", element: <NotFound /> },

])

const guesRoute = {
  path: `${baseUrlPath}/forgot-password`,
  element: <Index />,
  children: [
    { index: true, element: <ForgotPassword /> },
    {
      path: "email-verification",
      element:
        <PrivateRouteGuest accessControl={[typeUserEnum.PASSWORDS]}>
          <EmailVerification />
        </PrivateRouteGuest>
    },
    {
      path: "chenges-passwords",
      element:
        <PrivateRouteGuest accessControl={[typeUserEnum.PASSWORDS]}>
          <PasswordChange />
        </PrivateRouteGuest>
    },
  ],
}


const EDI_PLUS = () => (
  <AppProvider>
    <RouterProvider router={router} />
  </AppProvider>
)

export default EDI_PLUS