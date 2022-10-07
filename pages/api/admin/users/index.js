import nc from 'next-connect';
import User from '../../../../models/UserModel';
import { isAdmin, isAuth } from '../../../../utils/auth';
import db from './../../../../utils/db';

const onError = async (err, req, res) => {
  await db.disconnect();
  res.status(500).send({ message: err.toString() });
};

const handler = nc({
  onError,
});

handler.use(isAuth, isAdmin);

handler.get(async (req, res) => {
  
  await db.connect();

  const users = await User.find({});

  await db.disconnect();

  return res.send(users);
});

export default handler;