import nc from "next-connect";
import { isAuth } from "../../../../utils/auth";
import db from '../../../../utils/db';
import Order from '../../../../models/OrderModel';

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
        order.isDelivered = true;
        order.deliveredAt = Date.now();
        const deliveredOrder = await order.save();
        await db.disconnect();
        return res.send({
            message: "Order delivered successfully",
            order: deliveredOrder,
        })
    }

    await db.disconnect();
    
    return res.status(404).send({
        message: "Order not found",
    })
});

export default handler;