import bcryptjs from 'bcryptjs';
import User from '../models/user.model.js';
import { errorHandler } from '../utils/error.js';

export const test = (req, res) =>{
    res.json({
        message: "Api route is working",
    });
};

export const updateUser = async(req, res, next) => {
    if(req.user.id !== req.params.id) return next(errorHandler(401, "you can only update your own account"))
        try{
     if(req.body.password){
        req.body.password = bcryptjs.hashSync(req.body.password, 10)

     }
     const updatedUser = await User.findByIdAndUpdate(req.params.id,{
        $set:{
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,
            avatar: req.body.avatar,
        }
     }, {new: true})

        const {password, ...rest} = updatedUser._doc

        res.status(200).json(rest);
        } catch (error) {
            next(error)
        }

}