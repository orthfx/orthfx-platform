export default function Home() {
  return (
    <div className="max-w-3xl">
      <h1 className="text-4xl font-bold mb-6">orthfx</h1>
      <div className="prose dark:prose-invert">
        <p className="text-lg mb-4">
          orthfx is an organization dedicated to building Orthodox Christian digital tools and resources.
          We develop open-source applications that help people engage with scripture, prayer, and Orthodox Christian content.
        </p>
        <p className="text-lg">
          Our projects range from Bible reading apps and Discord bots to multi-tenant platforms and subscription services,
          all built with modern web technologies like Next.js, React, and TypeScript.
        </p>
      </div>
      <div className="mt-8 pt-8 border-t">
        <h2 className="text-xl font-semibold mb-3">Contact</h2>
        <ul className="space-y-2">
          <li>
            GitHub:{' '}
            <a href="https://github.com/orthfx" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
              orthfx
            </a>
          </li>
          <li>
            Email:{' '}
            <a href="mailto:orthofox@proton.me" className="text-primary hover:underline">
              orthofox@proton.me
            </a>
          </li>
        </ul>
      </div>
    </div>
  )
}
