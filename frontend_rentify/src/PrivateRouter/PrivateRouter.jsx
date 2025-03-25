import React, { Children, useContext } from 'react'
import { AuthContext } from '../Contexts/AuthProvider'
import { Navigate, useLocation } from "react-router-dom"
import LoadingSpinner from '../components/LoadingSpinner';

const PrivateRouter = () => {

    const {user,loading} = useContext(AuthContext);
    const location = useLocation();

    if(loading){
        return(
            <LoadingSpinner/>
        )
    }
    if(user){
        return Children ;
    }
  return (
    <Navigate to ="/signup" state={{from : location}} replace></Navigate>
  )
}

export default PrivateRouter