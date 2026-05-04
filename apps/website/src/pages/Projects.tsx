import { Link } from 'react-router-dom'
import { projects } from '../content/projects'

export default function Projects() {
  return (
    <div className="max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Projects</h1>
      <p className="text-lg text-muted-foreground mb-12">
        Here are the open-source projects developed by orthfx:
      </p>

      <div className="space-y-12">
        {projects.map((project) => (
          <article key={project.slug} className="border-b pb-12 last:border-0">
            <Link to={`/projects/${project.slug}`}>
              <h2 className="text-2xl font-semibold mb-3 hover:underline">{project.name}</h2>
            </Link>
            <p className="text-muted-foreground mb-4">{project.description}</p>

            <div className="mb-4">
              <h3 className="font-semibold mb-2">Key Features:</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                {project.features.map((feature, i) => (
                  <li key={i}>{feature}</li>
                ))}
              </ul>
            </div>

            <div className="flex gap-4">
              <Link
                to={`/projects/${project.slug}`}
                className="inline-flex items-center text-primary hover:underline"
              >
                Learn more →
              </Link>
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-primary hover:underline"
              >
                GitHub →
              </a>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
