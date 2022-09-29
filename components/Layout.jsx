import Head from 'next/head'
import React from 'react'
import { AppBar, Container, Toolbar, Typography } from "@material-ui/core"

export default function Layout({ children }) {
  return (
    <div>
      <Head>
        <title>Next Amazona</title>
      </Head>
      <AppBar position="static">
        <Toolbar>
            <Typography>
                Amazona
            </Typography>
        </Toolbar>
      </AppBar>
      <Container>
        {children}
      </Container>
      <footer>
        <Typography>
            All rights reserved. NextAmazona
        </Typography>
      </footer>
    </div>
  )
}
