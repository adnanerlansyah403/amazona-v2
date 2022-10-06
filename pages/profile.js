import { Card, Grid, List, ListItem, Typography, Button, ListItemText, TextField } from '@material-ui/core';
import axios from 'axios';
import Cookies from 'js-cookie';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import React, { useContext, useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form';
import { getError } from '../utils/error';
import { Store } from '../utils/Store';
import Layout from './../components/Layout';
import useStyles from './../utils/styles';

function ProfileScreen() {

    const { state, dispatch } = useContext(Store);
    const { handleSubmit, control, formState: { errors }, setValue } = useForm();
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const { userInfo } = state;
    const router = useRouter();
    const classes = useStyles();
    
    useEffect(() => {
        if(!userInfo) {
            return router.push('/login');
        }
        setValue('name', userInfo.name);
        setValue('email', userInfo.email);
    }, []);

    const submitHandler = async ({ name, email, password, confirmPassword }) => {
        closeSnackbar();
        if(password !== confirmPassword) {
            enqueueSnackbar('Password does not match', { variant: 'error' });
            return;
        }
        try {
            const { data } = await axios.put(`/api/users/profile`, {
                name,
                email,
                password,
            }, {
                headers: {
                    authorization: `Bearer ${userInfo.token}`,
                },
            });
            dispatch({ type: 'USER_LOGIN', payload: data });
            Cookies.set('userInfo', JSON.stringify(data));

            enqueueSnackbar('Profile updated successfully', { variant: "success" });
        } catch (error) {
            enqueueSnackbar(getError(error), { variant: 'error' });
        }
    }

  return (
    <Layout title="Profile">
        <Grid container spacing={6} className={classes.marginTopContainer}>
            <Grid item md={3} xs={12}>
                <Card className={classes.section}>
                    <List>
                        <Link href="/profile" passHref>
                            <ListItem selected button component="a">
                                <ListItemText primary="User Profile"></ListItemText>
                            </ListItem>
                        </Link>
                        <Link href="/order-history" passHref>
                            <ListItem button component="a">
                                <ListItemText primary="Order History"></ListItemText>
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
                                Profile
                            </Typography>
                        </ListItem>
                        <ListItem>
                        <form onSubmit={handleSubmit(submitHandler)} className={classes.form}>
                            <List>
                                <ListItem>
                                    <Controller
                                        name="name"
                                        control={control}
                                        defaultValue=""
                                        rules={{ 
                                            required: true,
                                            minLength: 3,
                                        }}
                                        render={({ field }) => (
                                            <TextField 
                                            variant='outlined' fullWidth id="name" label="Name"
                                            inputProps={{ type: 'name' }}
                                            error={Boolean(errors.name)}
                                            helperText={errors.name ? errors.name.type === 'minLength' ? 'Name length must be more than 3 characters' : 'Name is required' : ''}
                                            {...field}
                                            >
                                            </TextField>
                                        )}
                                    >
                                    </Controller>
                                </ListItem>
                                <ListItem>
                                    <Controller
                                        name="email"
                                        control={control}
                                        defaultValue=""
                                        rules={{ 
                                            required: true,
                                            pattern: /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/
                                        }}
                                        render={({ field }) => (
                                            <TextField 
                                            variant='outlined' fullWidth id="email" label="Email"
                                            inputProps={{ type: 'email' }}
                                            error={Boolean(errors.email)}
                                            helperText={errors.email ? errors.email.type === 'pattern' ? 'Email is not valid' : 'Email is required' : ''}
                                            {...field}
                                            >
                                            </TextField>
                                        )}
                                    >
                                    </Controller>
                                </ListItem>
                                <ListItem>
                                    <Controller
                                        name="password"
                                        control={control}
                                        defaultValue=""
                                        rules={{ 
                                            validate: (value) => (value === "" || value.length > 5 || 'Password length must be at least more than 5')
                                        }}
                                        render={({ field }) => (
                                            <TextField 
                                            variant='outlined' fullWidth id="password" label="Password"
                                            inputProps={{ type: 'password' }}
                                            error={Boolean(errors.password)}
                                            helperText={errors.password ? 'Password length is more than 5' : ''}
                                            {...field}
                                            >
                                            </TextField>
                                        )}
                                    >
                                    </Controller>
                                </ListItem>
                                <ListItem>
                                    <Controller
                                        name="confirmPassword"
                                        control={control}
                                        defaultValue=""
                                        rules={{ 
                                            validate: (value) => (value === "" || value.length > 5 || 'Confirm Password length must be at least more than 5')
                                        }}
                                        render={({ field }) => (
                                            <TextField 
                                            variant='outlined' fullWidth id="confirmPassword" label="Confirm Password"
                                            inputProps={{ type: 'password' }}
                                            error={Boolean(errors.confirmPassword)}
                                            helperText={errors.confirmPassword ? 'Confirm Password length is more than 5' : ''}
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
                        </ListItem>
                    </List>
                </Card>
            </Grid>
        </Grid>
    </Layout>
  )
}

export default dynamic(() => Promise.resolve(ProfileScreen), {ssr: false});