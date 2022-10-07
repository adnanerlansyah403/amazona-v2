import { Card, Grid, List, ListItem, CircularProgress, Typography, Button, ListItemText, TextField } from '@material-ui/core';
import axios from 'axios';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import React, { useContext, useEffect, useReducer } from 'react'
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

function ProductEditScreen({ params }) {

    const productId = params?.id;
    const { state } = useContext(Store);
    const [{ loading, error, loadingUpdate, loadingUpload }, dispatch ] = useReducer(reducer, {
        loading: true,
        error: '',
    });
    const { handleSubmit, control, formState: { errors }, setValue } = useForm();
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const { userInfo } = state;
    const router = useRouter();
    const classes = useStyles();
    
    useEffect(() => {
        if(!userInfo) {
            return router.push('/login');
        } else {
            const fetchData = async () => {
                try {
                    dispatch({ type: 'FETCH_REQUEST' });
                    const { data } = await axios.get(`/api/admin/products/${productId}`, {
                        headers: {
                            authorization: 'Bearer ' + userInfo.token,
                        }
                    });
                    dispatch({ type: 'FETCH_SUCCESS' });
                    setValue('name', data.name);
                    setValue('slug', data.slug);
                    setValue('price', data.price);
                    setValue('image', data.image);
                    setValue('category', data.category);
                    setValue('brand', data.brand);
                    setValue('countInStock', data.countInStock);
                    setValue('description', data.description);
                } catch (error) {
                    dispatch({ type: 'FETCH_ERROR', payload: getError(error) });
                }
            }
            fetchData();
        }
    }, []);

    const uploadHandler = async (e) => {
        const file = e.target.files[0];
        const bodyFormData = new FormData();
        bodyFormData.append('file', file);
        try {
            dispatch({ type: 'UPLOAD_REQUEST' });
            const { data } = await axios.post(`/api/admin/upload`, bodyFormData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    authorization: 'Bearer ' + userInfo.token,
                },
            });
            dispatch({ type: 'UPLOAD_SUCCESS' });
            setValue('image', data.secure_url);
            enqueueSnackbar('File uploaded successfully', { variant: "success" });
        } catch (error) {
            dispatch({ type: 'UPLOAD_FAIL', payload: getError(error) });
            enqueueSnackbar(getError(error), { variant: "success" });
        }
    }

    const submitHandler = async ({ 
        name,
        slug,
        price,
        category,
        brand,
        image,
        countInStock,
        description,
    }) => {
        closeSnackbar();
        try {
            dispatch({ type: 'UPDATE_REQUEST' });
            await axios.put(`/api/admin/products/${productId}`, {
                name,
                slug,
                price,
                category,
                brand,
                image,
                countInStock,
                description,
            }, {
                headers: {
                    authorization: `Bearer ${userInfo.token}`,
                },
            });

            dispatch({ type: 'UPDATE_SUCCESS' });
            enqueueSnackbar('Product updated successfully', { variant: "success" });
            router.push('/admin/products')
        } catch (error) {
            dispatch({ type: 'UPDATE_REQUEST', payload: getError(error) });
            enqueueSnackbar(getError(error), { variant: 'error' });
        }
    }

  return (
    <Layout title={`Edit Product`}>
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
                                Edit Product {productId}
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
                                        <Controller
                                            name="slug"
                                            control={control}
                                            defaultValue=""
                                            rules={{ 
                                                required: true,
                                            }}
                                            render={({ field }) => (
                                                <TextField 
                                                variant='outlined' fullWidth id="slug" label="Slug"
                                                error={Boolean(errors.slug)}
                                                helperText={errors.slug ? 'Slug is required' : '' }
                                                {...field}
                                                >
                                                </TextField>
                                            )}
                                        >
                                        </Controller>
                                    </ListItem>
                                    <ListItem>
                                        <Controller
                                            name="price"
                                            control={control}
                                            defaultValue=""
                                            rules={{ 
                                                required: true,
                                            }}
                                            render={({ field }) => (
                                                <TextField 
                                                variant='outlined' fullWidth id="price" label="Price"
                                                error={Boolean(errors.price)}
                                                helperText={errors.price ? 'Price is required' : '' }
                                                {...field}
                                                >
                                                </TextField>
                                            )}
                                        >
                                        </Controller>
                                    </ListItem>
                                    <ListItem>
                                        <Controller
                                            name="image"
                                            control={control}
                                            defaultValue=""
                                            rules={{ 
                                                required: true,
                                            }}
                                            render={({ field }) => (
                                                <TextField 
                                                variant='outlined' fullWidth id="image" label="Image"
                                                error={Boolean(errors.image)}
                                                helperText={errors.image ? 'Image is required' : '' }
                                                {...field}
                                                >
                                                </TextField>
                                            )}
                                        >
                                        </Controller>
                                    </ListItem>
                                    <ListItem>
                                        <Button variant="contained" component="label">
                                            {loadingUpload ? <CircularProgress /> : 'Upload File'}
                                            <input type="file" onChange={uploadHandler} hidden />
                                        </Button>
                                    </ListItem>
                                    <ListItem>
                                        <Controller
                                            name="category"
                                            control={control}
                                            defaultValue=""
                                            rules={{ 
                                                required: true,
                                            }}
                                            render={({ field }) => (
                                                <TextField 
                                                variant='outlined' fullWidth id="category" label="Category"
                                                error={Boolean(errors.category)}
                                                helperText={errors.category ? 'Category is required' : '' }
                                                {...field}
                                                >
                                                </TextField>
                                            )}
                                        >
                                        </Controller>
                                    </ListItem>
                                    <ListItem>
                                        <Controller
                                            name="brand"
                                            control={control}
                                            defaultValue=""
                                            rules={{ 
                                                required: true,
                                            }}
                                            render={({ field }) => (
                                                <TextField 
                                                variant='outlined' fullWidth id="brand" label="Brand"
                                                error={Boolean(errors.brand)}
                                                helperText={errors.brand ? 'Brand is required' : '' }
                                                {...field}
                                                >
                                                </TextField>
                                            )}
                                        >
                                        </Controller>
                                    </ListItem>
                                    <ListItem>
                                        <Controller
                                            name="countInStock"
                                            control={control}
                                            defaultValue=""
                                            rules={{ 
                                                required: true,
                                            }}
                                            render={({ field }) => (
                                                <TextField 
                                                variant='outlined' fullWidth id="countInStock" label="Stock"
                                                error={Boolean(errors.countInStock)}
                                                helperText={errors.countInStock ? 'Stock is required' : '' }
                                                {...field}
                                                >
                                                </TextField>
                                            )}
                                        >
                                        </Controller>
                                    </ListItem>
                                    <ListItem>
                                        <Controller
                                            name="description"
                                            control={control}
                                            defaultValue=""
                                            rules={{ 
                                                required: true,
                                            }}
                                            render={({ field }) => (
                                                <TextField 
                                                variant='outlined' fullWidth multine id="description" label="Description"
                                                error={Boolean(errors.description)}
                                                helperText={errors.description ? 'Description is required' : '' }
                                                {...field}
                                                >
                                                </TextField>
                                            )}
                                        >
                                        </Controller>
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

export default dynamic(() => Promise.resolve(ProductEditScreen), {ssr: false});