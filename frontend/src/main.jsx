import React from 'react'

import ReactDOM from 'react-dom/client'

import { HeroUIProvider } from '@heroui/react'

import { ToastProvider } from "@heroui/toast"

import EDI_PLUS from './edi'

import './index.css'

ReactDOM.createRoot(document.getElementById('edi+')).render(
  <React.StrictMode>
    <HeroUIProvider>
      <ToastProvider />
      <EDI_PLUS />
    </HeroUIProvider>
  </React.StrictMode>
)