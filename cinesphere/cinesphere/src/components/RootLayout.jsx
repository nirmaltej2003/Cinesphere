import React from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header'
import BackToTop from './BackToTop'

export default function RootLayout() {
  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
      <BackToTop />
    </>
  )
}
