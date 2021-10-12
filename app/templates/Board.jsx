import { Tasker } from '@ivangabriele/singularity'

const Project = () => <Tasker.Task>123</Tasker.Task>

export default function Board() {
  return (
    <>
      <h2>Board</h2>

      <Tasker
        data={[
          { label: 'Upcoming', tasks: [Project, Project] },
          { label: 'In Progress', tasks: [Project] },
          { label: 'Completed', tasks: [Project] },
        ]}
      />
    </>
  )
}
