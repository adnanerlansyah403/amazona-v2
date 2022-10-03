import nc from "next-connect";
import data from './../../utils/data';
import Product from './../../models/ProductModel';
import db from './../../utils/db';

const handler = nc();

handler.get( async (req, res) => {

    await db.connect();
    await Product.deleteMany();
    await Product.insertMany(data.products);
    await db.disconnect();
    
    res.send({ message: 'seeded successfully' });
});

export default handler;