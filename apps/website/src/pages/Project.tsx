import { useParams, Link, Navigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import { projects } from '../content/projects'

export default function Project() {
  const { slug } = useParams()
  const project = projects.find(p => p.slug === slug)

  if (!project) {
    return <Navigate to="/projects" replace />
  }

  return (
    <div className="max-w-3xl">
      <Link to="/projects" className="text-primary hover:underline mb-4 inline-block">
        ← Back to projects
      </Link>

      <article>
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-3">{project.name}</h1>
          <p className="text-lg text-muted-foreground mb-4">{project.description}</p>
          <a
            href={project.github}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-primary hover:underline"
          >
            View on GitHub →
          </a>
        </header>

        <div className="prose">
          <ReactMarkdown>{project.content}</ReactMarkdown>
        </div>
      </article>
    </div>
  )
}
