import React, { useContext, useEffect, useState } from 'react'
import Layout from './../components/Layout';
import { Button, List, ListItem, TextField, Typography } from '@material-ui/core';
import useStyles from '../utils/styles';
import Link from 'next/link';
import axios from 'axios';
import { Store } from '../utils/Store';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';

export default function LoginScreen() {

    const router = useRouter();
    const {redirect} = router.query; // login?redirect=/shipping
    const { state, dispatch } = useContext(Store);
    const { userInfo } = state;
    useEffect(() => {
        if(userInfo) {
            router.push('/');
        }
    }, []);
    const classes = useStyles();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("")

    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.post(`/api/users/login`, {
                email,
                password
            });
            dispatch({ type: 'USER_LOGIN', payload: data });
            Cookies.set('userInfo', JSON.stringify(data));
            router.push(redirect || '/');
        } catch (error) {
            alert(error.response.data ? error.response.data.message : error.message);
        }
    }

  return (
    <Layout title="Login">
      <form onSubmit={submitHandler} className={classes.form}>
        <Typography component="h1" variant="h1">
            Login
        </Typography>
        <List>
            <ListItem>
                <TextField 
                variant='outlined' fullWidth id="email" label="Email"
                inputProps={{ type: 'email' }}
                onChange={(e) => setEmail(e.target.value)}
                >
                </TextField>
            </ListItem>
            <ListItem>
                <TextField 
                variant='outlined' fullWidth id="password" label="Password"
                inputProps={{ type: 'password' }}
                onChange={(e) => setPassword(e.target.value)}
                >
                </TextField>
            </ListItem>
            <ListItem>
                <Button variant="contained" type="submit" fullWidth color="primary">
                    Login
                </Button>
            </ListItem>
            <ListItem>
                Don&apos;t have an account?, &nbsp;  
                <Typography color="primary">
                    <Link href={`/register?redirect=${redirect || '/'}`}> Register Now </Link>
                </Typography>
            </ListItem>
        </List>
      </form>
    </Layout>
  )
}
