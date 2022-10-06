import nc from 'next-connect';
import Order from '../../../models/OrderModel';
import { isAuth, isAdmin } from '../../../utils/auth';
import db from '../../../utils/db';
import User from './../../../models/UserModel';
import Product from './../../../models/ProductModel';

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

  const ordersCount = await Order.countDocuments();
  const productsCount = await Product.countDocuments();
  const usersCount = await User.countDocuments();
  const ordersPriceGroup = await Order.aggregate([
    {
      $group: {
        _id: null,
        sales: { $sum: '$totalPrice' },
      },
    },
  ]);
  const ordersPrice =
    ordersPriceGroup.length > 0 ? ordersPriceGroup[0].sales : 0;
  const salesData = await Order.aggregate([
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
        totalSales: { $sum: '$totalPrice' },
      },
    },
  ]);

  await db.disconnect();

  return res.send({
    ordersCount,
    productsCount,
    usersCount,
    ordersPrice,
    salesData,
  });
});

export default handler;