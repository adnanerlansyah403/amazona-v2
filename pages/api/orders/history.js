import nc from 'next-connect';
import Order from '../../../models/OrderModel';
import { isAuth } from '../../../utils/auth';
import db from '../../../utils/db';

const onError = async (err, req, res) => {
  await db.disconnect();
  res.status(500).send({ message: err.toString() });
};

const handler = nc({
  onError,
});
handler.use(isAuth);

handler.get(async (req, res) => {
  await db.connect();

  const orders = await Order.find({ user: req.user._id });

  await db.disconnect();

  res.send(orders);
});

export default handler;