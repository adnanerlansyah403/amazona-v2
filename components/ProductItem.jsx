import { Button, Card, CardActionArea, CardActions, CardContent, CardMedia, Typography } from '@material-ui/core'
import { Rating } from '@material-ui/lab'
import Link from 'next/link'
import React from 'react'

export default function ProductItem({product, addToCartHandler}) {
  return (
    <Card>
      <Link href={`/product/${product.slug}`} passHref>
        <CardActionArea>
          <CardMedia height={400} component={'img'} image={product.image.url} title={product.name} />
          <CardContent>
            <Typography>
              {product.name}
            </Typography>
            <Rating value={product.rating} readOnly></Rating>
          </CardContent>
        </CardActionArea>
      </Link>
      <CardActions>
        <Typography>
          ${product.price}
        </Typography>
        <Button size="small" color="primary" onClick={() => addToCartHandler(product)}>
          Add to Cart
        </Button>
      </CardActions>
    </Card>
  )
}
