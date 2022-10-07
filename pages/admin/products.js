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
            return { ...state, loading: false, products: action.payload, error: '' };
        case 'FETCH_ERROR':
            return { ...state, loading: false, error: action.payload };
            
        default:
            return state;
    }
}

function AdminProductsScreen() {

    const { state } = useContext(Store);
    const { userInfo } = state;
    const [ { loading, error, products }, dispatch ] = useReducer(reducer,  {
        loading: true,
        error: '',
        products: [],
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
            const { data } = await axios.get(`/api/admin/products`, {
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
    <Layout title="Products">
        <Grid container spacing={6} className={classes.marginTopContainer}>
            <Grid item md={3} xs={12}>
                <Card className={classes.section}>
                    <List>
                        <Link href="/admin/dashboard" passHref>
                            <ListItem button component="a">
                                <ListItemText primary="Admin Dashboard"></ListItemText>
                            </ListItem>
                        </Link>
                        <Link href="/admin/orders" passHref>
                            <ListItem button component="a">
                                <ListItemText primary="Orders"></ListItemText>
                            </ListItem>
                        </Link>
                        <Link href="/admin/products" passHref>
                            <ListItem selected button component="a">
                                <ListItemText primary="Products"></ListItemText>
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
                                Product List
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
                                                <TableCell>ACTIONS</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {products.map((product) => (
                                                <TableRow key={product._id}>
                                                    <TableCell>
                                                        {product._id.substring(20, 24)}
                                                    </TableCell>
                                                    <TableCell>
                                                        {product.name}
                                                    </TableCell>
                                                    <TableCell>
                                                        ${product.price}
                                                    </TableCell>
                                                    <TableCell>
                                                        {product.category}
                                                    </TableCell>
                                                    <TableCell>
                                                        {product.countInStock}
                                                    </TableCell>
                                                    <TableCell>
                                                        {product.rating}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Link href={`/admin/product/${product._id}`} passHref>
                                                            <Button size="small" variant="contained">
                                                                Edit
                                                            </Button>
                                                        </Link> &nbsp;
                                                        <Button size="small" variant="contained">
                                                            Delete
                                                        </Button>
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

export default dynamic(() => Promise.resolve(AdminProductsScreen), {ssr: false});