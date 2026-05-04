import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { ThemeProvider } from './components/theme-provider'
import { ThemeToggle } from './components/theme-toggle'
import Home from './pages/Home'
import Projects from './pages/Projects'
import Project from './pages/Project'

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="orthfx-theme">
      <BrowserRouter>
        <div className="min-h-screen">
          <header className="border-b">
            <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
              <Link to="/" className="text-xl font-bold">orthfx</Link>
              <div className="flex items-center gap-6">
                <Link to="/projects" className="hover:underline">Projects</Link>
                <a href="https://github.com/orthfx" target="_blank" rel="noopener noreferrer" className="hover:underline">
                  GitHub
                </a>
                <ThemeToggle />
              </div>
            </nav>
          </header>
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/projects/:slug" element={<Project />} />
            </Routes>
          </main>
          <footer className="border-t mt-16">
            <div className="container mx-auto px-4 py-6 text-sm text-muted-foreground">
              <div className="flex justify-between items-center">
                <span>{new Date().getFullYear()} © orthfx</span>
              </div>
            </div>
          </footer>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
