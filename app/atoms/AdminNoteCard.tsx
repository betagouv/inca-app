import styled from 'styled-components'

import Card from './Card'

export const AdminNoteCard = styled(Card)`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  margin-bottom: 0;

  > div {
    display: flex;
    flex-grow: 1;

    .Textarea {
      flex-grow: 1;
      resize: none;
      overflow-y: scroll;

      ::-webkit-scrollbar {
        -webkit-appearance: none;
      }
      ::-webkit-scrollbar:vertical {
        width: 0.5rem;
      }
      ::-webkit-scrollbar-thumb {
        border: 0;
        background-color: ${p => p.theme.color.secondary.default};
      }
      ::-webkit-scrollbar-track {
        background-color: ${p => p.theme.color.secondary.background};
        border-bottom-right-radius: 0.25rem;
        border-top-right-radius: 0.25rem;
      }
    }
  }
`
