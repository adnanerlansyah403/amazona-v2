import { Button, Card, Grid, List, ListItem, Typography } from '@material-ui/core';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react'
import Layout from './../../components/Layout';
import useStyles from './../../utils/styles';
import db from './../../utils/db';
import Product from './../../models/ProductModel';

export default function ProductScreen({product}) {

    const classes = useStyles();

    if(!product) {
        return <div>Product Not Found</div>
    }

  return (
    <Layout title={product.name} description={product.description}>
      <div className={classes.section}>
          <Typography  color="primary">
            <Link href={`/`} passHref>
                Back to products
            </Link> 
          </Typography> 
      </div>
      <Grid container spacing={1}>
        <Grid item md={6} xs={12}>
          <Image src={product.image} alt={product.name} width="640" height="640" layout='responsive' />
        </Grid>
        <Grid item md={3} xs={12}>
          <List>
            <ListItem>
              <Typography component="h1" variant="h1">{product.name}</Typography>
            </ListItem>
            <ListItem>
              <Typography>Category: {product.category}</Typography>
            </ListItem>
            <ListItem>
              <Typography>Brand: {product.brand}</Typography>
            </ListItem>
            <ListItem>
              <Typography>Rating: {product.rating} stars ({product.numReviews}) reviews</Typography>
            </ListItem>
            <ListItem>
              <Typography>
                Description: {' '}
                {product.description}
              </Typography>
            </ListItem>
          </List>
        </Grid>
        <Grid item md={3} xs={12}>
          <Card>
            <List>
              <ListItem>
                <Grid container>
                  <Grid item xs={6}>
                    <Typography>Price</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography>${product.price}</Typography>
                  </Grid>
                </Grid>
              </ListItem>
              <ListItem>
                <Grid container>
                  <Grid item xs={6}>
                    <Typography>Status</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography>{product.countInStock > 0 ? 'In Stock' : 'Out of Stock'}</Typography>
                  </Grid>
                </Grid>
              </ListItem>
              <ListItem>
                <Button fullWidth variant="contained" color="primary">
                  Add to Cart
                </Button>
              </ListItem>
            </List>
          </Card>
        </Grid>
      </Grid>
    </Layout>
  )
}

export async function getServerSideProps ({ params }) {

  const { slug } = params;
  await db.connect();

  const product = await Product.findOne({slug}).lean();

  await db.disconnect();
  
  return {
    props: {
      product: db.convertDocToObject(product),
    }
  }
}