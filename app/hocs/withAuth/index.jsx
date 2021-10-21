import * as R from 'ramda'
import { useEffect, useState } from 'react'

import getJwtPayload from '../../helpers/getJwtPayload'
import isJwtExpired from '../../helpers/isJwtExpired'
import useIsMounted from '../../hooks/useIsMounted'
import Context from './Context'

const getInitialState = () => {
  const maybeRefreshToken = process.browser ? window.localStorage.getItem('refreshToken') : null
  const maybeSessionToken = process.browser ? window.localStorage.getItem('sessionToken') : null

  return {
    isAuthenticated: null,
    isLoading: true,
    refreshToken: maybeRefreshToken,
    sessionToken: maybeSessionToken,
  }
}

const getInitialUser = () => {
  if (!process.browser) {
    return null
  }

  const maybeUserJson = window.localStorage.getItem('user')
  const maybeUser = maybeUserJson !== null ? JSON.parse(maybeUserJson) : null

  return maybeUser
}

export default function withAuth(Component) {
  return function WithAuth(pageProps) {
    const [state, setState] = useState(getInitialState())
    const [user, setUser] = useState(getInitialUser())
    const isMounted = useIsMounted()

    const logIn = async (sessionToken, refreshToken = null) => {
      const sessionTokenPayload = await getJwtPayload(sessionToken)

      const user = R.pick(['id', 'email', 'role'])(sessionTokenPayload)
      const userJson = JSON.stringify(user)

      if (refreshToken !== null) {
        window.localStorage.setItem('refreshToken', refreshToken)
      }
      window.localStorage.setItem('sessionToken', sessionToken)
      window.localStorage.setItem('user', userJson)

      if (isMounted()) {
        setState({
          ...state,
          isAuthenticated: true,
          refreshToken,
          sessionToken,
        })
        setUser(user)
      }
    }

    // Useful to force a re-login with the email field prefilled
    const clearSessionToken = () => {
      window.localStorage.removeItem('sessionToken')

      if (isMounted()) {
        setState({
          ...state,
          isAuthenticated: false,
          sessionToken: null,
        })
      }
    }

    const logOut = () => {
      window.localStorage.clear()

      if (isMounted()) {
        setState({
          ...state,
          isAuthenticated: false,
          refreshToken: null,
          sessionToken: null,
        })
        setUser(null)
      }
    }

    const providerValue = {
      clearSessionToken,
      logIn,
      logOut,
      state,
      user,
    }

    useEffect(() => {
      if (state.sessionToken === null && isMounted()) {
        setState({
          ...state,
          isAuthenticated: false,
          isLoading: false,
        })

        return
      }

      ;(async () => {
        const isSessionExpired = await isJwtExpired(state.sessionToken)

        if (isSessionExpired) {
          clearSessionToken()
        }

        if (isMounted()) {
          setState({
            ...state,
            isAuthenticated: true,
            isLoading: false,
          })
        }
      })()

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
      <Context.Provider value={providerValue}>
        {/* eslint-disable-next-line react/jsx-props-no-spreading */}
        <Component {...pageProps} />
      </Context.Provider>
    )
  }
}
