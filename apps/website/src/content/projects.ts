export interface Project {
  slug: string
  name: string
  description: string
  features: string[]
  github: string
  live?: string
  content: string
}

// Import all markdown files from the projects directory
const projectFiles = import.meta.glob<{ attributes: any; markdown: string }>('./projects/*.md', { eager: true })

export const projects: Project[] = Object.entries(projectFiles).map(([filepath, module]) => {
  const slug = filepath.replace('./projects/', '').replace('.md', '')
  const { attributes, markdown } = module

  console.log('Project module:', filepath, module)

  return {
    slug,
    name: attributes.name,
    description: attributes.description,
    features: attributes.features || [],
    github: attributes.github,
    live: attributes.live,
    content: markdown || ''
  }
})
