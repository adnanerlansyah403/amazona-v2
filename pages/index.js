import { Button, Card, CardActionArea, CardActions, CardContent, CardMedia, Grid, Typography } from '@material-ui/core';
import Link from 'next/link';
import Layout from './../components/Layout';
import db from './../utils/db';
import Product from './../models/ProductModel';
import axios from "axios";      
import { useRouter } from "next/router";
import { useContext } from "react";
import { Store } from "../utils/Store";

export default function Home({ products }) {

  const router = useRouter();
  const { state, dispatch } = useContext(Store);

  const addToCartHandler = async (product) => {
    const existItem = state.cart.cartItems.find(x => x._id === product._id);
    const quantity = existItem ? existItem.quantity + 1 : 1;
    const { data } = await axios.get(`/api/products/${product._id}`);
    if(data.countInStock < quantity) {
      window.alert('Sorry. Product is out of stock');
      return;
    }
    dispatch({ type: 'CART_ADD_ITEM', payload: {...product, quantity }});

    router.push('/cart');
  }

  return (
    <Layout>
        <h1>Products</h1>
        <Grid container spacing={3}>
          {products?.map((product) => (
            <Grid item md={4} key={product.name}>
              <Card>
                <Link href={`/product/${product.slug}`} passHref>
                  <CardActionArea>
                    <CardMedia height={400} component={'img'} image={product.image} title={product.name} />
                    <CardContent>
                      <Typography>
                        {product.name}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Link>
                <CardActions>
                  <Typography>
                    ${product.price}
                  </Typography>
                  <Button size="small" color="primary" onClick={() => addToCartHandler(product)}>
                    Add to Cart
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
    </Layout>
  )
}

export async function getServerSideProps () {

  await db.connect();

  const products = await Product.find({}).lean();

  await db.disconnect();
  
  return {
    props: {
      products: products.map(db.convertDocToObject),
    }
  }
}
