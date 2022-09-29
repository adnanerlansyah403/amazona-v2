import Head from 'next/head'
import React from 'react'
import { AppBar, Container, Toolbar, Typography } from "@material-ui/core"
import useStyles from './../utils/styles';
import Link from 'next/link';

export default function Layout({ children }) {

  const classes = useStyles();

  return (
    <div>
      <Head>
        <title>Next Amazona</title>
      </Head>
      <AppBar position="static" className={`${classes.navbar}`}>
        <Toolbar>
            <Typography className={classes.brand}>
                <Link href="/">
                  Amazona
                </Link>
            </Typography>
            <div className={classes.grow}></div>
            <div>
              <Link href="/cart">
                Cart
              </Link>
              <Link href="/login">
                Login
              </Link>
            </div>
        </Toolbar>
      </AppBar>
      <Container className={`${classes.main}`}>
        {children}
      </Container>
      <footer className={`${classes.footer}`}>
        <Typography>
            All rights reserved. NextAmazona
        </Typography>
      </footer>
    </div>
  )
}
