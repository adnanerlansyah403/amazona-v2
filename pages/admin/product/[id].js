import { Card, Grid, List, ListItem, CircularProgress, Typography, Button, ListItemText, TextField, FormControlLabel, Checkbox } from '@material-ui/core';
import axios from 'axios';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import React, { useState, useContext, useEffect, useReducer } from 'react'
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
    const [{ loading, error, loadingUpload }, dispatch ] = useReducer(reducer, {
        loading: true,
        error: '',
    });
    const { handleSubmit, control, formState: { errors }, setValue } = useForm();
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const { userInfo } = state;
    const router = useRouter();
    const classes = useStyles();
    const [ publicIdImage, setPublicIdImage ] = useState("");
    const [imageName, setImageName] = useState("");
    const [ publicIdFeaturedImage, setPublicIdFeaturedImage ] = useState("");
    const [featuredImageName, setFeaturedImageName] = useState("");
    const [isFeatured, setIsFeatured] = useState(false);
    
    useEffect(() => {
        if(!userInfo) {
            router.push('/login');
            return;
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
                    setValue('link', data.image.url);
                    setPublicIdImage(data.image.public_id);
                    setValue('linkFeaturedImage', data.featuredImage.url);
                    setPublicIdFeaturedImage(data.featuredImage.public_id);
                    setIsFeatured(data.isFeatured);
                    setValue('category', data.category);
                    setValue('brand', data.brand);
                    setValue('countInStock', data.countInStock);
                    setValue('description', data.description);
                    console.log(data)
                    
                } catch (error) {
                    dispatch({ type: 'FETCH_ERROR', payload: getError(error) });
                }
            }
            fetchData();

        }
    }, []);

    const uploadHandler = async (e, imageField = 'image') => {
        const file = e.target.files[0];
        setValue(imageField, file);
        if(imageField === 'featuredImage') {
            setFeaturedImageName(file?.name);
        } else {
            setImageName(file?.name);
        }
    };

    const submitHandler = async (e) => {
        closeSnackbar();
        try {
            dispatch({ type: 'UPDATE_REQUEST' });
            if(e.image !== undefined || e.featuredImage !== undefined) {
                
                if(e.featuredImage !== undefined && e.image === undefined) {
                    const bodyFormDataFeaturedImage = new FormData();
                    bodyFormDataFeaturedImage.append('file', e.featuredImage);
                    console.log(bodyFormDataFeaturedImage)
                    const { data: dataFeaturedImage } = await axios.post('/api/admin/upload', bodyFormDataFeaturedImage, {
                        headers: {
                        'Content-Type': 'multipart/form-data',
                        authorization: `Bearer ${userInfo.token}`,
                        },
                    });
                    setValue('linkFeaturedImage', dataFeaturedImage.secure_url);
                    console.log(dataFeaturedImage.public_id);
                    await axios.put(`/api/admin/products/${productId}`, 
                    {
                        name: e.name,
                        slug: e.slug,
                        price: e.price,
                        category: e.category,
                        brand: e.brand,
                        publicIdImage,
                        image: e.link,
                        isFeatured,
                        publicIdFeaturedImage: dataFeaturedImage.public_id,
                        featuredImage: dataFeaturedImage.secure_url,
                        countInStock: e.countInStock,
                        description: e.description
                    }, {
                        headers: {
                            authorization: `Bearer ${userInfo.token}`,
                        },
                    });
                    dispatch({ type: 'UPDATE_SUCCESS' });
                    enqueueSnackbar('Updated and uploaded feature image successfully', { variant: "success" });
                    return router.push('/admin/products');
                } else if(e.featuredImage === undefined && e.image !== undefined) {
                    const bodyFormDataImage = new FormData();
                    bodyFormDataImage.append('file', e.image);
                    const { data: dataImage } = await axios.post('/api/admin/upload', bodyFormDataImage, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            authorization: `Bearer ${userInfo.token}`,
                        },
                    });
                    setValue('link', dataImage.secure_url);
                    await axios.put(`/api/admin/products/${productId}`, 
                    {
                        name: e.name,
                        slug: e.slug,
                        price: e.price,
                        category: e.category,
                        brand: e.brand,
                        publicIdImage: dataImage.public_id,
                        image: dataImage.secure_url,
                        isFeatured,
                        publicIdFeaturedImage,
                        featuredImage: e.linkFeaturedImage,
                        countInStock: e.countInStock,
                        description: e.description
                    }, {
                        headers: {
                            authorization: `Bearer ${userInfo.token}`,
                        },
                    });
                    dispatch({ type: 'UPDATE_SUCCESS' });
                    enqueueSnackbar('Updated and uploaded image successfully', { variant: "success" });
                    return router.push('/admin/products');
                }
                
                // berjalan ketika memang terdapat perubahan pada file image dan featuredImage
                const bodyFormDataImage = new FormData();
                bodyFormDataImage.append('file', e.image);
                const { data: dataImage } = await axios.post('/api/admin/upload', bodyFormDataImage, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        authorization: `Bearer ${userInfo.token}`,
                    },
                });
                setValue('link', dataImage.secure_url);
                setPublicIdImage(dataImage.public_id);
                // upload featuredImage
                const bodyFormDataFeaturedImage = new FormData();
                bodyFormDataFeaturedImage.append('file', e.featuredImage);
                console.log(bodyFormDataFeaturedImage)
                const { data: dataFeaturedImage } = await axios.post('/api/admin/upload', bodyFormDataFeaturedImage, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        authorization: `Bearer ${userInfo.token}`,
                    },
                });
                setValue('linkFeaturedImage', dataFeaturedImage.secure_url);
                setPublicIdFeaturedImage(dataFeaturedImage.public_id);
                await axios.put(`/api/admin/products/${productId}`, 
                {
                    name: e.name,
                    slug: e.slug,
                    price: e.price,
                    category: e.category,
                    brand: e.brand,
                    publicIdImage,
                    image: dataImage.secure_url,
                    isFeatured,
                    publicIdFeaturedImage,
                    featuredImage: dataFeaturedImage.secure_url,
                    countInStock: e.countInStock,
                    description: e.description
                }, {
                    headers: {
                        authorization: `Bearer ${userInfo.token}`,
                    },
                });
                dispatch({ type: 'UPDATE_SUCCESS' });
                enqueueSnackbar('Updated and uploaded image&feature successfully', { variant: "success" });
                return router.push('/admin/products');
            }
            
            // berjalan ketika memang tidak ada update pada image dan feature image
            await axios.put(`/api/admin/products/${productId}`, {
                name: e.name,
                slug: e.slug,
                price: e.price,
                category: e.category,
                brand: e.brand,
                publicIdImage,
                image: e.link,
                isFeatured,
                publicIdFeaturedImage,
                featuredImage: e.linkFeaturedImage,
                countInStock: e.countInStock,
                description: e.description,
            }, {
                headers: {
                    authorization: `Bearer ${userInfo.token}`,
                },
            });

            dispatch({ type: 'UPDATE_SUCCESS' });
            enqueueSnackbar('Product updated successfully', { variant: "success" });
        } catch (error) {
            dispatch({ type: 'UPDATE_FAIL', payload: getError(error) });
            enqueueSnackbar(getError(error), { variant: 'error' });
        }
        return router.push('/admin/products');
        
        // end of the line
    }

  return (
    <Layout title={`Edit Product`}>
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
                            <ListItem button>
                                <ListItemText primary="Orders"></ListItemText>
                            </ListItem>
                        </Link>
                        <Link href="/admin/products" passHref>
                            <ListItem selected button>
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
                                Edit Product {productId}
                            </Typography>
                        </ListItem>
                        <ListItem>
                            {loading ? (
                                <CircularProgress />
                            ) : error ? (
                                <Typography className={classes.error}>{error}</Typography>
                            ) : (
                            <form onSubmit={(e) => handleSubmit(submitHandler)(e)} className={classes.form} encType='multipart/form-data'>
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
                                            name="link"
                                            control={control}
                                            defaultValue=""
                                            rules={{ 
                                                required: true,
                                            }}
                                            render={({ field }) => (
                                                <TextField 
                                                disabled
                                                variant='outlined' fullWidth id="link" label="Link Image"
                                                error={Boolean(errors.image)}
                                                helperText={errors.image ? 'Link Image is required' : '' }
                                                {...field}
                                                >
                                                </TextField>
                                            )}
                                        >
                                        </Controller>   
                                    </ListItem>
                                    <ListItem>
                                        <Button variant="contained" component="label">
                                            {loadingUpload ? <CircularProgress /> : 'Upload File Image'}
                                            <input type="file" onChange={uploadHandler} hidden />
                                        </Button>
                                        <Typography style={{ marginLeft: "10px" }} color="primary">
                                                {imageName && imageName}
                                        </Typography>
                                    </ListItem>
                                    <ListItem>
                                        <FormControlLabel
                                            label="Is Featured"
                                            control={
                                                <Checkbox 
                                                onClick={(e) => setIsFeatured(e.target.checked)} 
                                                checked={isFeatured}   
                                                name="isFeatured"
                                                />
                                            }
                                        >
                                        </FormControlLabel>
                                    </ListItem>
                                    <ListItem>
                                        <Controller
                                            name="linkFeaturedImage"
                                            control={control}
                                            defaultValue=""
                                            rules={{ 
                                                required: true,
                                            }}
                                            render={({ field }) => (
                                                <TextField 
                                                disabled
                                                variant='outlined' fullWidth id="linkFeaturedImage" label="Link Feature Image"
                                                error={Boolean(errors.featuredImage)}
                                                helperText={errors.featuredImage ? 'Featured Image is required' : '' }
                                                {...field}
                                                >
                                                </TextField>
                                            )}
                                        >
                                        </Controller>   
                                    </ListItem>
                                    <ListItem>
                                        <Button variant="contained" component="label">
                                            {loadingUpload ? <CircularProgress /> : 'Upload Feature Image'}
                                            <input type="file" onChange={(e) => uploadHandler(e, 'featuredImage')} hidden />
                                        </Button>
                                        <Typography style={{ marginLeft: "10px" }} color="primary">
                                                {featuredImageName && featuredImageName}
                                        </Typography>
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
                                                variant='outlined' fullWidth multiline id="description" label="Description"
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
                                            Update
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
