import nc from "next-connect";
import { isAuth } from "../../../../utils/auth";
import db from './../../../../utils/db';
import Order from './../../../../models/OrderModel';

const onError = async (err, req, res) => {
  await db.disconnect();
  res.status(500).send({ message: err.toString() });
};

const handler = nc({
    onError
});

handler.use(isAuth);

handler.put( async (req, res) => {

    await db.connect();

    const order = await Order.findById(req.query.id);

    if(order) {
        order.isPaid = true;
        order.paidAt = Date.now();
        order.paymentResult = {
            id: req.body.id,
            status: req.body.status,
            email_address: req.body.email
        }
        const paidOrder = await order.save();
        await db.disconnect();
        return res.send({
            message: "Order paid successfully",
            order: paidOrder,
        })
    }

    await db.disconnect();
    
    return res.status(404).send({
        message: "Order not found",
    })
});

export default handler;