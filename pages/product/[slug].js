import { Button, Card, CircularProgress, Grid, List, ListItem, TextField, Typography } from '@material-ui/core';
import Image from 'next/image';
import Link from 'next/link';
import React, { useContext, useEffect, useState } from 'react'
import Layout from './../../components/Layout';
import useStyles from './../../utils/styles';
import db from './../../utils/db';
import Product from './../../models/ProductModel';
import axios from 'axios';
import { Store } from '../../utils/Store';
import { useRouter } from 'next/router';
import { Rating } from '@material-ui/lab';
import { getError } from '../../utils/error';
import { useSnackbar } from 'notistack';
import dynamic from 'next/dynamic';

function ProductScreen({product}) {

    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const { state, dispatch } = useContext(Store);
    const { userInfo } = state;
    const classes = useStyles();
    const router = useRouter();

    const [reviews, setReviews] = useState([]);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [loading, setLoading] = useState(false);
    
    const fetchReviews = async () => {
      try {
        const { data } = await axios.get(`/api/products/${product._id}/reviews`);
        setReviews(data);
      } catch (err) {
        enqueueSnackbar(getError(err), { variant: 'error' });
      }
    };
    useEffect(() => {
      fetchReviews();
    }, []);

    if(!product) {
        return <div>Product Not Found</div>
    }

    const submitHandler = async (e) => {
      e.preventDefault();
      closeSnackbar();
      setLoading(true);
      try {
        await axios.post(
          `/api/products/${product._id}/reviews`,
          {
            rating: rating,
            comment: comment
          },
          {
            headers: { authorization: 'Bearer ' + userInfo.token },
          }
        );
        setLoading(false);
        setComment("");
        setRating(0);
        enqueueSnackbar('Review submited successfully', {
          variant:'success'
        });
        fetchReviews();
      } catch (error) {
        setLoading(false);
        enqueueSnackbar(getError(error), { variant: "error" });
      }
    }

    const addToCartHandler = async () => {
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
    <Layout title={product.name} description={product.description}>
      <div className={classes.section}>
          <Typography color="primary">
            <Link href={`/`}>
                Back to products
            </Link> 
          </Typography> 
      </div>
      <Grid container spacing={1}>
        <Grid item md={6} xs={12}>
          <Image src={product.image.url} alt={product.name} width="640" height="640" layout='responsive' />
        </Grid>
        <Grid item md={3} xs={12}>
          <List>
            <ListItem>
              <Typography variant="h1">{product.name}</Typography>
            </ListItem>
            <ListItem>
              <Typography>Category: {product.category}</Typography>
            </ListItem>
            <ListItem>
              <Typography>Brand: {product.brand}</Typography>
            </ListItem>
            <ListItem>
              <Rating value={product.rating} readOnly></Rating>
              <Typography color="primary" style={{ marginLeft: "5px" }}>
                <Link href={`#reviews`}>
                      <a>({product.numReviews} reviews)</a>
                </Link> 
              </Typography> 
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
                <Button fullWidth variant="contained" color="primary"
                  onClick={addToCartHandler}
                >
                  Add to Cart
                </Button>
              </ListItem>
            </List>
          </Card>
        </Grid>
      </Grid>
      <List>
        <ListItem>
          <Typography name="reviews" id="reviews" variant="h2">
            Customer Reviews
          </Typography>
        </ListItem>
        {reviews?.length === 0 ? 
          <ListItem>  
            <Typography variant="h6">No Reviews</Typography>
          </ListItem>
        : (
          <>
            {reviews.map((review) => (
              <ListItem key={review._id}>
                <Grid container>
                  <Grid item className={classes.reviewItem}>
                    <Typography><strong>{review?.name}</strong></Typography>
                    <Typography>{review?.createdAt.substring(0, 10)}</Typography>
                  </Grid>  
                  <Grid item>
                    <Rating value={Number(review?.rating)} readOnly></Rating>
                    <Typography>
                      {review?.comment}
                    </Typography>
                  </Grid>
                </Grid>
              </ListItem>
            ))}
          </>
        )}
        <ListItem>
          {userInfo ? (
            <form onSubmit={submitHandler} className={classes.reviewForm}>
                <List>
                  <ListItem style={{ paddingInline: 0 }}>
                    <Typography variant="h2">Leave your review</Typography>
                  </ListItem>
                  <ListItem style={{ paddingInline: 0 }}>
                    <TextField
                      multiline
                      variant="outlined"
                      fullWidth
                      name="review"
                      label="Enter comment"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    />
                  </ListItem>
                  <ListItem style={{ paddingInline: 0 }}>
                    <Rating
                      name="simple-controlled"
                      value={Number(rating)}
                      onChange={(e) => setRating(e.target.value)}
                    />
                  </ListItem>
                  <ListItem style={{ paddingInline: 0 }}>
                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      color="primary"
                    >
                      Submit
                    </Button>

                    {loading && <CircularProgress></CircularProgress>}
                  </ListItem>
                </List>
            </form>
          ) : (
            <Typography variant="h2">
              Please {" "}
              <Link href={`/login?redirect=/product/${product.slug}`}>
                <a style={{ color: "#f0c000" }}>Login</a>
              </Link>
              {" "} to write a review
            </Typography>
          )}
        </ListItem>
      </List>
    </Layout>
  )
}

export async function getServerSideProps ({ params }) {

  const { slug } = params;
  await db.connect();

  const product = await Product.findOne({ slug }, '-reviews').lean();

  await db.disconnect();
  
  return {
    props: {
      product: db.convertDocToObject(product),
    }
  }
}

export default dynamic(() => Promise.resolve(ProductScreen), {ssr: false});