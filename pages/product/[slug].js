import { useRouter } from 'next/router';
import React from 'react'
import Layout from './../../components/Layout';
import data from './../../utils/data';

export default function ProductScreen() {

    const router = useRouter();
    const { slug } = router.query;

    const product = data.products.find(product => product.slug === slug); 

    if(!product) {
        return <div>Product Not Found</div>
    }

  return (
    <Layout>
      <h1>{product.name}</h1>
    </Layout>
  )
}
