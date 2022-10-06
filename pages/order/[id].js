import { Card, CircularProgress, Grid, List, ListItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@material-ui/core';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useContext, useEffect, useReducer } from 'react'
import Layout from '../../components/Layout';
import { Store } from '../../utils/Store';
import dynamic from 'next/dynamic';
import useStyles from '../../utils/styles';
import { getError } from '../../utils/error';
import axios from 'axios';
import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import { useSnackbar } from 'notistack';

function reducer(state, action) {
    switch(action.type) {
        case 'FETCH_REQUEST':
            return { ...state, loading: true, error: '' };
        case 'FETCH_SUCCESS':
            return { ...state, loading: false, order: action.payload, error: '' };
        case 'FETCH_ERROR':
            return { ...state, loading: false, error: action.payload };
            
        case 'PAY_REQUEST':
            return { ...state, loadingPay: true };
        case 'PAY_SUCCESS':
            return { ...state, loadingPay: false, successPay: true };
        case 'PAY_FAIL':
            return { ...state, loadingPay: false, errorPay: action.payload };
        case 'PAY_RESET':
            return { ...state, loadingPay: false, successPay: false, errorPay: "" };
        default:
            return state;
    }
}

function OrderScreen({ params }) {
    const orderId = params?.id;
    const [{ isPending }, paypalDispatch ] = usePayPalScriptReducer();
    const classes = useStyles();
    const { enqueueSnackbar } = useSnackbar();
    const router = useRouter();
    const { state } = useContext(Store);
    const {
      userInfo,
    } = state;
    const [ { loading, error, order, successPay }, dispatch ] = useReducer(reducer,  {
        loading: true,
        error: '',
        order: {}
    });
    const { shippingAddress, paymentMethod, orderItems, itemsPrice, taxPrice, shippingPrice, totalPrice, isPaid, paidAt, isDelivered, deliveredAt } = order;

    useEffect(() => {
        if (!userInfo) {
          return router.push('/login');
        }
        const fetchOrder = async () => {
          try {
            dispatch({ type: 'FETCH_REQUEST' });
            const { data } = await axios.get(`/api/orders/${orderId}`, {
              headers: { authorization: `Bearer ${userInfo.token}` },
            });
            dispatch({ type: 'FETCH_SUCCESS', payload: data });
          } catch (err) {
            dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
          }
        };
        if (
          !order._id ||
          successPay ||
          (order._id && order._id !== orderId)
        ) {
          fetchOrder();
          if(successPay) {
            dispatch({ type: 'PAY_RESET '});
          }
        } else {
            const loadPaypalScript = async () => {
                const { data: clientId } = await axios.get('/api/keys/paypal', {
                    headers: { authorization: `Bearer ${userInfo.token}` },
                });
                paypalDispatch({
                    type: 'resetOptions',
                    value: {
                    'client-id': clientId,
                    currency: 'USD',
                    },
                });
                paypalDispatch({ type: 'setLoadingStatus', value: 'pending' });
            };
            loadPaypalScript();
        }

      }, [order, successPay]);

      function createOrder(data, actions) {
        return actions.order.create({
            purchase_units: [
                {
                    amount: { value: totalPrice }
                }
            ],
        }).then((orderId) => { return orderId; });
      }

      function onApprove(data, actions) {
        return actions.order.capture().then(async function (details) {
            try {
                dispatch({ type: 'PAY_REQUEST' });
                const { data } = await axios.put(
                `/api/orders/${order._id}/pay`, 
                details, 
                {
                    headers: {
                        authorization: 'Bearer ' + userInfo.token,
                    }
                });
                dispatch({ type: 'PAY_SUCCESS', payload: data });
                enqueueSnackbar('Order is paid', { variant: "success" });
            } catch (error) {
                dispatch({ type: 'PAY_FAIL', payload: getError(error) });
                enqueueSnackbar(getError(error), { variant: "error" });
            }
        })
    }

    function onError(err) {
        enqueueSnackbar(getError(err), { variant: "error" });
    }

  return (
    <Layout title={`Order Details`}>
        <Typography component="h1" variant="h1">
            Order {orderId}
        </Typography>
        {loading ? <CircularProgress></CircularProgress>
        : error ? <Typography component="h1" variant="h1" className={classes.error}>{error}</Typography> : (
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
                                <ListItem>
                                    <Typography>
                                    Status: {isDelivered ? `Delivered at ${deliveredAt}` : 'Not Delivered'}
                                    </Typography>
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
                            <ListItem>
                                <Typography>
                                Status: {isPaid ? `Paid at ${paidAt}` : 'Not Paid'}
                                </Typography>
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
                                            {orderItems?.map((item) => (
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
                            {
                                !isPaid && (
                                    <ListItem>
                                        {isPending ? <CircularProgress /> : (
                                            <div className={classes.fullWidth}>
                                                <PayPalButtons 
                                                createOrder={createOrder}
                                                onApprove={onApprove}
                                                onError={onError}
                                                >
                                                </PayPalButtons>
                                            </div>
                                        )}
                                    </ListItem>
                                )
                            }
                        </List>
                    </Card>
                </Grid>
            </Grid>
        )}
    </Layout>
  )
}

export async function getServerSideProps({ params }) {
  return { props: { params } };
}

export default dynamic(() => Promise.resolve(OrderScreen), {ssr: false});