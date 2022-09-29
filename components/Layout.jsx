import Head from 'next/head'
import React from 'react'
import { AppBar, Container, Toolbar, Typography } from "@material-ui/core"
import useStyles from './../utils/styles';

export default function Layout({ children }) {

  const classes = useStyles();

  return (
    <div>
      <Head>
        <title>Next Amazona</title>
      </Head>
      <AppBar position="static" className={`${classes.navbar}`}>
        <Toolbar>
            <Typography>
                Amazona
            </Typography>
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
