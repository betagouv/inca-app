import { HTTPError } from 'ky'
import * as R from 'ramda'
import { useEffect, useMemo, useState } from 'react'

import getJwtPayload from '../../helpers/getJwtPayload'
import handleError from '../../helpers/handleError'
import isJwtExpired from '../../helpers/isJwtExpired'
import useIsMounted from '../../hooks/useIsMounted'
import api from '../../libs/api'
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
  const maybeUserJson = window.localStorage.getItem('user')
  const maybeUser = maybeUserJson !== null ? JSON.parse(maybeUserJson) : null

  return maybeUser
}

export default function withAuth(Component) {
  return function WithAuth(pageProps) {
    const [state, setState] = useState(getInitialState())
    const [user, setUser] = useState(getInitialUser())
    const isMounted = useIsMounted()

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

    const logIn = async (sessionToken, refreshToken = null) => {
      const sessionTokenPayload = await getJwtPayload(sessionToken)
      if (sessionTokenPayload === null) {
        return
      }

      const user = R.pick(['id', 'email', 'role'])(sessionTokenPayload)
      const userJson = JSON.stringify(user)

      if (refreshToken !== null) {
        window.localStorage.setItem('refreshToken', refreshToken)
      }
      window.localStorage.setItem('sessionToken', sessionToken)
      window.localStorage.setItem('user', userJson)

      if (isMounted()) {
        setUser(user)
        setState({
          ...state,
          isAuthenticated: true,
          refreshToken,
          sessionToken,
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

    const refreshSessionToken = async () => {
      try {
        if (state.refreshToken === null) {
          return null
        }

        const body = await api.ky
          .post('auth/refresh', {
            json: {
              refreshToken: state.refreshToken,
            },
          })
          .json()
        if (body === null || body.hasError) {
          return null
        }

        const { sessionToken } = body.data

        window.localStorage.setItem('sessionToken', sessionToken)

        if (isMounted()) {
          setState({
            ...state,
            sessionToken,
          })
        }

        return sessionToken
      } catch (err) {
        if (err instanceof HTTPError) {
          clearSessionToken()
        } else {
          handleError(err, 'app/hocs/withAuth#refreshSessionToken()')
        }

        return null
      }
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
        if (state.sessionToken === null) {
          return
        }

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

    const providerValue = useMemo(
      () => ({
        clearSessionToken,
        logIn,
        logOut,
        refreshSessionToken,
        state,
        user,
      }),

      // eslint-disable-next-line react-hooks/exhaustive-deps
      [state, user],
    )

    return (
      <Context.Provider value={providerValue}>
        {/* eslint-disable-next-line react/jsx-props-no-spreading */}
        <Component {...pageProps} />
      </Context.Provider>
    )
  }
}
