import React from 'react'
import Layout from './../components/Layout';
import { Button, List, ListItem, TextField, Typography } from '@material-ui/core';
import useStyles from '../utils/styles';
import Link from 'next/link';

export default function LoginScreen() {

    const classes = useStyles();

  return (
    <Layout title="Login">
      <form className={classes.form}>
        <Typography component="h1" variant="h1">
            Login
        </Typography>
        <List>
            <ListItem>
                <TextField 
                variant='outlined' fullWidth id="email" label="Email"
                inputProps={{ type: 'email' }}
                >
                </TextField>
            </ListItem>
            <ListItem>
                <TextField 
                variant='outlined' fullWidth id="password" label="Password"
                inputProps={{ type: 'password' }}
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
                    <Link href="/register"> Register Now </Link>
                </Typography>
            </ListItem>
        </List>
      </form>
    </Layout>
  )
}
