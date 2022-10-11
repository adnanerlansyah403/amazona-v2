import nc from 'next-connect';
import Product from '../../../../../models/ProductModel';
import { isAdmin, isAuth } from '../../../../../utils/auth';
import db from '../../../../../utils/db';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const handler = nc();
handler.use(isAuth, isAdmin);

handler.get(async (req, res) => {
  
  await db.connect();

  const product = await Product.findById(req.query.id);

  await db.disconnect();

  return res.send(product);
});

handler.put(async (req, res) => {
  
  await db.connect();

  const product = await Product.findById(req.query.id);

  console.log(req.body);

  if(product) {

    if(req.body.publicIdImage.length > 0 || req.body.publicIdFeaturedImage.length > 0) {
      
      if(req.image.publicIdImage !== product.image.public_id) {
        if(product.image.public_id.length > 0) {
          cloudinary.uploader.destroy(product.image.public_id)
        }
      } else if(req.featuredImage.public_id !== product.featuredImage.public_id) {
        if(product.featuredImage.public_id.length > 0) {
          cloudinary.uploader.destroy(product.featuredImage.public_id)
        }
      } else {
        cloudinary.uploader.destroy(product.image.public_id);
        cloudinary.uploader.destroy(product.featuredImage.public_id);
      }
      
    }


    product.name = req.body.name;
    product.slug = req.body.slug;
    product.price = req.body.price;
    product.category = req.body.category;
    product.brand = req.body.brand;
    product.image.public_id = req.body.publicIdImage;
    product.image.url = req.body.image;
    product.isFeatured = req.body.isFeatured;
    product.featuredImage.public_id = req.body.publicIdFeaturedImage;
    product.featuredImage.url = req.body.featuredImage;
    product.countInStock = req.body.countInStock;
    product.description = req.body.description;

    await product.save();
    await db.disconnect();
    
    return res.send({
      message: 'Product updated successfully',
    });
  }

  await db.disconnect();

  return res.send({
    message: 'Product not found'
  });
});

handler.delete(async (req, res) => {
  await db.connect();
  const product = await Product.findById(req.query.id);
  
  if (product) {

    if(product.image.public_id) cloudinary.uploader.destroy(product.image.public_id);

    await product.remove();
    await db.disconnect();
    res.send({ message: 'Product Deleted' });
  } else {
    await db.disconnect();
    res.status(404).send({ message: 'Product Not Found' });
  }
});

export default handler;
