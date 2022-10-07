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
import { useSnackbar } from 'notistack';

function reducer(state, action) {
    switch(action.type) {
        case 'FETCH_REQUEST':
            return { ...state, loading: true, error: '' };
        case 'FETCH_SUCCESS':
            return { ...state, loading: false, products: action.payload, error: '' };
        case 'FETCH_ERROR':
            return { ...state, loading: false, error: action.payload };
            
        case 'CREATE_REQUEST':
            return { ...state, loadingCreate: true, errorCreate: '' };
        case 'CREATE_SUCCESS':
            return { ...state, loadingCreate: false, errorCreate: '' };
        case 'CREATE_ERROR':
            return { ...state, loadingCreate: false, errorCreate: action.payload };
                        
        case 'DELETE_REQUEST':
            return { ...state, loadingDelete: true };
        case 'DELETE_SUCCESS':
            return { ...state, loadingDelete: false, successDelete: true };
        case 'DELETE_ERROR':
            return { ...state, loadingDelete: false };
        case 'DELETE_RESET':
            return { ...state, loadingDelete: false, successDelete: false };
        
        default:
            return state;
    }
}

function AdminProductsScreen() {

    const { state } = useContext(Store);
    const { userInfo } = state;
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const [ { loading, error, products, loadingCreate, successDelete, loadingDelete }, dispatch ] = useReducer(reducer,  {
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
        if(successDelete) {
            dispatch({ type: "DELETE_RESET" });
        } else {
            fetchData();
        }
    }, [successDelete]);

    const createHandler = async () => {
        if(!window.confirm('Are you sure want to create a new product?')) {
            return;
        }
        try {
            dispatch({ type: 'CREATE_REQUEST' });
            const { data } = await axios.post(
                `/api/admin/products`,
                {},
                {
                    headers: {
                        authorization: `Bearer ${userInfo.token}`
                    }
                }
            )
            dispatch({ type: 'CREATE_SUCCESS' });
            enqueueSnackbar('Product created successfully', { variant: "success" });
            router.push(`/admin/product/${data.product._id}`);
        } catch (error) {
            dispatch({ type: "CREATE_ERROR", payload: getError(error) });
            enqueueSnackbar(getError(error), { variant: "error" });
        }
    }

    const deleteHandler = async (productId) => {
        closeSnackbar();
        if(!window.confirm('Are you sure want to delete this product?')) {
            return;
        }
        try {
            dispatch({ type: 'DELETE_REQUEST' });
            await axios.delete(
                `/api/admin/products/${productId}`,
                {
                    headers: {
                        authorization: `Bearer ${userInfo.token}`
                    }
                }
            )
            dispatch({ type: 'DELETE_SUCCESS' });
            enqueueSnackbar('Product deleted successfully', { variant: "success" });
        } catch (error) {
            dispatch({ type: "DELETE_ERROR", payload: getError(error) });
            enqueueSnackbar(getError(error), { variant: "error" });
        }
    }

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
                            <Grid container alignItems="center">
                                <Grid item xs={6}>
                                    <Typography component="h1" variant="h1">
                                        Product List
                                    </Typography>
                                    {loadingDelete && <CircularProgress />}
                                </Grid>
                                <Grid align="right" item xs={6}>
                                    <Button color="primary" variant="contained" onClick={createHandler}>
                                        {loadingCreate ? <CircularProgress /> : "Create Product"}
                                    </Button>
                                </Grid>
                            </Grid>
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
                                                <TableCell>STOCK</TableCell>
                                                <TableCell>RATING</TableCell>
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
                                                        <Button size="small" variant="contained"
                                                        onClick={() => deleteHandler(product._id)}
                                                        >
                                                            {loadingDelete ? <CircularProgress /> : "Delete"}
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