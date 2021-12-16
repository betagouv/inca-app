import { useMemo } from 'react'

import handleError from '../../helpers/handleError'
import isJwtExpired from '../../helpers/isJwtExpired'
import useAuth from '../../hooks/useAuth'
import api from '../../libs/api'
import Context from './Context'

export default function withApi(Component) {
  return function WithApi(pageProps) {
    const { refreshSessionToken, state: authState } = useAuth()

    const { sessionToken } = authState
    if (sessionToken !== null) {
      api.updateAuthorizationBearer(sessionToken)
    }

    const handleApiError = async (err, method, path, options) => {
      if (err?.response === undefined) {
        handleError(err, `components/hocs/WithApi#${method}()`)

        return null
      }

      if (err.response.status === 401 && authState.isAuthenticated) {
        if (authState.sessionToken === null) {
          return null
        }

        const isSessionTokenExpired = await isJwtExpired(authState.sessionToken)
        if (!isSessionTokenExpired) {
          return null
        }

        const sessionToken = await refreshSessionToken()
        if (sessionToken === null) {
          return null
        }

        api.updateAuthorizationBearer(sessionToken)
        const body = await api.ky[method](path, options).json()

        return body
      }

      const body = await err.response.json()

      return body
    }

    const get = async path => {
      try {
        const body = await api.ky.get(path).json()

        return body
      } catch (err) {
        return handleApiError(err, 'get', path)
      }
    }

    const post = async (path, data) => {
      const options = {
        json: data,
      }

      try {
        const body = await api.ky.post(path, options).json()

        return body
      } catch (err) {
        return handleApiError(err, 'post', path)
      }
    }

    const patch = async (path, data) => {
      const options = {
        json: data,
      }

      try {
        const body = await api.ky.patch(path, options).json()

        return body
      } catch (err) {
        return handleApiError(err, 'patch', path)
      }
    }

    // eslint-disable-next-line no-underscore-dangle
    const _delete = async path => {
      const request = api.ky.delete(path)

      try {
        const body = await request.json()

        return body
      } catch (err) {
        return handleApiError(err, 'delete', path)
      }
    }

    const providerValue = useMemo(
      () => ({
        delete: _delete,
        get,
        patch,
        post,
      }),

      // eslint-disable-next-line react-hooks/exhaustive-deps
      [authState],
    )

    return (
      <Context.Provider value={providerValue}>
        {/* eslint-disable-next-line react/jsx-props-no-spreading */}
        <Component {...pageProps} />
      </Context.Provider>
    )
  }
}
