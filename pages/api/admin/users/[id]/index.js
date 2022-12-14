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

  const user = await User.findById(req.query.id);

  if(user) {
    user.name = req.body.name;
    user.isAdmin = Boolean(req.body.isAdmin);
    await user.save();
    await db.disconnect();
    return res.send({
      message: 'User updated successfully',
    });
  }

  await db.disconnect();
    
  return res.status(404).send({
    message: 'User not found',
  });
});

handler.delete(async (req, res) => {
  await db.connect();
  const user = await User.findById(req.query.id);
  if (user) {
    await user.remove();
    await db.disconnect();
    res.send({ message: 'User Deleted Successfully' });
  } else {
    await db.disconnect();
    res.status(404).send({ message: 'User Not Found' });
  }
});

export default handler;