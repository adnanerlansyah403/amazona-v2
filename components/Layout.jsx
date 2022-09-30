import Head from 'next/head'
import React from 'react'
import { AppBar, Container, createMuiTheme, CssBaseline, ThemeProvider, Toolbar, Typography } from "@material-ui/core"
import useStyles from './../utils/styles';
import Link from 'next/link';

export default function Layout({ title, description, children }) {

  const theme = createMuiTheme({
    typography: {
      h1 : {
        fontSize: '1.6rem',
        fontWeight: 400,
        margin: '1rem 0',
      },
      h2 : {
        fontSize: '1.4rem',
        fontWeight: 400,
        margin: '1rem 0',
      },
    },
    palette: {
      type: 'light',
      primary: {
        main: '#f0c000',
      },
      secondary: {
        main: '#208080',
      },
    },
  });
  const classes = useStyles();

  return (
    <div>
      <Head>
        <title>{ title ? `${title} - Next Amazona` : 'Next Amazona'}</title>
        {description && <meta name="description" content={description}></meta>}
      </Head>
      <ThemeProvider theme={theme}>
        <CssBaseline />
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
      </ThemeProvider>
    </div>
  )
}
