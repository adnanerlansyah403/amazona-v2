import { Card, CircularProgress, Grid, List, ListItem, Typography,  Button, ListItemText, CardContent, CardActions } from '@material-ui/core';
import axios from 'axios';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useContext, useEffect, useReducer } from 'react'
import { getError } from '../../utils/error';
import { Store } from '../../utils/Store';
import Layout from '../../components/Layout';
import useStyles from '../../utils/styles';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    CategoryScale,
} from "chart.js";
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
)

function reducer(state, action) {
    switch(action.type) {
        case 'FETCH_REQUEST':
            return { ...state, loading: true, error: '' };
        case 'FETCH_SUCCESS':
            return { ...state, loading: false, summary: action.payload, error: '' };
        case 'FETCH_ERROR':
            return { ...state, loading: false, error: action.payload };
            
        default:
            return state;
    }
}

function AdminDashboardScreen() {

    const { state } = useContext(Store);
    const { userInfo } = state;
    const [ { loading, error, summary }, dispatch ] = useReducer(reducer,  {
        loading: true,
        error: '',
        summary: { salesData: [] },
    });
    const router = useRouter();
    const classes = useStyles();
    
    useEffect(() => {
        if(!userInfo) {
            router.push('/login');
        }
        if(!userInfo.isAdmin) {
            router.push('/');
        }
        const fetchData = async () => {
          try {
            dispatch({ type: 'FETCH_REQUEST' });
            const { data } = await axios.get(`/api/admin/summary`, {
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
                            <ListItem selected button component="a">
                                <ListItemText primary="Admin Dashboard"></ListItemText>
                            </ListItem>
                        </Link>
                        <Link href="/admin/orders" passHref>
                            <ListItem button component="a">
                                <ListItemText primary="Orders"></ListItemText>
                            </ListItem>
                        </Link>
                        <Link href="/admin/products" passHref>
                            <ListItem button component="a">
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
                            {loading ? (
                                <CircularProgress />
                            ) : error ? (
                                <Typography className={classes.error}>{error}</Typography>
                            ) : (
                                <Grid container spacing={5}>
                                    <Grid item md={3}>
                                        <Card raised>
                                            <CardContent>
                                                <Typography variant="h1">
                                                    ${summary.ordersPrice || 0}
                                                </Typography>
                                                <Typography>Sales</Typography>
                                            </CardContent>
                                            <CardActions>
                                                <Link href={`/admin/orders`} passHref>
                                                    <Button size="small" color="primary">
                                                        View Sales
                                                    </Button>
                                                </Link>
                                            </CardActions>
                                        </Card>
                                    </Grid>
                                    <Grid item md={3}>
                                        <Card raised>
                                            <CardContent>
                                                <Typography variant="h1">
                                                    {summary.ordersCount || 0}
                                                </Typography>
                                                <Typography>Orders</Typography>
                                            </CardContent>
                                            <CardActions>
                                                <Link href={`/admin/orders`} passHref>
                                                    <Button size="small" color="primary">
                                                        View Orders
                                                    </Button>
                                                </Link>
                                            </CardActions>
                                        </Card>
                                    </Grid>
                                    <Grid item md={3}>
                                        <Card raised>
                                            <CardContent>
                                                <Typography variant="h1">
                                                    {summary.productsCount || 0}
                                                </Typography>
                                                <Typography>Products</Typography>
                                            </CardContent>
                                            <CardActions>
                                                <Link href={`/admin/products`} passHref>
                                                    <Button size="small" color="primary">
                                                        View Products
                                                    </Button>
                                                </Link>
                                            </CardActions>
                                        </Card>
                                    </Grid>
                                    <Grid item md={3}>
                                        <Card raised>
                                            <CardContent>
                                                <Typography variant="h1">
                                                    {summary.usersCount || 0}
                                                </Typography>
                                                <Typography>Users</Typography>
                                            </CardContent>
                                            <CardActions>
                                                <Link href={`/admin/users`} passHref>
                                                    <Button size="small" color="primary">
                                                        View Users
                                                    </Button>
                                                </Link>
                                            </CardActions>
                                        </Card>
                                    </Grid>
                                </Grid>
                            )}
                        </ListItem>
                        <ListItem>
                            <Typography component="h1" variant="h1">
                                Sales Chart
                            </Typography>
                        </ListItem>
                        <ListItem>
                            <Bar
                            data={{
                                labels: summary.salesData.map((x) => x._id),
                                datasets: [
                                {
                                    label: 'Sales',
                                    backgroundColor: 'rgba(162, 222, 208, 1)',
                                    data: summary.salesData.map((x) => x.totalSales),
                                },
                                ],
                            }}
                            options={{
                                legend: { display: true, position: 'right' },
                            }}
                            ></Bar>
                        </ListItem>
                    </List>
                </Card>
            </Grid>
        </Grid>
    </Layout>
  )
}

export default dynamic(() => Promise.resolve(AdminDashboardScreen), {ssr: false});