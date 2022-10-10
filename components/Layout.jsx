import Head from 'next/head'
import React from 'react'
import { AppBar, Container, CssBaseline, ThemeProvider, Toolbar, Typography, Switch, Badge, Button, Menu, MenuItem, Box, IconButton, Drawer, List, ListItem, Divider, ListItemText, InputBase } from "@material-ui/core";
import MenuIcon from "@material-ui/icons/Menu";
import CancelIcon from "@material-ui/icons/Cancel";
import SearchIcon from '@material-ui/icons/Search';
import { createTheme } from "@material-ui/core/styles"
import useStyles from './../utils/styles';
import Link from 'next/link';
import { useContext } from 'react';
import { Store } from './../utils/Store';
import Cookies from 'js-cookie';
import { useEffect } from 'react';
import { useState } from 'react';
import { useRouter } from "next/router";
import { useSnackbar } from 'notistack';
import axios from 'axios';
import { getError } from '../utils/error';

export default function Layout({ title, description, children }) {

  const router = useRouter();
  const {state, dispatch} = useContext(Store);
  const { darkMode, cart, userInfo } = state;
  const { enqueueSnackbar } = useSnackbar();
  const [cartItemsCount, setCartItemsCount] = useState(0);
  const [sidebarVisible, setSidebarVisible] = useState(false)
  const [categories, setCategories] = useState([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    setCartItemsCount(cart.cartItems.reduce((a, c) => a + c.quantity, 0));
    fetchCategories();
  }, [cart.cartItems, userInfo]);

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
  const loginMenuCloseHandler = (e, redirect) => {
    setAnchorEl(null)
    if(redirect) {
      router.push(redirect);
    }
  }
  const logoutClickHandler = () => {
    setAnchorEl(null);
    dispatch({ type: 'USER_LOGOUT' });
    Cookies.remove('userInfo');
    Cookies.remove('cartItems');
    router.push('/login');
  }

  const sidebarOpenHandler = () => {
    setSidebarVisible(true);
  }
  const sidebarCloseHandler = () => {
    setSidebarVisible(false);
  }

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get(`/api/products/categories`);
      setCategories(data);
    } catch (error) {
      enqueueSnackbar(getError(error), { variant: "error"} );
    }
  }

  const queryChangeHandler = (e) => {
    setQuery(e.target.value);
  }

  const submitHandler = (e) => {
    e.preventDefault();
    router.push(`/search?query=${query}`);
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
          <Toolbar className={classes.toolbar}>
            <Box display="flex" alignItems="center">
                <IconButton
                  edge="start"
                  aria-label="open drawer"
                  onClick={sidebarOpenHandler}
                  className={classes.menuButton}
                >
                  <MenuIcon className={classes.navbarButton} />
                </IconButton>
                <Typography className={classes.brand}>
                    <Link href="/">
                      Amazona
                    </Link>
                </Typography>
              </Box>
              <Drawer
                anchor="left"
                open={sidebarVisible}
                onClose={sidebarCloseHandler}
                style={{ width: "300px" }}
              >
                <List>
                <ListItem>
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="space-between"
                      style={{ position: "relative" }}
                    >
                      <Typography>
                        Shopping by category
                        <IconButton
                        >
                          <CancelIcon
                          aria-label="close"
                          onClick={sidebarCloseHandler} />
                        </IconButton>
                      </Typography>
                    </Box>
                  </ListItem>
                  <Divider light />
                  {categories?.map((category) => (
                    <Link key={category}
                      href={`/search?category=${category}`}
                      passHref
                    >
                      <ListItem button onClick={sidebarCloseHandler}>
                        <ListItemText primary={category} />
                      </ListItem>  
                    </Link>
                  ))}
                </List>
              </Drawer>
              <div className={classes.searchSection}>
                <form onSubmit={submitHandler} className={classes.searchForm}>
                    <InputBase name="query"
                      className={classes.searchInput}
                      placeholder="Search Products"
                      onChange={queryChangeHandler}
                    >
                    </InputBase>
                    <IconButton
                      type="submit"
                      className={classes.iconButton}
                      aria-label="search"
                    >
                      <SearchIcon />
                    </IconButton>
                </form>
              </div>
              <div> 
                <Switch checked={darkMode} onChange={darkModeHandler}>
                </Switch>
                <Typography component="span">
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
                </Typography>
                {userInfo ? 
                (
                  <>
                    <Button 
                    aria-controls='simple-menu'
                    aria-haspopup='true'
                    onClick={loginClickHandler}
                    className={classes.navbarButton}>
                      {userInfo.name}
                    </Button>
                    <Menu
                      id="simple-menu"
                      anchorEl={anchorEl}
                      keepMounted
                      open={Boolean(anchorEl)}
                      onClose={loginMenuCloseHandler}
                    >
                      <MenuItem onClick={(e) => loginMenuCloseHandler(e, "/profile")}>Profile</MenuItem>
                      <MenuItem onClick={(e) => loginMenuCloseHandler(e, "/order-history")}>Order History</MenuItem>
                      {userInfo?.isAdmin && (
                      <MenuItem onClick={(e) => loginMenuCloseHandler(e, "/admin/dashboard")}>Admin Dashboard</MenuItem>
                      )}
                      <MenuItem onClick={logoutClickHandler}>Logout</MenuItem>
                    </Menu>
                  </>
                ) : 
                (
                  <Typography component="span">
                    <Link href="/login">
                      Login
                    </Link>
                  </Typography>
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
