import nc from 'next-connect';
import Product from '../../../models/ProductModel';
import { isAuth, isAdmin } from '../../../utils/auth';
import db from '../../../utils/db';

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

  const products = await Product.find({});

  await db.disconnect();

  return res.send(products);
});

export default handler;