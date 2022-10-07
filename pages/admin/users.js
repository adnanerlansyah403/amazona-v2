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
            return { ...state, loading: false, users: action.payload, error: '' };
        case 'FETCH_ERROR':
            return { ...state, loading: false, error: action.payload };
                        
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

function AdminUserListScreen() {

    const { state } = useContext(Store);
    const { userInfo } = state;
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const [ { loading, error, users, successDelete, loadingDelete }, dispatch ] = useReducer(reducer,  {
        loading: true,
        error: '',
        users: [],
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
            const { data } = await axios.get(`/api/admin/users`, {
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
    }, [successDelete, userInfo]);

    const deleteHandler = async (userId) => {
        closeSnackbar();
        if(!window.confirm('Are you sure want to delete this user?')) {
            return;
        }
        try {
            dispatch({ type: 'DELETE_REQUEST' });
            await axios.delete(
                `/api/admin/users/${userId}`,
                {
                    headers: {
                        authorization: `Bearer ${userInfo.token}`
                    }
                }
            )
            dispatch({ type: 'DELETE_SUCCESS' });
            enqueueSnackbar('User deleted successfully', { variant: "success" });
        } catch (error) {
            dispatch({ type: "DELETE_ERROR", payload: getError(error) });
            enqueueSnackbar(getError(error), { variant: "error" });
        }
    }

  return (
    <Layout title="Users">
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
                            <ListItem button component="a">
                                <ListItemText primary="Products"></ListItemText>
                            </ListItem>
                        </Link>
                        <Link href="/admin/users" passHref>
                            <ListItem selected button component="a">
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
                                User List
                            </Typography>
                            {loadingDelete && <CircularProgress />}
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
                                                <TableCell>NAME</TableCell>
                                                <TableCell>EMAIL</TableCell>
                                                <TableCell>STATUS</TableCell>
                                                <TableCell>ACTIONS</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {users.map((user) => (
                                                <TableRow key={user._id}>
                                                    <TableCell>
                                                        {user._id.substring(20, 24)}
                                                    </TableCell>
                                                    <TableCell>
                                                        {user.name}
                                                    </TableCell>
                                                    <TableCell>
                                                        {user.email}
                                                    </TableCell>
                                                    <TableCell>
                                                        {user.isAdmin ? "Admin" : "User" }
                                                    </TableCell>
                                                    <TableCell>
                                                        <Link href={`/admin/user/${user._id}`} passHref>
                                                            <Button size="small" variant="contained">
                                                                Edit
                                                            </Button>
                                                        </Link> &nbsp;
                                                        <Button size="small" variant="contained"
                                                        onClick={() => deleteHandler(user._id)}
                                                        >
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

export default dynamic(() => Promise.resolve(AdminUserListScreen), {ssr: false});