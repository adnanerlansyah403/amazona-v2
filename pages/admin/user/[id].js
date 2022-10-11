import { Card, Grid, List, ListItem, CircularProgress, Typography, Button, ListItemText, TextField, Checkbox, FormControlLabel } from '@material-ui/core';
import axios from 'axios';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import React, { useContext, useEffect, useReducer, useState } from 'react'
import { Controller, useForm } from 'react-hook-form';
import Layout from '../../../components/Layout';
import useStyles from '../../../utils/styles';
import { Store } from '../../../utils/Store';
import { getError } from '../../../utils/error';

function reducer(state, action) {
    switch(action.type) {
        case 'FETCH_REQUEST':
            return { ...state, loading: true, error: '' };
        case 'FETCH_SUCCESS':
            return { ...state, loading: false, error: '' };
        case 'FETCH_ERROR':
            return { ...state, loading: false, error: action.payload };
            
        case 'UPDATE_REQUEST':
            return { ...state, loadingUpdate: true, errorUpdate: '' };
        case 'UPDATE_SUCCESS':
            return { ...state, loadingUpdate: false, errorUpdate: '' };
        case 'UPDATE_ERROR':
            return { ...state, loadingUpdate: false, errorUpdate: action.payload };
                        
        case 'UPLOAD_REQUEST':
            return { ...state, loadingUpload: true, errorUpload: '' };
        case 'UPLOAD_SUCCESS':
            return { ...state, loadingUpload: false, errorUpload: '' };
        case 'UPLOAD_ERROR':
            return { ...state, loadingUpload: false, errorUpload: action.payload };
        default:
            return state;
    }
}

function UserEditScreen({ params }) {

    const userId = params?.id;
    const { state } = useContext(Store);
    const [{ loading, error, loadingUpdate }, dispatch ] = useReducer(reducer, {
        loading: true,
        error: '',
    });
    const { handleSubmit, control, formState: { errors }, setValue } = useForm();
    const [isAdmin, setIsAdmin] = useState(false);
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const { userInfo } = state;
    const router = useRouter();
    const classes = useStyles();
    
    const fetchData = async () => {
        try {
            dispatch({ type: 'FETCH_REQUEST' });
            const { data } = await axios.get(`/api/admin/users/${userId}`, {
                headers: {
                    authorization: 'Bearer ' + userInfo.token,
                }
            });
            setIsAdmin(data.isAdmin);
            dispatch({ type: 'FETCH_SUCCESS' });
            setValue('name', data.name);
        } catch (error) {
            dispatch({ type: 'FETCH_ERROR', payload: getError(error) });
        }
    }
    
    useEffect(() => {
        if(!userInfo) {
            return router.push('/login');
        } else {
            fetchData();
        }
    }, []);

    const submitHandler = async ({ 
        name,
    }) => {
        closeSnackbar();
        try {
            dispatch({ type: 'UPDATE_REQUEST' });
            await axios.put(`/api/admin/users/${userId}`, {
                name,
                isAdmin,
            }, {
                headers: {
                    authorization: `Bearer ${userInfo.token}`,
                },
            });

            dispatch({ type: 'UPDATE_SUCCESS' });
            enqueueSnackbar('User updated successfully', { variant: "success" });
            router.push('/admin/users')
        } catch (error) {
            dispatch({ type: 'UPDATE_REQUEST', payload: getError(error) });
            enqueueSnackbar(getError(error), { variant: 'error' });
        }
    }

  return (
    <Layout title={`Edit User`}>
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
                                Edit User {userId}
                            </Typography>
                        </ListItem>
                        <ListItem>
                            {loading ? (
                                <CircularProgress />
                            ) : error ? (
                                <Typography className={classes.error}>{error}</Typography>
                            ) : (
                            <form onSubmit={handleSubmit(submitHandler)} className={classes.form}>
                                <List>
                                    <ListItem>
                                        <Controller
                                            name="name"
                                            control={control}
                                            defaultValue=""
                                            rules={{ 
                                                required: true,
                                            }}
                                            render={({ field }) => (
                                                <TextField 
                                                variant='outlined' fullWidth id="name" label="Name"
                                                error={Boolean(errors.name)}
                                                helperText={errors.name ? 'Name is required' : '' }
                                                {...field}
                                                >
                                                </TextField>
                                            )}
                                        >
                                        </Controller>
                                    </ListItem>
                                    <ListItem>
                                        <FormControlLabel label="Status Is Admin?" control={
                                            <Checkbox
                                            onClick={(e) => setIsAdmin(e.target.checked)}
                                            checked={isAdmin}
                                            color="primary"
                                            name="isAdmin"
                                            />
                                        }>
                                        </FormControlLabel>
                                    </ListItem>
                                    <ListItem>
                                        <Button variant="contained" type="submit" fullWidth color="primary">
                                        {loadingUpdate ? <CircularProgress /> : "Update"}
                                        </Button>
                                    </ListItem>
                                </List>
                            </form>
                            )}
                        </ListItem>
                    </List>
                </Card>
            </Grid>
        </Grid>
    </Layout>
  )
}

export async function getServerSideProps({ params }) {
  return { props: { params } };
}

export default dynamic(() => Promise.resolve(UserEditScreen), {ssr: false});