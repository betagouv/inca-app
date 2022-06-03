import { Outlet } from 'react-router-dom'
import styled from 'styled-components'

const Box = styled.div`
  display: flex;
  flex-direction: column;
  padding: 1rem 0;
`

export default function Layout() {
  return (
    <Box>
      <Outlet />
    </Box>
  )
}
