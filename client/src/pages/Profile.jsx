import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  updateUserStart,
  updateUserSuccess,
  updateUserFailure,
  deleteUserFailure,
  deleteUserStart,
  deleteUserSuccess,
  signOutUserStart,
  signOutUserFailure,
  signOutUserSuccess,
} from '../redux/user/userSlice';
import { Link } from 'react-router-dom';

export default function Profile() {
  const fileRef = useRef(null);
  const { currentUser } = useSelector((state) => state.user);
  const [file, setFile] = useState(undefined);
  const [filePerc, setFilePerc] = useState(0);
  const [fileUploadError, setFileUploadError] = useState(false);
  const [formData, setFormData] = useState({});
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [showListingsError, setShowListingsError] = useState(false);
  const [userListings, setUserListings] = useState([]);
  const dispatch = useDispatch();


  useEffect(() => {
    if (file) {
      handleFileUpload(file);
    }
  }, [file]);

  const handleFileUpload = async (file) => {
    setFileUploadError(false);
    setFilePerc(0);

    const formDataCloud = new FormData();
    formDataCloud.append('file', file);
    formDataCloud.append('upload_preset', 'listing_images'); 
    formDataCloud.append('folder', 'profile_avatars');  
    try {
      const res = await fetch(
        'https://api.cloudinary.com/v1_1/daoxb0prf/image/upload', 
        {
          method: 'POST',
          body: formDataCloud,
        }
      );
      const data = await res.json();
      if (data.secure_url) {
        setFormData((prevData) => ({ ...prevData, avatar: data.secure_url }));
        setFilePerc(100);
      } else {
        setFileUploadError(true);
      }
    } catch (error) {
      console.error('Cloudinary Upload Error:', error);
      setFileUploadError(true);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      dispatch(updateUserStart());
      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success === false) {
        dispatch(updateUserFailure(data.message));
        return;
      }
      dispatch(updateUserSuccess(data));
      setUpdateSuccess(true);
    } catch (error) {
      dispatch(updateUserFailure(error.message));
    }
  };

  const handleDeleteUser = async () => {
    try {
      dispatch(deleteUserStart());
      const res = await fetch(`/api/user/delete/${currentUser._id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success === false) {
        dispatch(deleteUserFailure(data.message));
        return;
      }
      dispatch(deleteUserSuccess(data));
    } catch (error) {
      dispatch(deleteUserFailure(error.message));
    }
  };

  const handleSignOut = async () => {
    try {
      dispatch(signOutUserStart());
      const res = await fetch('/api/auth/signout');
      const data = await res.json();
      if (data.success === false) {
        dispatch(signOutUserFailure(data.message));
        return;
      }
      dispatch(signOutUserSuccess(data));
    } catch (error) {
      dispatch(signOutUserFailure(error.message));
    }
  };

  const handleShowListings = async () => {
    try {
      setShowListingsError(false);
      const res = await fetch(`/api/user/listings/${currentUser._id}`);
      const data = await res.json();
      if (data.success === false) {
        setShowListingsError(true);
        return;
      }
      setUserListings(data);
      
    } catch (error) {
      setShowListingsError(true);
    }
  };

  const handleListingDelete = async (listingId) => {
    try{
    const res = await fetch(`/api/listing/delete/${listingId}` , {
      method: 'DELETE',
    });
    const data =await res.json();
    if (data.success === false) {
      console.log(data.message);
      return;
    }

    setUserListings((prev) => prev.filter((listing) => listing._id !== listingId));
    } catch (error) {
      console.log(error.message);
    }
  }

  return (
    <div className="p-3 max-w-lg mx-auto">
      <h1 className="text-3xl font-semibold text-center my-7">Profile</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          onChange={(e) => setFile(e.target.files[0])}
          type="file"
          ref={fileRef}
          hidden
          accept="image/*"
        />
        <img
          onClick={() => fileRef.current.click()}
          src={formData.avatar || currentUser.avatar}
          alt="profile"
          className="rounded-full h-24 w-24 object-cover cursor-pointer self-center mt-2"
        />
        <p className="text-sm self">
          {fileUploadError ? (
            <span className="text-red-700">Error uploading image</span>
          ) : filePerc > 0 && filePerc < 100 ? (
            <span className="text-slate-700">{`Uploading ${filePerc}%`}</span>
          ) : filePerc === 100 ? (
            <span className="text-green-700">Image successfully uploaded</span>
          ) : (
            ''
          )}
        </p>
        <input
          type="text"
          placeholder="username"
          defaultValue={currentUser.username}
          id="username"
          className="border p-3 rounded-lg"
          onChange={handleChange}
        />
        <input
          type="email"
          placeholder="email"
          defaultValue={currentUser.email}
          id="email"
          className="border p-3 rounded-lg"
          onChange={handleChange}
        />
        <input
          type="password"
          placeholder="password"
          id="password"
          className="border p-3 rounded-lg"
          onChange={handleChange}
        />
        <button className="bg-slate-700 text-white rounded-lg p-3 uppercase hover:opacity-95 disable:opacity-80">
          Update
        </button>
        <Link
          className="bg-green-700 text-white p-3 rounded-lg uppercase text-center hover:opacity-95"
          to={'/create-listing'}
        >
          Create Listing
        </Link>
      </form>

      <div className="flex justify-between mt-5">
        <span
          onClick={handleDeleteUser}
          className="text-red-700 cursor-pointer"
        >
          Delete Account
        </span>
        <span onClick={handleSignOut} className="text-red-700 cursor-pointer">
          Sign out
        </span>
      </div>

      <p className="text-green-700 mt-5">
        {updateSuccess ? 'User is updated successfully' : ''}
      </p>
      <button onClick={handleShowListings} className="text-green-700 w-full">
        Show Listings
      </button>
      <p className="text-red-700 mt-5">
        {showListingsError ? 'Error showing listing' : ''}
      </p>
      {userListings && userListings.length > 0 && 
      <div className='flex flex-col gap-4'>
       <h1 className='text-center mt-7 text-2xl  font-semibold'>Your listings</h1>
      
      {userListings.map((listing) => 
        <div  key={listing._id} className='border rounded-lg p-3 flex justify-between items-center gap-4'>
        <Link to = {`/listing/${listing._id}`}>
        <img src={listing.imageUrls[0]} alt="listing cover" className='h-16 w-16 object-contain  '  />
        </Link>
        <Link className=' text-slate-700 font-semibold  hover:underline truncate flex-1' to = {`/listing/${listing._id}`}>
        <p >{listing.name}</p>
        </Link>
        <div className='flex flex-col item-center'>
       <button onClick={()=>handleListingDelete(listing._id)} className='text-red-700 uppercase'>Delete</button>
        <Link to={`/update-listing/${listing._id}`}>
        <button className='text-green-700 uppercase'>Edit</button>
        </Link>
        </div>
        </div>

      )}
      </div>
      }
    </div>
  );
}
