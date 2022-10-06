import { Button, Card, CircularProgress, Grid, List, ListItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@material-ui/core';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useContext, useEffect, useState } from 'react'
import Layout from '../components/Layout';
import { Store } from '../utils/Store';
import dynamic from 'next/dynamic';
import useStyles from '../utils/styles';
import { round2 } from '../helpers/calculate';
import CheckoutWizard from './../components/CheckoutWizard';
import { useSnackbar } from 'notistack';
import { getError } from '../utils/error';
import axios from 'axios';
import Cookies from 'js-cookie';

function PlaceOrderScreen() {

    const classes = useStyles();
    const { closeSnackbar, enqueueSnackbar } = useSnackbar();
    const [ loading, setLoading ] = useState(false);
    const router = useRouter();
    const { state, dispatch } = useContext(Store);
    const {
      userInfo,
      cart: { shippingAddress, cartItems, paymentMethod },
    } = state;
    
    const [carts, setCarts] = useState([]);

    useEffect(() => setCarts(cartItems), [cartItems]);
    useEffect(() => {
        if(!paymentMethod) {
            router.push('/payment');
        }
        if(cartItems.length === 0) {
            router.push('/cart');
        }
    }, []);

    const itemsPrice = round2(cartItems.reduce((a, c) => a + c.price * c.quantity, 0));
    const shippingPrice = itemsPrice > 200 ? 0 : 15;
    const taxPrice = round2(itemsPrice * 0.15);
    const totalPrice = round2(itemsPrice + shippingPrice + taxPrice);

    const placeOrderHandler = async () => {
        closeSnackbar();
        try {
            setLoading(true);
            const { data } = await axios.post(`/api/orders`, {
                orderItems: cartItems,
                shippingAddress,
                paymentMethod,
                itemsPrice,
                shippingPrice,
                taxPrice,
                totalPrice,
            }, {
                headers: {
                    authorization: 'Bearer ' + userInfo.token,
                },
            });
            dispatch({ type: 'CART_CLEAR' });
            Cookies.remove('cartItems');
            setLoading(false);
            router.push(`/order/${data._id}`);
        } catch (error) {
            setLoading(false);
            enqueueSnackbar(getError(error), { variant: "error" });
        }
    }

  return (
    <Layout title="Shopping Cart">
        <CheckoutWizard activeStep={3}></CheckoutWizard>
      <Typography component="h1" variant="h1">
        Place Order
      </Typography>
        <Grid container spacing={6}>
            <Grid item md={9} xs={12}>
                <Card className={classes.section}>
                    <List>
                        <ListItem>
                            <Typography component="h2" variant="h2">
                                Shipping Address
                            </Typography>
                        </ListItem>
                        <ListItem>
                            {shippingAddress?.fullName}, {shippingAddress?.address}, {' '} 
                            {shippingAddress?.city}, {shippingAddress?.postalCode}, {' '}
                            {shippingAddress?.country}
                        </ListItem>
                    </List>
                </Card>
                <Card className={classes.section}>
                    <List>
                        <ListItem>
                            <Typography component="h2" variant="h2">
                                Payment Method
                            </Typography>
                        </ListItem>
                        <ListItem>
                            <Typography>{paymentMethod}</Typography>
                        </ListItem>
                    </List>
                </Card>
                <Card className={`${classes.section}`}>
                    <List>
                        <ListItem>
                            <Typography component="h2" variant="h2">Order Items</Typography>
                        </ListItem>
                        <ListItem>
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Image</TableCell>
                                            <TableCell>Name</TableCell>
                                            <TableCell align="center">Quantity</TableCell>
                                            <TableCell align="center">Price</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {carts?.map((item) => (
                                            <TableRow key={item._id}>
                                                <TableCell>
                                                    <Link href={`/product/${item.slug}`}>
                                                        <a>
                                                            <Image src={item.image} alt={item.name} width="50" height="50" />
                                                        </a>
                                                    </Link> 
                                                </TableCell>
                                                <TableCell>
                                                    <Link href={`/product/${item.slug}`}>
                                                        <Typography>
                                                            {item.name}
                                                        </Typography>
                                                    </Link>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Typography>
                                                        {item.quantity}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Typography>
                                                        {item.price}
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </ListItem>
                    </List>
                </Card>
            </Grid>
            <Grid item md={3} xs={12}>
                <Card className={`${classes.section}`}>
                    <List>
                        <ListItem>
                            <Typography variant="h2">
                                Order Summary
                            </Typography>
                        </ListItem>
                        <ListItem>
                            <Grid container>
                                <Grid item xs={6}>
                                    <Typography>Items: </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography align="right">
                                    ${itemsPrice}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </ListItem>
                        <ListItem>
                            <Grid container>
                                <Grid item xs={6}>
                                    <Typography>Tax: </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography align="right">
                                    ${taxPrice}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </ListItem> 
                        <ListItem>
                            <Grid container>
                                <Grid item xs={6}>
                                    <Typography>Shipping: </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography align="right">
                                    ${shippingPrice}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </ListItem>
                        <ListItem>
                                <Grid container>
                                    <Grid item xs={6}>
                                        <Typography>
                                            <strong>Total: </strong>
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography align="right">
                                        <strong>${totalPrice}</strong>
                                        </Typography>
                                    </Grid>
                                </Grid>
                        </ListItem>
                        <ListItem>
                            <Button onClick={placeOrderHandler} variant="contained" color="primary" fullWidth
                            >
                                {loading ?
                                    <CircularProgress />
                                    :
                                    "PLace Order"
                                }
                            </Button>
                        </ListItem>
                    </List>
                </Card>
            </Grid>
        </Grid>
    </Layout>
  )
}

export default dynamic(() => Promise.resolve(PlaceOrderScreen), {ssr: false});