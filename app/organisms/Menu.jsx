import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BeatLoader } from 'react-spinners'
import styled from 'styled-components'

import { ROLE } from '../../common/constants'
import SyncButton from '../atoms/SyncButton'
import useApi from '../hooks/useApi'
import useAuth from '../hooks/useAuth'

const Container = styled.div`
  background-color: #293042;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 16rem;
`

const Brand = styled.div`
  align-items: center;
  color: white;
  display: flex;
  height: 4rem;
  font-size: 1.25rem;
  justify-content: center;
  position: relative;
  text-transform: uppercase;

  &:before {
    background-color: rgba(255, 255, 255, 0.3);
    bottom: 0;
    content: ' ';
    height: 1px;
    left: 1rem;
    position: absolute;
    width: calc(100% - 2rem);
  }
`

const List = styled.div`
  display: flex;
  flex-direction: column;
  padding-top: 0.5rem;

  > a {
    color: white;
    display: block;
    opacity: 0.75;
    padding: 0.5rem 1rem;
    text-decoration: none;

    :hover {
      opacity: 1;
    }
  }
`

export default function Menu() {
  const [isSynchronizing, setIsSynchronizing] = useState(false)
  const { user } = useAuth()

  const api = useApi()

  const synchronizePipedrive = async () => {
    setIsSynchronizing(true)

    await api.get('pipedrive/synchronize')

    setIsSynchronizing(false)
  }

  return (
    <Container>
      <div>
        <Brand>Lab Agora</Brand>

        <List>
          <Link to="/">Mise en relation</Link>

          <Link to="/projects">Projets</Link>
          <Link to="/organizations">Organisations</Link>
          <Link to="/leads">Porteurs</Link>
          <Link to="/contributors">Contributeurs</Link>

          {user.role === ROLE.ADMINISTRATOR && <Link to="/users">Utilisateurs</Link>}
        </List>
      </div>

      <SyncButton onClick={synchronizePipedrive}>
        {isSynchronizing ? <BeatLoader size={12} /> : 'Synchroniser'}
      </SyncButton>
    </Container>
  )
}
