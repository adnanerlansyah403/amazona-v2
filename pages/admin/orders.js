import { Card, CircularProgress, Grid, List, ListItem, Typography,  Button, ListItemText, TableContainer, Table, TableHead, TableRow, TableCell, TableBody } from '@material-ui/core';
import axios from 'axios';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useContext, useEffect, useReducer } from 'react'
import { getError } from '../../utils/error';
import { Store } from '../../utils/Store';
import Layout from '../../components/Layout';
import useStyles from '../../utils/styles';

function reducer(state, action) {
    switch(action.type) {
        case 'FETCH_REQUEST':
            return { ...state, loading: true, error: '' };
        case 'FETCH_SUCCESS':
            return { ...state, loading: false, orders: action.payload, error: '' };
        case 'FETCH_ERROR':
            return { ...state, loading: false, error: action.payload };
            
        default:
            return state;
    }
}

function AdminOrdersScreen() {

    const { state } = useContext(Store);
    const { userInfo } = state;
    const [ { loading, error, orders }, dispatch ] = useReducer(reducer,  {
        loading: true,
        error: '',
        orders: [],
    });
    const router = useRouter();
    const classes = useStyles();
    
    useEffect(() => {
        if(!userInfo) {
            router.push('/login');
            return;
        }
        if(!userInfo.isAdmin) {
            router.push('/');
            return;
        }
        const fetchData = async () => {
          try {
            dispatch({ type: 'FETCH_REQUEST' });
            const { data } = await axios.get(`/api/admin/orders`, {
              headers: { authorization: `Bearer ${userInfo.token}` },
            });
            dispatch({ type: 'FETCH_SUCCESS', payload: data });
          } catch (err) {
            dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
          }
        };
        fetchData();
    }, []);

  return (
    <Layout title="Order History">
        <Grid container spacing={6} className={classes.marginTopContainer}>
            <Grid item md={3} xs={12}>
                <Card className={classes.section}>
                    <List>
                        <Link href="/admin/dashboard" passHref>
                            <ListItem button>
                                <ListItemText primary="Admin Dashboard"></ListItemText>
                            </ListItem>
                        </Link>
                        <Link href="/admin/orders" passHref>
                            <ListItem selected button>
                                <ListItemText primary="Orders"></ListItemText>
                            </ListItem>
                        </Link>
                        <Link href="/admin/products" passHref>
                            <ListItem button>
                                <ListItemText primary="Products"></ListItemText>
                            </ListItem>
                        </Link>
                        <Link href="/admin/users" passHref>
                            <ListItem button>
                                <ListItemText primary="Users"></ListItemText>
                            </ListItem>
                        </Link>
                    </List>
                </Card>
            </Grid>
            <Grid item md={9} xs={12}>
                <Card className={classes.section}>
                    <List>
                        <ListItem>
                            <Typography component="h1" variant="h1">
                                Orders
                            </Typography>
                        </ListItem>
                        <ListItem>
                            {loading ? (
                                <CircularProgress />
                            ) : error ? (
                                <Typography className={classes.error}>{error}</Typography>
                            ) : (
                                <TableContainer>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>ID</TableCell>
                                                <TableCell>USER</TableCell>
                                                <TableCell>DATE</TableCell>
                                                <TableCell>TOTAL</TableCell>
                                                <TableCell>PAID</TableCell>
                                                <TableCell>DELIVERED</TableCell>
                                                <TableCell>ACTION</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {orders.map((order) => (
                                                <TableRow key={order._id}>
                                                    <TableCell>
                                                        {order._id.substring(20, 24)}
                                                    </TableCell>
                                                    <TableCell>
                                                        {order.user ? order.user.name : "DELETED USER"}
                                                    </TableCell>
                                                    <TableCell>
                                                        {order.createdAt}
                                                    </TableCell>
                                                    <TableCell>
                                                        ${order.totalPrice}
                                                    </TableCell>
                                                    <TableCell>
                                                        {order.paidAt ? order.paidAt : 'Not Paid'}
                                                    </TableCell>
                                                    <TableCell>
                                                        {order.deliveredAt ? order.deliveredAt : 'Not Delivered'}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Link href={`/order/${order._id}`} passHref>
                                                            <Button variant="contained">
                                                                Details
                                                            </Button>
                                                        </Link>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}
                        </ListItem>
                    </List>
                </Card>
            </Grid>
        </Grid>
    </Layout>
  )
}

export default dynamic(() => Promise.resolve(AdminOrdersScreen), {ssr: false});