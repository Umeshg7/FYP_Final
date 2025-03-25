import { createBrowserRouter } from "react-router-dom";
import Main from "../layout/Main";
import Home from "../pages/home/home";
import Rent from "../pages/home/Shop/Rent";
import Signup from "../components/Signup";
import Login from "../components/Login"
import UpdateProfile from "../pages/userDashboard/UpdateProfile";
import DashboardLayout from "../layout/DashboardLayout";
import Dashboard from "../pages/dashboard/admin/Dashboard";
import Users from "../pages/dashboard/admin/Users";
import AddRentItem from "../pages/dashboard/admin/AddRentItem";
import VerifyItem from "../pages/dashboard/admin/VerifyItem"



const router = createBrowserRouter([
    {
        path : "/",
        element: <Main/>,
        children : [
            {
                path : "/",
                element: <Home/>
            },
            {
                path : "/rent",
                element : <Rent/>
            },
            {
                path : "/updateprofile",
                element : <UpdateProfile/>
            }
        ]
    },

    {
        path : "/login",
        element : <Login/>
    },
    {
        path : "/signup",
        element : <Signup/>
    },
    {
        path : "dashboard",
        element : <DashboardLayout/>,
        children : [
            {
                path : '',
                element : <Dashboard/>
            },
            {
                path: 'users',
                element : <Users/>
            },
            {
                path: 'addrentitem',
                element : <AddRentItem/>
            },
            {
                path : "verifyitem",
                element : <VerifyItem/>
            }
        ]
    }
]);

export default router;
