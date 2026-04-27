import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Footer from '../../components/layouts/Footer'
import maraleste1 from '../../assets/maraleste1.jpg'
import maraleste2 from '../../assets/maraleste2.jpg'
import maraleste3 from '../../assets/maraleste3.jpg'
import maraleste4 from '../../assets/maraleste4.jpg'
import maraleste5 from '../../assets/maraleste5.jpg'
import maraleste6 from '../../assets/maraleste6.webp'
import maraleste7 from '../../assets/maraleste7.jpg'
import maraleste8 from '../../assets/maraleste8.jpg'
import homeSharedStyles from './HomeSharedStyles'
import homePageStyles from './HomePageStyles'

function Home() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0)
  const [currentGallerySlide, setCurrentGallerySlide] = useState(0)
  const [currentMaterialSlide, setCurrentMaterialSlide] = useState(0)

  const navItems = useMemo(
    () => [
      { label: 'Estudios', href: '/about' },
      { label: 'Talleres', href: '/workshops' },
      { label: 'Cursos', href: '/courses' },
      { label: 'Obras', href: '/works' },
    ],
    []
  )

  const heroSlides = useMemo(
    () => [
      { image: maraleste1, caption: 'Serie Raíces 2025' },
      { image: maraleste2, caption: 'Ensayos botánicos' },
      { image: maraleste3, caption: 'Colección inmersiva' },
    ],
    []
  )

  const gallerySlides = useMemo(
    () => [maraleste1, maraleste3, maraleste4, maraleste5],
    []
  )

  const materialSlides = useMemo(
    () => [maraleste6, maraleste7, maraleste8],
    []
  )

  const studioHighlights = useMemo(
    () => [
      { label: 'Artistas activos', value: '+6K' },
      { label: 'Mentorías al año', value: '420' },
      { label: 'Países presentes', value: '18' },
    ],
    []
  )

  const differentiators = useMemo(
    () => [
      {
        title: 'Laboratorio de materiales',
        description: 'Investigamos pigmentos botánicos, fibras recicladas y técnicas de preservación orgánica que amplían los límites de la instalación contemporánea.',
      },
      {
        title: 'Narrativas inmersivas',
        description: 'Diseñamos experiencias site-specific que vinculan sonido, luz y movimiento para reforzar la sensibilidad de cada obra.',
      },
      {
        title: 'Estrategia de colección',
        description: 'Acompañamos a coleccionistas y marcas en la curaduría de piezas únicas que conecten con su identidad y públicos.',
      },
    ],
    []
  )

  const programTracks = useMemo(
    () => [
      {
        title: 'Residencia Creativa',
        description: 'Programa intensivo de 12 semanas con mentorías 1:1 y acceso a workshops privados.',
      },
      {
        title: 'Diploma en Arte Botánico',
        description: 'Currícula certificada por Maraleste con módulos híbridos y revisión de portfolio.',
      },
      {
        title: 'Clínica de proyectos',
        description: 'Sesiones tácticas para equipos creativos que buscan lanzar exhibiciones o colaboraciones estratégicas.',
      },
    ],
    []
  )

  const processSteps = useMemo(
    () => [
      {
        title: 'Diagnóstico',
        description: 'Alineamos objetivos curatoriales, presupuesto y calendario de producción.',
      },
      {
        title: 'Co-creación',
        description: 'Desarrollamos moodboards materiales, prototipos y narrativas sensoriales.',
      },
      {
        title: 'Implementación',
        description: 'Gestionamos montaje, logística internacional y activaciones complementarias.',
      },
    ],
    []
  )

  const contactChannels = useMemo(
    () => [
      {
        label: 'Escríbenos',
        value: 'hola@maraleste.com',
      },
      {
        label: 'Oficina',
        value: 'Palermo · Buenos Aires',
      },
      {
        label: 'Agenda virtual',
        value: 'Lunes a viernes · 09:00 a 18:00 (GMT-3)',
      },
    ],
    []
  )

  useEffect(() => {
    if (!heroSlides.length) {
      return
    }
    const interval = setInterval(() => {
      setCurrentHeroSlide((prev) => (prev + 1) % heroSlides.length)
    }, 6000)
    return () => clearInterval(interval)
  }, [heroSlides])

  useEffect(() => {
    if (!gallerySlides.length) {
      return
    }
    const interval = setInterval(() => {
      setCurrentGallerySlide((prev) => (prev + 1) % gallerySlides.length)
    }, 7000)
    return () => clearInterval(interval)
  }, [gallerySlides])

  useEffect(() => {
    if (!materialSlides.length) {
      return
    }
    const interval = setInterval(() => {
      setCurrentMaterialSlide((prev) => (prev + 1) % materialSlides.length)
    }, 8000)
    return () => clearInterval(interval)
  }, [materialSlides])

  return (
    <div className="hm-root bg-gradient-to-br from-[#f6f6f3] via-[#eceae4] to-[#fafafa] text-[#111] min-h-screen selection:bg-gray-200/70">
      <style>{homeSharedStyles + homePageStyles}</style>
      <header className="hm-header border-b border-black/5 sticky top-0 bg-white/70 backdrop-blur-xl z-50">
        <div className="hm-shell max-w-7xl mx-auto px-6 lg:px-12 py-5 flex items-center justify-between">
          <div className="hm-brand text-xl lg:text-2xl font-light tracking-[0.4em] text-black">MARALESTE</div>
          <nav className="hidden md:flex items-center gap-8 text-[11px] uppercase tracking-[0.4em] text-gray-500">
            {navItems.map(({ label, href }) => (
              <a key={label} href={href} className="hover:text-black transition font-medium">
                {label}
              </a>
            ))}
          </nav>
          <div className="hidden md:flex items-center gap-6 text-[11px] uppercase tracking-[0.4em] font-medium">
            <Link to="/login" className="hm-link text-black/70 hover:text-black transition">Iniciar sesión</Link>
            <Link to="/register" className="hm-link text-black hover:underline underline-offset-4">Crear cuenta</Link>
          </div>
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="md:hidden text-sm font-medium uppercase tracking-[0.3em] text-black"
          >
            {menuOpen ? 'Cerrar' : 'Menú'}
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden border-t border-black/5 bg-white/90 px-6 py-6 space-y-6 text-[11px] uppercase tracking-[0.3em] text-gray-600">
            {navItems.map(({ label, href }) => (
              <a key={label} href={href} className="block hover:text-black transition" onClick={() => setMenuOpen(false)}>
                {label}
              </a>
            ))}
            <Link to="/login" className="block hover:text-black transition" onClick={() => setMenuOpen(false)}>
              Iniciar sesión
            </Link>
            <Link to="/register" className="block hover:text-black transition" onClick={() => setMenuOpen(false)}>
              Crear cuenta
            </Link>
          </div>
        )}
      </header>

      <main>
        <section className="relative px-6 lg:px-12 py-16 lg:py-28">
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-white/80 via-white/40 to-transparent blur-3xl" />
            <div className="absolute top-32 left-10 h-48 w-48 rounded-full bg-black/5 blur-3xl" />
          </div>
          <div className="max-w-7xl mx-auto grid gap-12 lg:grid-cols-[1.1fr_0.9fr] items-center">
            <div className="space-y-10">
              <div className="space-y-5">
                <span className="text-[10px] uppercase tracking-[0.5em] text-gray-500">Estudio transdisciplinar</span>
                <h1 className="hm-title text-4xl lg:text-5xl xl:text-6xl font-light tracking-tight text-black leading-tight">
                  Arte botánico contemporáneo que conecta marcas, colecciones y comunidades.
                </h1>
                <p className="text-base lg:text-lg text-gray-600 leading-relaxed max-w-xl">
                  Creamos instalaciones, experiencias educativas y residencias artísticas que fusionan investigación material, tecnología y narrativa sensorial.
                </p>
              </div>
              <div className="flex flex-wrap gap-4">
                <Link to="/courses" className="hm-btn hm-btn--solid inline-flex items-center justify-center rounded-xl bg-black px-8 py-3 text-[11px] uppercase tracking-[0.3em] text-white hover:bg-gray-900 transition">
                  Explorar programas
                </Link>
                <a href="#contacto" className="hm-btn hm-btn--ghost inline-flex items-center justify-center rounded-xl border border-black px-8 py-3 text-[11px] uppercase tracking-[0.3em] text-black hover:bg-black hover:text-white transition">
                  Solicitar agenda
                </a>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                {studioHighlights.map(({ label, value }) => (
                  <article key={label} className="hm-card rounded-2xl border border-black/10 bg-white/70 backdrop-blur-sm px-5 py-6 shadow-sm shadow-black/5">
                    <p className="text-sm uppercase tracking-[0.3em] text-gray-400 mb-2">{label}</p>
                    <p className="text-3xl font-light text-black">{value}</p>
                  </article>
                ))}
              </div>
            </div>
            <div className="hm-hero-card relative h-[420px] w-full overflow-hidden rounded-3xl border border-black/10 bg-black/5 shadow-xl shadow-black/10">
              {heroSlides.map(({ image, caption }, index) => (
                <figure
                  key={caption}
                  className={`absolute inset-0 transition-opacity duration-700 ease-out ${
                    index === currentHeroSlide ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <img src={image} alt={caption} className="h-full w-full object-cover" />
                  <figcaption className="absolute bottom-6 left-6 rounded-full bg-white/80 px-4 py-2 text-xs uppercase tracking-[0.3em] text-black">
                    {caption}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        <section id="estudio" className="border-t border-black/5 bg-white/70 px-6 lg:px-12 py-20">
          <div className="max-w-7xl mx-auto grid gap-12 lg:grid-cols-[0.9fr_1.1fr] items-center">
            <div className="space-y-6">
              <span className="text-[10px] uppercase tracking-[0.5em] text-gray-500">Manifiesto</span>
              <h2 className="text-3xl lg:text-4xl font-light text-black">Narrativas que emergen desde la botánica y la memoria.</h2>
              <p className="text-base text-gray-600 leading-relaxed">
                Maraleste opera como colectivo creativo especializado en investigación de color, preservación orgánica y storytelling inmersivo. Cada proyecto combina arte vivo, documentación audiovisual y experiencias formativas para extender el impacto más allá de la exhibición.
              </p>
              <Link to="/about" className="inline-flex items-center text-[11px] uppercase tracking-[0.3em] font-medium text-black hover:underline underline-offset-4">
                Conoce al estudio
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-3">
              {differentiators.map(({ title, description }) => (
                <article key={title} className="rounded-2xl border border-black/10 bg-white px-5 py-6 shadow-sm shadow-black/5">
                  <h3 className="text-lg font-medium text-black mb-3">{title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="galeria" className="border-t border-black/5 px-6 lg:px-12 py-20">
          <div className="max-w-7xl mx-auto space-y-12">
            <header className="space-y-4 text-center">
              <span className="text-[10px] uppercase tracking-[0.5em] text-gray-500">Colecciones recientes</span>
              <h2 className="text-3xl lg:text-4xl font-light text-black">Obras que dialogan con la naturaleza y el espacio urbano.</h2>
            </header>
            <div className="relative h-[520px] overflow-hidden rounded-3xl border border-black/10 bg-black/5 shadow-xl shadow-black/10">
              {gallerySlides.map((image, index) => (
                <div
                  key={image}
                  className={`absolute inset-0 transition-all duration-700 ease-out ${
                    index === currentGallerySlide ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                  }`}
                >
                  <img src={image} alt={`Obra ${index + 1}`} className="h-full w-full object-cover" />
                </div>
              ))}
              <button
                type="button"
                onClick={() =>
                  setCurrentGallerySlide((prev) =>
                    (prev - 1 + gallerySlides.length) % gallerySlides.length
                  )
                }
                className="absolute left-6 top-1/2 -translate-y-1/2 rounded-full border border-white/30 bg-white/60 px-4 py-2 text-xs uppercase tracking-[0.3em] text-black transition hover:bg-white"
              >
                Anterior
              </button>
              <button
                type="button"
                onClick={() =>
                  setCurrentGallerySlide((prev) => (prev + 1) % gallerySlides.length)
                }
                className="absolute right-6 top-1/2 -translate-y-1/2 rounded-full border border-white/30 bg-white/60 px-4 py-2 text-xs uppercase tracking-[0.3em] text-black transition hover:bg-white"
              >
                Siguiente
              </button>
              <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
                {gallerySlides.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setCurrentGallerySlide(index)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === currentGallerySlide ? 'w-8 bg-white' : 'w-2 bg-white/60'
                    }`}
                  />
                ))}
              </div>
            </div>
            <div className="grid gap-6 sm:grid-cols-3">
              {programTracks.map(({ title, description }) => (
                <article key={title} className="hm-card rounded-2xl border border-black/10 bg-white px-5 py-6 shadow-sm shadow-black/5">
                  <h3 className="text-lg font-medium text-black mb-3">{title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
                  <Link to="/courses" className="hm-link mt-4 inline-flex text-[10px] uppercase tracking-[0.3em] font-medium text-black hover:underline underline-offset-4">
                    Conocer más
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="materiales" className="border-t border-black/5 bg-[#101010] text-white px-6 lg:px-12 py-20">
          <div className="max-w-7xl mx-auto grid gap-12 lg:grid-cols-[1.05fr_0.95fr] items-center">
            <div className="space-y-6">
              <span className="text-[10px] uppercase tracking-[0.5em] text-gray-400">Innovación sustentable</span>
              <h2 className="text-3xl lg:text-4xl font-light text-white">Materiales desarrollados in-house para instalaciones efímeras y piezas coleccionables.</h2>
              <p className="text-base text-gray-400 leading-relaxed">
                Nuestros procesos combinan bio-resinas, impresión 3D y prensado botánico. Cada material se somete a pruebas de durabilidad, iluminación y montaje para asegurar excelencia en museos, vitrinas retail o residencias privadas.
              </p>
              <div className="grid gap-4 sm:grid-cols-3 text-sm text-gray-300">
                {processSteps.map(({ title, description }) => (
                  <article key={title} className="rounded-2xl border border-white/10 bg-white/5 px-5 py-6">
                    <h3 className="text-white font-medium mb-2">{title}</h3>
                    <p className="text-gray-300 leading-relaxed">{description}</p>
                  </article>
                ))}
              </div>
            </div>
            <div className="relative h-[420px] w-full overflow-hidden rounded-3xl border border-white/10 bg-white/5">
              {materialSlides.map((image, index) => (
                <div
                  key={image}
                  className={`absolute inset-0 transition-opacity duration-700 ease-out ${
                    index === currentMaterialSlide ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <img src={image} alt={`Material ${index + 1}`} className="h-full w-full object-cover" />
                </div>
              ))}
              <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
                {materialSlides.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setCurrentMaterialSlide(index)}
                    className={`h-2 w-2 rounded-full border border-white/60 transition ${
                      index === currentMaterialSlide ? 'bg-white' : 'bg-transparent'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="contacto" className="border-t border-black/5 px-6 lg:px-12 py-24">
          <div className="max-w-5xl mx-auto text-center space-y-10">
            <span className="text-[10px] uppercase tracking-[0.5em] text-gray-500">Colaboremos</span>
            <h2 className="text-3xl lg:text-4xl font-light text-black">Diseñemos juntos la próxima intervención que marque a tu audiencia.</h2>
            <p className="text-base text-gray-600 leading-relaxed max-w-3xl mx-auto">
              En Maraleste atendemos proyectos corporativos, residenciales y culturales. Escríbenos para coordinar una llamada exploratoria o recibir un dossier personalizado con casos relevantes para tu industria.
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              {contactChannels.map(({ label, value }) => (
                <article key={label} className="hm-card rounded-2xl border border-black/10 bg-white px-5 py-6 shadow-sm shadow-black/5">
                  <p className="text-[10px] uppercase tracking-[0.4em] text-gray-500 mb-3">{label}</p>
                  <p className="text-sm text-black/80 leading-relaxed">{value}</p>
                </article>
              ))}
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="mailto:hola@maraleste.com" className="hm-btn hm-btn--solid inline-flex items-center justify-center rounded-xl bg-black px-8 py-3 text-[11px] uppercase tracking-[0.3em] text-white hover:bg-gray-900 transition">
                Enviar correo
              </a>
              <a href="/contact" className="hm-btn hm-btn--ghost inline-flex items-center justify-center rounded-xl border border-black px-8 py-3 text-[11px] uppercase tracking-[0.3em] text-black hover:bg-black hover:text-white transition">
                Reservar reunión
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default Home