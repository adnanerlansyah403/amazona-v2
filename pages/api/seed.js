import nc from "next-connect";
import data from './../../utils/data';
import Product from './../../models/ProductModel';
import User from './../../models/UserModel';
import Order from './../../models/OrderModel';
import db from './../../utils/db';

const handler = nc();

handler.get( async (req, res) => {

    await db.connect();
    await Order.deleteMany();
    await User.deleteMany();
    await User.insertMany(data.users);
    await Product.deleteMany();
    await Product.insertMany(data.products);
    await db.disconnect();
    
    res.send({ message: 'seeded successfully' });
});

export default handler;