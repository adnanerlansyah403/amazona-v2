import { useRouter } from 'next/router'
import React, { useContext } from 'react'
import { Store } from '../utils/Store';
import Layout from './../components/Layout';

export default function ShippingScreen() {

    const router = useRouter();
    const { state, dispatch } = useContext(Store);
    const { userInfo } = state;
    if(!userInfo) {
        router.push('/login?redirect=/shipping');
    }
    

  return (
    <Layout title="Shipping">
      Shipping
    </Layout>
  )
}
