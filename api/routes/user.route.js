import express from 'express';
import { deleteUser, getUserListing, test, updateUser, getUser } from '../controller/user.controller.js';
import { verifyToken } from '../utils/verifyUser.js';


const router = express.Router();
router.get('/test', test);
router.post('/update/:id',verifyToken, updateUser)
router.delete('/delete/:id',verifyToken, deleteUser)
router.get('/listings/:id',verifyToken, getUserListing)
router.get('/:id', verifyToken, getUser)


export default router;