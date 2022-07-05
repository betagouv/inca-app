import { ToastContainer } from 'react-toastify'
import styled from 'styled-components'

function AdminHeaderAtom({ children }) {
  return (
    <>
      {children}
      <ToastContainer />
    </>
  )
}

const AdminHeader = styled(AdminHeaderAtom)`
  align-items: center;
  display: flex;
  justify-content: space-between;
  height: 2.5rem;
  margin-bottom: 1.5rem;

  h1 {
    line-height: 1;
  }
`

export default AdminHeader
