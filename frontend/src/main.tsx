import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.js'
import { Provider } from 'react-redux'
import { store } from './store/index.js'
// import AxiosInterceptorWrapper from './wrappers/AxiosInterceptorwrapper.jsx'

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <Provider store={store}>
      {/* <AxiosInterceptorWrapper> */}
      <App />
      {/* </AxiosInterceptorWrapper> */}
    </Provider>
  </StrictMode>,
)
