import { createBrowserRouter } from "react-router-dom";
import Main from "../layout/Main";
import Home from "../pages/home/home";
import Rent from "../pages/home/Shop/Rent";
import Signup from "../components/Signup";
import Login from "../components/Login";
import UpdateProfile from "../pages/userDashboard/UpdateProfile";
import DashboardLayout from "../layout/DashboardLayout";
import Dashboard from "../pages/dashboard/admin/Dashboard";
import Users from "../pages/dashboard/admin/Users";
import AddRentItem from "../pages/dashboard/admin/AddRentItem";
import VerifyItem from "../pages/dashboard/admin/verifyItem";
import ManageItems from "../pages/dashboard/admin/ManageItems";
import ItemDetail from "../components/ItemDetails"; // Add the import here
import ItemDetails from "../components/ItemDetails";
import KYCForm from "../components/KYCForm";
import AdminPanel from "../pages/dashboard/admin/AdminPanel";
import KYCStatus from "../components/KYCStatus";
import UserDashboardLayout from "../layout/UserDashboardLayout";
import Manageuseritems from "../pages/dashboard/user/Manageuseritems";
import UserDetails from "../pages/userDashboard/userDetails";
import PublicProfile from "../pages/userDashboard/PublicProfile";
import BookItem from "../components/BookItem";
import AdminBookings from "../pages/dashboard/admin/AdminBookings";
import UserBookings from "../pages/dashboard/user/UserBookings";
const router = createBrowserRouter([
  {
    path: "/",
    element: <Main />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/rent",
        element: <Rent />,
      },
      {
        path: "/updateprofile",
        element: <UpdateProfile />,
      },
      {
        path: "/userdetails",
        element: <UserDetails/>,
      },
      {
        path: "/item/:id", // This is the dynamic route for item details
        element: <ItemDetails />, // Add the component here
      },
    ],
  },
  {
    path: "/book/:id",
    element: <BookItem/>,
  },
  {
    path: "/profile/:userId",
    element: <PublicProfile/>,
  },

  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
  {
    path : "kycverify",
    element : <KYCForm/>
  },
  {
    path : "kycstatus",
    element : <KYCStatus/>
  },
  {
    path: "admin-dashboard",
    element: <DashboardLayout />,
    children: [
      {
        path: "",
        element: <Dashboard />,
      },
      {
        path: "users",
        element: <Users />,
      },
      {
        path: "addrentitem",
        element: <AddRentItem />,
      },
      {
        path: "verifyitem",
        element: <VerifyItem />,
      },
      {
        path: "manageitems",
        element: <ManageItems />,
      },

      {
        path: "verifykycadmin",
        element: <AdminPanel/>,
      },
      {
        path: "adminbooking",
        element: <AdminBookings/>,
      },
    ],
  },
  {
    path: "user-dashboard",
    element: <UserDashboardLayout/>,
    children: [
      {
        path: "",
        element: <Dashboard />,
      },
      {
        path: "addrent",
        element: <AddRentItem />,
      },
      {
        path: "manageitems",
        element: <Manageuseritems/>,
      },
      {
        path: "userbooking",
        element: <UserBookings/>,
      },
    ],
  },
]);

export default router;
