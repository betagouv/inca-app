import { Button } from '@singularity-ui/core'
import styled from 'styled-components'

const StyledButton = styled(Button)`
  border-radius: 0;
  line-height: 1.75rem;

  > span {
    display: block;
    height: 1.75rem;
  }
`

// eslint-disable-next-line react/jsx-props-no-spreading
const SyncButton = props => <StyledButton accent="warning" size="large" {...props} />

export default SyncButton
