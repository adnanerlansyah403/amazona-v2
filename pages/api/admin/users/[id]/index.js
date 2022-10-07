import nc from 'next-connect';
import User from '../../../../../models/UserModel';
import { isAdmin, isAuth } from '../../../../../utils/auth';
import db from '../../../../../utils/db';

const handler = nc();
handler.use(isAuth, isAdmin);

handler.get(async (req, res) => {
  
  await db.connect();

  const user = await User.findById(req.query.id);

  await db.disconnect();

  return res.send(user);
});

handler.put(async (req, res) => {
  
  await db.connect();
  await db.disconnect();
    
  return res.send({
    message: 'User updated successfully',
  });
});

handler.delete(async (req, res) => {
  await db.connect();

  await db.disconnect();
});

export default handler;