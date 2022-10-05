import { Button, Card, Grid, List, ListItem, MenuItem, Select, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@material-ui/core';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useContext, useEffect, useState } from 'react'
import Layout from '../components/Layout';
import { Store } from './../utils/Store';
import dynamic from 'next/dynamic';
import axios from 'axios';

function CartScreen() {

    const router = useRouter();
    const { state, dispatch } = useContext(Store);
    const {
      cart: { cartItems },
    } = state;
    
    const [carts, setCarts] = useState([]);

    const addToCartHandler = async (item, quantity) => {
        const { data } = await axios.get(`/api/products/${item._id}`);
        if(data.countInStock < quantity) {
          window.alert('Sorry. Product is out of stock');
          return;
        }
        dispatch({ type: 'CART_ADD_ITEM', payload: {...item, quantity }});
  
        // router.push('/cart');
    }

    const removeItemHandler = (item) => {
        dispatch({ type: 'CART_REMOVE_ITEM', payload: item });
    }

    useEffect(() => setCarts(cartItems), [cartItems])

    const checkoutHandler = () => {
        router.push('/shipping')
    }

  return (
    <Layout title="Shopping Cart">
      <Typography component="h1" variant="h1">
        Shopping cart
      </Typography>
      {carts.length === 0 ? <div>
        Cart is empty. {" "}
        <Typography color="primary">
            <Link href="/">Go to Shopping</Link>
        </Typography>
      </div> : (
        <Grid container spacing={6}>
            <Grid item md={9} xs={12}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Image</TableCell>
                                <TableCell>Name</TableCell>
                                <TableCell align="right">Quantity</TableCell>
                                <TableCell align="right">Price</TableCell>
                                <TableCell align="right">Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {carts?.map((item) => (
                                <TableRow key={item._id}>
                                    <TableCell>
                                        <Link href={`/product/${item.slug}`}>
                                            <a>
                                                <Image src={item.image} alt={item.name} width="50" height="50" />
                                            </a>
                                        </Link> 
                                    </TableCell>
                                    <TableCell>
                                        <Link href={`/product/${item.slug}`} passHref>
                                            <Typography>{item.name}</Typography>
                                        </Link>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Select 
                                        value={item.quantity}
                                        onChange={(e) => addToCartHandler(item, e.target.value)}
                                        >
                                        {[...Array(item.countInStock).keys()].map((x) => (
                                            <MenuItem key={x + 1} value={x + 1}>
                                            {x + 1}
                                            </MenuItem>
                                        ))}
                                        </Select>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Typography>
                                            {item.price}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Button variant="contained" color="secondary"
                                        onClick={() => removeItemHandler(item)}
                                        >
                                            X
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Grid>
            <Grid item md={3} xs={12}>
                <Card>
                    <List>
                        <ListItem>
                            <Typography variant="h2">
                                Subtotal ({cartItems.reduce((acc, cur) => acc + cur.quantity, 0)} items) {' '} 
                                : & $ {cartItems.reduce((a, c) => a + c.quantity * c.price, 0)}
                            </Typography>
                        </ListItem>
                        <ListItem>
                            <Button variant="contained" color="primary" fullWidth
                            onClick={checkoutHandler}
                            >
                                Checkout
                            </Button>
                        </ListItem>
                    </List>
                </Card>
            </Grid>
        </Grid>
      )}
    </Layout>
  )
}

export default dynamic(() => Promise.resolve(CartScreen), {ssr: false});