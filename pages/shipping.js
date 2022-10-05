import React, { useContext, useEffect } from 'react'
import Layout from './../components/Layout';
import { Button, List, ListItem, TextField, Typography } from '@material-ui/core';
import useStyles from '../utils/styles';
import { Store } from '../utils/Store';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import { Controller, useForm } from 'react-hook-form';
import CheckoutWizard from './../components/CheckoutWizard';

export default function ShippingScreen() {

    const { handleSubmit, control, formState: { errors }, setValue } = useForm();
    const router = useRouter();
    const { state, dispatch } = useContext(Store);
    const { userInfo, cart: { shippingAddress } } = state;
    useEffect(() => {
        if(!userInfo) {
            router.push('/login?redirect=/shipping');
        }
        setValue('fullName', shippingAddress?.fullName);
        setValue('address', shippingAddress?.address);
        setValue('city', shippingAddress?.city);
        setValue('postalCode', shippingAddress.postalCode);
        setValue('country', shippingAddress?.country);
    }, []);
    const classes = useStyles();

    const submitHandler = ({ fullName, address, city, postalCode, country }) => {
        dispatch({ type: 'SAVE_SHIPPING_ADDRESS', payload: {
          fullName,
          address,
          city,
          postalCode,
          country,
        } });
        Cookies.set('shippingAddress', JSON.stringify({
          fullName,
          address,
          city,
          postalCode,
          country,
        }));
        router.push('/payment');
    }

  return (
    <Layout title="Shipping Address">
        <CheckoutWizard activeStep={1}></CheckoutWizard>
      <form onSubmit={handleSubmit(submitHandler)} className={classes.form}>
        <Typography component="h1" variant="h1">
            Shipping Address
        </Typography>
        <List>
            <ListItem>
                <Controller
                    name="fullName"
                    control={control}
                    defaultValue=""
                    rules={{ 
                        required: true,
                        minLength: 3,
                    }}
                    render={({ field }) => (
                        <TextField 
                        variant='outlined' fullWidth id="fullName" label="Full Name"
                        inputProps={{ type: 'fullName' }}
                        error={Boolean(errors.fullName)}
                        helperText={errors.fullName ? errors.fullName.type === 'minLength' ? 'Full Name length must be more than 3 characters' : 'Full Name is required' : ''}
                        {...field}
                        >
                        </TextField>
                    )}
                >
                </Controller>
            </ListItem>
            <ListItem>
                <Controller
                    name="address"
                    control={control}
                    defaultValue=""
                    rules={{ 
                        required: true,
                        minLength: 10,
                    }}
                    render={({ field }) => (
                        <TextField 
                        variant='outlined' fullWidth id="address" label="Address"
                        inputProps={{ type: 'address' }}
                        error={Boolean(errors.address)}
                        helperText={errors.address ? errors.address.type === 'minLength' ? 'Address length must be more than 3 characters' : 'Address is required' : ''}
                        {...field}
                        >
                        </TextField>
                    )}
                >
                </Controller>
            </ListItem>
            <ListItem>
                <Controller
                    name="city"
                    control={control}
                    defaultValue=""
                    rules={{ 
                        required: true,
                        minLength: 6,
                    }}
                    render={({ field }) => (
                        <TextField 
                        variant='outlined' fullWidth id="city" label="City"
                        inputProps={{ type: 'city' }}
                        error={Boolean(errors.city)}
                        helperText={errors.city ? errors.city.type === 'minLength' ? 'City length must be more than 3 characters' : 'City is required' : ''}
                        {...field}
                        >
                        </TextField>
                    )}
                >
                </Controller>
            </ListItem>
            <ListItem>
                <Controller
                    name="postalCode"
                    control={control}
                    defaultValue=""
                    rules={{ 
                        required: true,
                        minLength: 4,
                    }}
                    render={({ field }) => (
                        <TextField 
                        variant='outlined' fullWidth id="postalCode" label="Postal Code"
                        inputProps={{ type: 'postalCode' }}
                        error={Boolean(errors.postalCode)}
                        helperText={errors.postalCode ? errors.postalCode.type === 'minLength' ? 'Postal Code length must be more than 3 characters' : 'Postal Code is required' : ''}
                        {...field}
                        >
                        </TextField>
                    )}
                >
                </Controller>
            </ListItem>
            <ListItem>
                <Controller
                    name="country"
                    control={control}
                    defaultValue=""
                    rules={{ 
                        required: true,
                        minLength: 5,
                    }}
                    render={({ field }) => (
                        <TextField 
                        variant='outlined' fullWidth id="country" label="Country"
                        inputProps={{ type: 'country' }}
                        error={Boolean(errors.country)}
                        helperText={errors.country ? errors.country.type === 'minLength' ? 'Country length must be more than 3 characters' : 'Country is required' : ''}
                        {...field}
                        >
                        </TextField>
                    )}
                >
                </Controller>
            </ListItem>
            <ListItem>
                <Button variant="contained" type="submit" fullWidth color="primary">
                    Continue
                </Button>
            </ListItem>
        </List>
      </form>
    </Layout>
  )
}
