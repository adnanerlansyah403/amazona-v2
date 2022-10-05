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

handler.post(async (req, res) => {
  await db.connect();
  const newOrder = new Order({
    ...req.body,
    user: req.user._id,
  });
  const order = await newOrder.save();
  res.status(201).send(order);
});

export default handler;