import Head from 'next/head'
import React from 'react'
import { AppBar, Container, CssBaseline, ThemeProvider, Toolbar, Typography, Switch, Badge, Button, Menu, MenuItem } from "@material-ui/core";
import { createTheme } from "@material-ui/core/styles"
import useStyles from './../utils/styles';
import Link from 'next/link';
import { useContext } from 'react';
import { Store } from './../utils/Store';
import Cookies from 'js-cookie';
import { useEffect } from 'react';
import { useState } from 'react';
import { useRouter } from "next/router";

export default function Layout({ title, description, children }) {

  const router = useRouter();
  const {state, dispatch} = useContext(Store);
  const { darkMode, cart, userInfo } = state;
  const [cartItemsCount, setCartItemsCount] = useState(0);
  const [userInformation, setUserInformation] = useState(null);

  useEffect(() => {
    setCartItemsCount(cart.cartItems.reduce((a, c) => a + c.quantity, 0));
    setUserInformation(userInfo);
  }, [cart.cartItems, userInfo, userInformation]);

  const [mode, setMode] = useState(false); 
  useEffect(() => setMode(darkMode), [darkMode]);

  const theme = createTheme({
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
      type: mode ? 'dark' : 'light',
      primary: {
        main: '#f0c000',
      },
      secondary: {
        main: '#208080',
      },
    },
  });
  const classes = useStyles();

  const darkModeHandler = () => {
    dispatch({ type: mode ? 'DARK_MODE_OFF' : 'DARK_MODE_ON' });
    const newDarkMode = !darkMode;
    Cookies.set('darkMode', newDarkMode ? 'ON' : 'OFF');
  } 

  const [anchorEl, setAnchorEl] = useState(null)
  const loginClickHandler = (e) => {
    setAnchorEl(e.currentTarget)
  }
  const loginMenuCloseHandler = () => {
    setAnchorEl(null)
  }
  const logoutClickHandler = () => {
    setAnchorEl(null);
    dispatch({ type: 'USER_LOGOUT' });
    Cookies.remove('userInfo');
    Cookies.remove('cartItems');
    router.push('/login');
  }

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
                <Switch checked={darkMode} onChange={darkModeHandler}>
                </Switch>
                <Link href="/cart" passHref>
                  {cartItemsCount > 0 ? 
                  <a>
                    <Badge overlap='rectangular' color="secondary" badgeContent={cartItemsCount}>
                      Cart
                    </Badge>
                  </a> : 
                  <a>
                    Cart
                  </a>
                  }
                </Link>
                {userInformation ? 
                (
                  <>
                    <Button 
                    aria-controls='simple-menu'
                    aria-haspopup='true'
                    onClick={loginClickHandler}
                    className={classes.navbarButton}>
                      {userInformation.name}
                    </Button>
                    <Menu
                      id="simple-menu"
                      anchorEl={anchorEl}
                      keepMounted
                      open={Boolean(anchorEl)}
                      onClose={loginMenuCloseHandler}
                    >
                      <MenuItem onClick={loginMenuCloseHandler}>Profile</MenuItem>
                      <MenuItem onClick={loginMenuCloseHandler}>My Account</MenuItem>
                      <MenuItem onClick={logoutClickHandler}>Logout</MenuItem>
                    </Menu>
                  </>
                ) : 
                (
                  <Link href="/login">
                    Login
                  </Link>
                )}
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
