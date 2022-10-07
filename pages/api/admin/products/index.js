import nc from 'next-connect';
import Product from '../../../../models/ProductModel';
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

  const products = await Product.find({});

  await db.disconnect();

  return res.send(products);
});

handler.post(async (req, res) => {
  
  await db.connect();

  const newProduct = new Product({
    name: 'sample name',
    slug: 'sample-slug-' + Math.random().toString(),
    image: '/images/shirt1.jpg',
    price: 0,
    category: 'sample category',
    brand: 'sample brand',
    countInStock: 0,
    description: 'sample description',
    rating: 0,
    numReviews: 0,
  });

  const product = await newProduct.save();

  await db.disconnect();

  return res.send({
    message: 'Product saved successfully',
    product,
  });
});

export default handler;