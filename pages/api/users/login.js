import nc from "next-connect";
import db from './../../../utils/db';
import User from './../../../models/UserModel';
import bcrypt from 'bcryptjs';
import { signToken } from "../../../utils/auth";

const handler = nc();

handler.post( async (req, res) => {

    await db.connect();

    const user = await User.findOne({ email: req.body.email });

    await db.disconnect();
    
    if(user && bcrypt.compareSync(req.body.password, user.password)) {
        const token = signToken(user);

        return res.send({
            token,
            _id: user._id, 
            name: user.name, 
            email: user.email, 
            isAdmin: user.isAdmin, 
        })
    } else {
        return res.status(401).send({
            message: 'Invalid user or password',
        })
    }
    
});

export default handler;