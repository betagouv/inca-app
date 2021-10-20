import { Tasker } from '@ivangabriele/singularity'
import PropTypes from 'prop-types'
import { HelpCircle, Send, Star, UserCheck } from 'react-feather'
import styled from 'styled-components'

import { PROJECT_CONTRIBUTOR_STATE } from '../../common/constants'

const Box = styled(Tasker.Task)`
  background-color: ${p => p.theme.color.success.background};
  border-radius: ${p => p.theme.appearance.borderRadius.large};
  border: 0;
  cursor: pointer;
  padding: 0 0 0.25rem 0;

  :hover {
    box-shadow: 0 0 0 1px ${p => p.theme.color.success.default};
  }
`

const Title = styled.h3`
  background-color: ${p => p.theme.color.success.default};
  border-radius: ${p => p.theme.appearance.borderRadius.large} ${p => p.theme.appearance.borderRadius.large} 0 0;
  color: ${p => p.theme.color.body.white};
  font-size: 110%;
  font-weight: 500;
  overflow: hidden;
  padding: 0.25rem 0.5rem calc(0.25rem + 2px);
  text-overflow: ellipsis;
  white-space: nowrap;
`

const Lead = styled.p`
  font-size: 110%;
  font-weight: 500;
  overflow: hidden;
  padding: 0.5rem;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const Contributor = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  padding: 0 0.5rem 0.25rem;

  > svg {
    height: 1rem;
    margin-top: 1px;
    width: 1rem;
  }

  > span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`
const NoContributor = styled(Contributor)`
  opacity: 0.65;
`

export default function ProjectCard({ contributors, lead, name, onClick }) {
  return (
    <Box onClick={onClick}>
      <Title>{name}</Title>
      <Lead>
        {lead.firstName} {lead.lastName}
      </Lead>
      {contributors.length === 0 && (
        <NoContributor>
          <span>Aucun·e contributeur·rice.</span>
        </NoContributor>
      )}
      {contributors.length > 0 &&
        contributors
          .filter(({ state }) => state !== PROJECT_CONTRIBUTOR_STATE.REFUSED)
          .map(({ contributor, state }, index) => (
            <Contributor key={String(index)}>
              {state === PROJECT_CONTRIBUTOR_STATE.ASSIGNED && <HelpCircle />}
              {state === PROJECT_CONTRIBUTOR_STATE.CONTACTED && <Send />}
              {state === PROJECT_CONTRIBUTOR_STATE.VALIDATED && <UserCheck />}
              {state === PROJECT_CONTRIBUTOR_STATE.SUCCESSFUL && <Star />}

              <span>
                {contributor.firstName} {contributor.lastName}
              </span>
            </Contributor>
          ))}
    </Box>
  )
}

ProjectCard.propTypes = {
  contributors: PropTypes.arrayOf(
    PropTypes.shape({
      contributors: PropTypes.shape({
        firstName: PropTypes.string.isRequired,
        lastName: PropTypes.string.isRequired,
      }),
    }),
  ).isRequired,
  lead: PropTypes.shape({
    firstName: PropTypes.string.isRequired,
    lastName: PropTypes.string.isRequired,
  }).isRequired,
  name: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
}
