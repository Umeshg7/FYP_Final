import React, { useContext, useEffect, useState } from 'react'
import { useForm } from "react-hook-form"
import { AuthContext } from '../../Contexts/AuthProvider'
import { useLocation, useNavigate } from 'react-router-dom';

const UpdateProfile = () => {
    const { user, updateuserProfile } = useContext(AuthContext);  // Assuming user object is in the context
    const { register, handleSubmit, formState: { errors }, setValue } = useForm();

    const [currentName, setCurrentName] = useState(user?.displayName || '');
    const [currentPhoto, setCurrentPhoto] = useState(user?.photoURL || '');

    const location = useLocation();
    const navigate = useNavigate();
    const from = location.state?.from?.pathname || "/";

    // Set initial values from user data
    useEffect(() => {
        if (user) {
            setValue("name", user.displayName);
            setValue("photoURL", user.photoURL);
        }
    }, [user, setValue]);

    const onSubmit = (data) => {
        const name = data.name;
        const photoURL = data.photoURL;
        updateuserProfile(name, photoURL)
            .then(() => {
                navigate(from, { replace: true });
            })
            .catch((error) => {
                console.error("Error updating profile:", error);
            });
    }

    return (
        <div className='flex items-center justify-center h-screen'>
            <div className="card bg-base-100 w-full max-w-sm shrink-0 shadow-2xl">
                <form className="card-body" onSubmit={handleSubmit(onSubmit)}>
                    <h3 className='font-bold'>Update your profile</h3>
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Name</span>
                        </label>
                        <input
                            {...register("name")}
                            type="text"
                            placeholder="Name"
                            className="input input-bordered"
                            required
                        />
                    </div>

                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Email</span>
                        </label>
                        <input
                            type="email"
                            value={user?.email || ""}
                            disabled
                            className="input input-bordered"
                        />
                    </div>

                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Upload Photo</span>
                        </label>
                        <input
                            {...register("photoURL")}
                            type="text"
                            placeholder="Photo URL"
                            className="input input-bordered"
                            required
                        />
                    </div>

                    {/* Display current photo */}
                    {currentPhoto && (
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Current Photo</span>
                            </label>
                            <img
                                src={currentPhoto}
                                alt="Current Profile"
                                className="rounded-full w-24 h-24"
                            />
                        </div>
                    )}

                    <div className="form-control mt-6">
                        <button className="btn bg-purple-yellow-gradient text-white">
                            Update Profile
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default UpdateProfile;
