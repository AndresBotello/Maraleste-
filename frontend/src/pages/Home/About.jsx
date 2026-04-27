import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../../components/layouts/Footer';
import homeSharedStyles from './HomeSharedStyles';
import aboutStyles from './AboutStyles';

const About = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="ab-root bg-[#f2f2f0] text-[#1a1a1a] min-h-screen selection:bg-gray-200 selection:text-black">
      <style>{homeSharedStyles + aboutStyles}</style>
      {/* Navigation - Mejorado con mejor spacing y transiciones */}
      <header className="ab-header border-b border-black/5 sticky top-0 bg-white/70 backdrop-blur-xl z-50">
        <div className="ab-shell max-w-7xl mx-auto px-6 lg:px-12 py-5 flex items-center justify-between">
          <Link to="/" className="ab-brand ab-link text-xl lg:text-2xl font-light tracking-[0.4em] text-black hover:text-gray-700 transition">
            MARALESTE
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-[11px] uppercase tracking-[0.4em] text-gray-500">
            <Link to="/about" className="hover:text-black transition font-medium">Estudios</Link>
            <Link to="/workshops" className="hover:text-black transition font-medium">Talleres</Link>
            <Link to="/courses" className="hover:text-black transition font-medium">Cursos</Link>
            <Link to="/works" className="hover:text-black transition font-medium">Obras</Link>
          </nav>
          <div className="hidden md:flex items-center gap-6 text-[11px] uppercase tracking-[0.4em] font-medium">
            <Link to="/" className="ab-link text-black/70 hover:text-black transition">Volver al inicio</Link>
            <Link to="/login" className="ab-link text-black hover:underline underline-offset-4">Iniciar sesión</Link>
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
            <Link to="/about" className="block hover:text-black transition" onClick={() => setMenuOpen(false)}>Estudios</Link>
            <Link to="/workshops" className="block hover:text-black transition" onClick={() => setMenuOpen(false)}>Talleres</Link>
            <Link to="/courses" className="block hover:text-black transition" onClick={() => setMenuOpen(false)}>Cursos</Link>
            <Link to="/works" className="block hover:text-black transition" onClick={() => setMenuOpen(false)}>Obras</Link>
            <Link to="/" className="block hover:text-black transition" onClick={() => setMenuOpen(false)}>Volver al inicio</Link>
            <Link to="/login" className="block hover:text-black transition" onClick={() => setMenuOpen(false)}>Iniciar sesión</Link>
          </div>
        )}
      </header>

      {/* Hero Section - Mejorado con mejor tipografía y espaciado */}
      <section className="ab-shell max-w-7xl mx-auto px-8 py-28 md:py-36 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="ab-title text-5xl md:text-7xl font-light mb-8 leading-[1.05] tracking-tight text-black">
            Lorena Gullo Mercado
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 font-light mb-6 tracking-wide">
            Artista Visual
          </p>
          <p className="text-lg text-gray-500 font-light tracking-wide">
            Vive y trabaja en Barranquilla, Colombia
          </p>
        </div>
      </section>

      {/* Proceso Creativo - Mejorado con mejor jerarquía y diseño */}
      <section className="border-t border-black/10 bg-[#ecece9]/50">
        <div className="ab-shell max-w-7xl mx-auto px-8 py-36">
          <div className="max-w-4xl mx-auto">
            <div className="mb-12">
              <h2 className="text-[11px] tracking-[0.3em] uppercase text-gray-500 mb-4 font-semibold text-center">Filosofía</h2>
              <div className="w-24 h-0.5 bg-black/10 mx-auto mb-8"></div>
              <h3 className="text-4xl md:text-5xl font-light mb-16 text-black text-center tracking-tight leading-[1.1]">
                Proceso Creativo
              </h3>
            </div>
            
            <div className="space-y-10 text-gray-700 leading-relaxed">
              <p className="text-lg font-light">
                Uno de mis procesos creativos más relevantes es el que realizo con las <em className="text-black font-normal italic">hojas de los árboles</em>, 
                la estética de éstas piezas denotan una belleza que atrae al espectador para luego develar 
                cuestionamientos acerca de la vida y la muerte, el tiempo y la memoria, el deseo de capturar una 
                etapa de la vida, el alma o espíritu de las cosas.
              </p>
              
              <div className="relative">
                <p className="text-lg font-light border-l-2 border-black/10 pl-8 italic bg-[#f9f9f8]/80 p-6 rounded-lg">
                  El dibujar sobre las hojas para luego dejar que las condiciones de lo orgánico lo transformen, 
                  habla de lo que puedo y de lo que no puedo controlar; el producto es una <em className="text-black font-normal not-italic">co-creación con la naturaleza</em> 
                  en la que el hecho de que el dibujo pase de una superficie a otra como si de un acto de magia se tratase 
                  me produce cierta fascinación, placer y expectativa por el resultado.
                </p>
              </div>
              
              <p className="text-lg font-light">
                Como resolución plástica de mis ideas utilizo desde el <em className="text-black font-normal italic">dibujo, la instalación, el objeto escultórico y 
                el arte participativo</em> todo ello con el objetivo de ejecutar la modalidad más acorde a la idea. La 
                experimentación con materiales y el contraste de significados son unos de los motores que 
                estimulan mi creatividad.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Yo natural, El Florímetro - Mejorado con mejor presentación de imagen */}
      <section className="border-t border-black/10">
        <div className="ab-shell max-w-7xl mx-auto px-8 py-36">
          <div className="max-w-4xl mx-auto">
            <div className="mb-12">
              <h2 className="text-[11px] tracking-[0.3em] uppercase text-gray-500 mb-4 font-semibold text-center">Obra Destacada</h2>
              <div className="w-24 h-0.5 bg-black/10 mx-auto mb-8"></div>
              <h3 className="text-4xl md:text-5xl font-light mb-10 text-black text-center tracking-tight leading-[1.1]">
                Yo natural, El Florímetro
              </h3>
            </div>
            
            <div className="text-center mb-16">
              <p className="text-lg text-gray-600 font-light italic mb-3">Taller de Arte Participativo en el marco del Laboratorio Mujeres Surcando Memorias</p>
              <p className="text-sm text-gray-500 font-light tracking-wide">Pétalos de flores naturales en cinta transparente | Dimensiones Variables | 2024</p>
            </div>

            {/* Imagen del taller - Mejorada con efecto hover y borde */}
            <div className="flex justify-center mb-20">
              <div className="max-w-3xl overflow-hidden rounded-lg shadow-2xl shadow-black/8 transition-all duration-500 hover:shadow-3xl hover:shadow-black/15">
                <img 
                  src="https://res.cloudinary.com/dtuyckctv/image/upload/v1770177812/Yo_Natural_fwjfkj.png" 
                  alt="Taller Yo natural, El Florímetro - Instalación" 
                  className="w-full h-auto object-cover grayscale-[15%] hover:grayscale-0 transition-all duration-1000 cursor-pointer" 
                />
              </div>
            </div>

            {/* Descripción del taller - Mejorada con mejor jerarquía */}
            <div className="space-y-10 text-gray-700 leading-relaxed">
              <p className="text-lg font-light">
                Este taller consistió en elaborar una especie de <em className="text-black font-normal italic">cinta métrica con pétalos de flores (El Florímetro)</em>, 
                el tamaño de cada florímetro correspondía a la altura de cada participante. Luego cada una crearían sus propios 
                diseños ubicando los pétalos como les guiara su creatividad dentro de dos capas de cinta pegante transparente.
              </p>
              
              <div className="relative">
                <p className="text-lg font-light border-l-2 border-black/10 pl-8 bg-[#f9f9f8]/80 p-6 rounded-lg">
                  Después utilizaron sus Florímetros para tomar sus nuevas medidas eligiendo que parte del cuerpo se querían medirse, 
                  de manera que mediante este nuevo dispositivo sus medidas se traducirán en <em className="text-black font-normal not-italic">creaciones propias con pétalos de flores</em> 
                  que simbolizaban sus pensamientos, recuerdos de seres queridos o simplemente número de pétalos de determinado tipo de flor.
                </p>
              </div>
              
              <div className="text-lg font-light italic text-center bg-[#f9f9f8] p-8 rounded-lg border border-black/5">
                <p className="text-xl">"Medida de la cintura de María: 5 pétalos de margarita, 7 de rosas rosadas y 6 de claveles."</p>
              </div>
              
              <p className="text-lg font-light">
                El concepto general de la obra aborda la <em className="text-black font-normal italic">mirada del cuerpo femenino</em>, cuestionando las ideas 
                preconcebidas de cómo debería ser, para transfigurarlo en nuevas formas de pensamiento que inciten a una 
                nueva mirada del cuerpo en relación a lo natural.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ESCUDO - Obra Destacada - Mejorado con mejor diseño */}
      <section className="border-t border-black/10 bg-[#ecece9]/50">
        <div className="ab-shell max-w-7xl mx-auto px-8 py-36">
          <div className="max-w-4xl mx-auto">
            <div className="mb-12">
              <h2 className="text-[11px] tracking-[0.3em] uppercase text-gray-500 mb-4 font-semibold text-center">Serie</h2>
              <div className="w-24 h-0.5 bg-black/10 mx-auto mb-8"></div>
              <h3 className="text-4xl md:text-5xl font-light mb-10 text-black text-center tracking-tight leading-[1.1]">
                ESCUDO
              </h3>
            </div>
            
            <div className="text-center mb-16">
              <p className="text-lg text-gray-600 font-light italic mb-3">De la serie Anatomía sobre Naturaleza Muerta</p>
              <p className="text-sm text-gray-500 font-light tracking-wide">Dibujo y Objeto Escultórico | Tinta Sobre Resina | 55 x 137,5 cm | 2022</p>
            </div>

            {/* Imagen de la obra - Mejorada */}
            <div className="flex justify-center mb-20">
              <div className="max-w-3xl overflow-hidden rounded-lg shadow-2xl shadow-black/8 transition-all duration-500 hover:shadow-3xl hover:shadow-black/15">
                <img 
                  src="https://res.cloudinary.com/dtuyckctv/image/upload/v1770178122/Escudo_ienq47.png" 
                  alt="ESCUDO - De la serie Anatomía sobre Naturaleza Muerta" 
                  className="w-full h-auto object-cover grayscale-[15%] hover:grayscale-0 transition-all duration-1000 cursor-pointer" 
                />
              </div>
            </div>

            {/* Descripción de la obra - Mejorada */}
            <div className="space-y-10 text-gray-700 leading-relaxed">
              <p className="text-lg font-light">
                En esta obra el <em className="text-black font-normal italic">proceso de realización es clave</em> para entender también su conceptualización, 
                se experimenta con el dibujo sobre hoja natural utilizando una hoja de gran dimensión y además agregando color 
                para luego aplicar las capas de resina transparente, las cuales capturan tanto la forma de la hoja como el dibujo realizado.
              </p>
              
              <div className="relative">
                <p className="text-lg font-light border-l-2 border-black/10 pl-8 italic bg-[#f9f9f8]/80 p-6 rounded-lg">
                  Temáticamente en esta obra se metaforiza acerca de la <em className="text-black font-normal not-italic">importancia de lo que hacemos con la vida 
                  y con lo que nos da vida</em>, es un cuestionamiento sobre nosotros mismo como especie, de nuestros vínculos 
                  estructurales con el entorno.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RELACIÓN VITAL - Obra Destacada - Mejorado */}
      <section className="border-t border-black/10">
        <div className="ab-shell max-w-7xl mx-auto px-8 py-36">
          <div className="max-w-4xl mx-auto">
            <div className="mb-12">
              <h2 className="text-[11px] tracking-[0.3em] uppercase text-gray-500 mb-4 font-semibold text-center">Escultura</h2>
              <div className="w-24 h-0.5 bg-black/10 mx-auto mb-8"></div>
              <h3 className="text-4xl md:text-5xl font-light mb-10 text-black text-center tracking-tight leading-[1.1]">
                RELACIÓN VITAL
              </h3>
            </div>
            
            <div className="text-center mb-16">
              <p className="text-lg text-gray-600 font-light italic mb-3">Escultura</p>
              <p className="text-sm text-gray-500 font-light tracking-wide">Dibujo sobre hoja en resina cristal, hoja natural y rama de árbol natural | 32 x 21 x 21 cm | 2020</p>
            </div>

            {/* Imagen de la obra - Mejorada */}
            <div className="flex justify-center mb-20">
              <div className="max-w-3xl overflow-hidden rounded-lg shadow-2xl shadow-black/8 transition-all duration-500 hover:shadow-3xl hover:shadow-black/15">
                <img 
                  src="https://res.cloudinary.com/dtuyckctv/image/upload/v1770178358/Relacion_vital_we2dfr.png" 
                  alt="RELACIÓN VITAL - Escultura" 
                  className="w-full h-auto object-cover grayscale-[15%] hover:grayscale-0 transition-all duration-1000 cursor-pointer" 
                />
              </div>
            </div>

            {/* Descripción de la obra - Mejorada */}
            <div className="space-y-10 text-gray-700 leading-relaxed">
              <p className="text-lg font-light">
                A partir de la experimentación de dos técnicas: el <em className="text-black font-normal italic">dibujo y el objeto escultórico</em> 
                y se construye con dos materiales: el <em className="text-black font-normal italic">elemento natural y el elemento artificial</em>.
              </p>
              
              <p className="text-lg font-light">
                La <em className="text-black font-normal italic">condición efímera y cambiante del entorno</em> es el eje temático de esta obra como también el proceso de creación. 
                Las acciones que hacemos, la forma como actuamos sobre el ambiente modifica y a su vez las leyes a las que estamos expuestos 
                como seres orgánicos repercute en nosotros.
              </p>
              
              <div className="relative">
                <p className="text-lg font-light border-l-2 border-black/10 pl-8 italic bg-[#f9f9f8]/80 p-6 rounded-lg">
                  Epifanía arbórea trata también sobre el <em className="text-black font-normal not-italic">control y la incertidumbre</em> de estar a la merced de las circunstancias.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CV Section - Totalmente rediseñado con mejor organización */}
      <section className="border-t border-black/10">
        <div className="ab-shell max-w-7xl mx-auto px-8 py-36">
          <div className="mb-20 text-center">
            <h2 className="text-[11px] tracking-[0.3em] uppercase text-gray-500 mb-4 font-semibold">Trayectoria</h2>
            <div className="w-24 h-0.5 bg-black/10 mx-auto mb-8"></div>
            <h3 className="text-4xl md:text-5xl font-light mb-16 text-black tracking-tight leading-[1.1]">
              Curriculum Vitae
            </h3>
          </div>

          <div className="grid lg:grid-cols-2 gap-20">
            {/* Columna Izquierda - Mejorada con mejor jerarquía */}
            <div className="space-y-16">
              {/* Estudios */}
              <div className="group">
                <div className="h-1 bg-gradient-to-r from-transparent via-black/10 to-transparent mb-8 transition-all group-hover:via-black/20"></div>
                <h3 className="text-2xl font-light text-black mb-8 tracking-widest uppercase text-gray-800">Estudios</h3>
                <div className="text-gray-600 font-light space-y-4">
                  <div className="flex items-start gap-4">
                    <span className="text-black font-normal min-w-[80px]">2008</span>
                    <p className="text-lg">Artes Plásticas, Universidad del Atlántico</p>
                  </div>
                </div>
              </div>

              {/* Seminarios y Talleres - Mejorado con mejor estructura */}
              <div className="group">
                <div className="h-1 bg-gradient-to-r from-transparent via-black/10 to-transparent mb-8 transition-all group-hover:via-black/20"></div>
                <h3 className="text-2xl font-light text-black mb-8 tracking-widest uppercase text-gray-800">Seminarios y Talleres</h3>
                <div className="space-y-10 text-gray-600 font-light">
                  <div className="border-l-2 border-black/5 pl-6 hover:border-black/15 transition-all">
                    <p className="text-black font-normal text-lg mb-3">2023</p>
                    <p className="text-base font-medium mb-2">Laboratorio de Arte y Naturaleza</p>
                    <p className="text-sm text-gray-500 italic mb-1">La naturaleza: La gran artista y Florilegio Caribe</p>
                    <p className="text-sm text-gray-500">Marco Barboza y Jenn Medina — Museo de Arte Moderno de Barranquilla MAMB, Universidad del Atlántico</p>
                  </div>
                  
                  <div className="border-l-2 border-black/5 pl-6 hover:border-black/15 transition-all">
                    <p className="text-black font-normal text-lg mb-3">2019</p>
                    <p className="text-base font-medium mb-2">Laboratorio Arte y Naturaleza</p>
                    <p className="text-sm text-gray-500 italic mb-1">El paisaje representado y la bitácora de viaje</p>
                    <p className="text-sm text-gray-500">Camilo Echeverría — Museo de Arte Moderno de Barranquilla MAMB</p>
                  </div>
                  
                  <div className="border-l-2 border-black/5 pl-6 hover:border-black/15 transition-all">
                    <p className="text-black font-normal text-lg mb-3">2018</p>
                    <p className="text-base font-medium mb-2">Encuentro Internacional de Arte: Entropías del Capital</p>
                    <p className="text-sm text-gray-500 italic mb-1">Degradación y Potencia</p>
                    <p className="text-sm text-gray-500">D. Martí Perán Rafart, D. Pedro Vicente Mullor — Universidad Internacional Menéndez Pelayo UIMP, Programa Visiona, Huesca, España</p>
                  </div>
                  
                  <div className="border-l-2 border-black/5 pl-6 hover:border-black/15 transition-all">
                    <p className="text-black font-normal text-lg mb-3">2009</p>
                    <p className="text-base font-medium mb-2">Seminario Internacional de arte</p>
                    <p className="text-sm text-gray-500 italic mb-1">Encuentro de Clínica de obra y Multiplicación Plástica</p>
                    <p className="text-sm text-gray-500">Carlos Kravetz — Gobernación Del Atlántico, Facultad de Bellas Artes, Universidad del Atlántico</p>
                  </div>
                  
                  <div className="border-l-2 border-black/5 pl-6 hover:border-black/15 transition-all">
                    <p className="text-black font-normal text-lg mb-3">2005</p>
                    <p className="text-base font-medium mb-2">Taller Arte y Experiencia</p>
                    <p className="text-sm text-gray-500">Ruslán Torres — Facultad de Bellas Artes, Universidad Del Atlántico y La Universidad Del Norte</p>
                  </div>
                </div>
              </div>

              {/* Exposiciones Individuales */}
              <div className="group">
                <div className="h-1 bg-gradient-to-r from-transparent via-black/10 to-transparent mb-8 transition-all group-hover:via-black/20"></div>
                <h3 className="text-2xl font-light text-black mb-8 tracking-widest uppercase text-gray-800">Exposiciones Individuales</h3>
                <div className="space-y-6 text-gray-600 font-light">
                  <div>
                    <p className="text-black font-normal text-lg mb-2">2008</p>
                    <p className="text-base">Vínculos… — Galería La Escuela, Barranquilla</p>
                  </div>
                  <div>
                    <p className="text-black font-normal text-lg mb-2">2009</p>
                    <p className="text-base">Vínculos… — Biblioteca de Combarranquilla</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Columna Derecha - Mejorada */}
            <div className="space-y-16">
              {/* Exposiciones Colectivas - Mejorado con mejor scroll */}
              <div className="group">
                <div className="h-1 bg-gradient-to-r from-transparent via-black/10 to-transparent mb-8 transition-all group-hover:via-black/20"></div>
                <h3 className="text-2xl font-light text-black mb-8 tracking-widest uppercase text-gray-800">Exposiciones Colectivas</h3>
                <div className="space-y-10 text-gray-600 font-light max-h-[600px] overflow-y-auto custom-scrollbar pr-4">
                  <div className="border-l-2 border-black/5 pl-6 hover:border-black/15 transition-all">
                    <p className="text-black font-normal text-lg mb-3">2024</p>
                    <div className="space-y-2 text-base">
                      <p>• Piratería Sentimental Vol. 5 — Museo Zenú de Arte Contemporáneo MUZAC, Montería</p>
                      <p>• La Galería de Melquiades, Homenaje a Gabriel García Márquez — Casa Matiz, Aracataca</p>
                    </div>
                  </div>
                  
                  <div className="border-l-2 border-black/5 pl-6 hover:border-black/15 transition-all">
                    <p className="text-black font-normal text-lg mb-3">2023</p>
                    <div className="space-y-2 text-base">
                      <p>• LOOPER — Fundación Cubo Abierto, Barrio Los Olivos, Barranquilla</p>
                      <p>• Paz en Femenino, El Arte de Bordar Memorias — Centro Cultural Universidad del Magdalena, Santa Marta</p>
                      <p>• Piratería Sentimental — Librería "Dos Mangos", Barranquilla</p>
                    </div>
                  </div>
                  
                  <div className="border-l-2 border-black/5 pl-6 hover:border-black/15 transition-all">
                    <p className="text-black font-normal text-lg mb-3">2022</p>
                    <div className="space-y-2 text-base">
                      <p>• Proyecta La Vitrina del Arte — Museo de Arte Moderno de Barranquilla, MAMB</p>
                    </div>
                  </div>
                  
                  <div className="border-l-2 border-black/5 pl-6 hover:border-black/15 transition-all">
                    <p className="text-black font-normal text-lg mb-3">2021</p>
                    <div className="space-y-2 text-base">
                      <p>• Territorios Guardianes — Museo Miguel Ángel Urrutia, Imagen Regional 9, Banco de la República, Bogotá D.C.</p>
                      <p>• Caribe e Insular — Museo de Santa Marta, Imagen Regional 9, Banco de la República</p>
                    </div>
                  </div>
                  
                  <div className="border-l-2 border-black/5 pl-6 hover:border-black/15 transition-all">
                    <p className="text-black font-normal text-lg mb-3">2020</p>
                    <div className="space-y-2 text-base">
                      <p>• Interior-Exterior — Exposición virtual, Banco de la República</p>
                      <p>• Confin-Arte — Exposición virtual, Secretaría de Cultura Patrimonio y Turismo de Barranquilla</p>
                    </div>
                  </div>
                  
                  <div className="border-l-2 border-black/5 pl-6 hover:border-black/15 transition-all">
                    <p className="text-black font-normal text-lg mb-3">2019</p>
                    <div className="space-y-2 text-base">
                      <p>• IV Bienal de València Ciutat Vella Oberta — Museo de la Ciudad "Palau del Marqués de Campo", Valencia, España</p>
                    </div>
                  </div>
                  
                  <div className="border-l-2 border-black/5 pl-6 hover:border-black/15 transition-all">
                    <p className="text-black font-normal text-lg mb-3">2018</p>
                    <div className="space-y-2 text-base">
                      <p>• 16 Salón Regional de artistas del caribe; Dimensión Desconocida — Ministerio de Cultura, Barranquilla</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Distinciones - Mejorado */}
              <div className="group">
                <div className="h-1 bg-gradient-to-r from-transparent via-black/10 to-transparent mb-8 transition-all group-hover:via-black/20"></div>
                <h3 className="text-2xl font-light text-black mb-8 tracking-widest uppercase text-gray-800">Distinciones</h3>
                <div className="space-y-10 text-gray-600 font-light max-h-[450px] overflow-y-auto custom-scrollbar pr-4">
                  <div className="border-l-2 border-black/5 pl-6 hover:border-black/15 transition-all">
                    <p className="text-black font-normal text-lg mb-3">2023</p>
                    <div className="space-y-2 text-base">
                      <p>• Ganadora en la modalidad de Expresiones Plásticas de la Convocatoria Paz en Femenino, El Arte de Bordar Memorias — Universidad del Magdalena, Santa Marta</p>
                    </div>
                  </div>
                  
                  <div className="border-l-2 border-black/5 pl-6 hover:border-black/15 transition-all">
                    <p className="text-black font-normal text-lg mb-3">2022</p>
                    <div className="space-y-2 text-base">
                      <p>• Ganadora de estímulo, Convocatoria Proyecta La Vitrina del Arte-Escenario Creativo — Museo de Arte Moderno de Barranquilla MAMB</p>
                    </div>
                  </div>
                  
                  <div className="border-l-2 border-black/5 pl-6 hover:border-black/15 transition-all">
                    <p className="text-black font-normal text-lg mb-3">2020</p>
                    <div className="space-y-2 text-base">
                      <p>• Ganadora de estímulo en la Convocatoria Mokan-Art — Gobernación del Atlántico, Barranquilla</p>
                      <p>• Ganadora de Estímulo en la Convocatoria Crear Convivencia — Gobernación del Atlántico</p>
                      <p>• Ganadora en la modalidad de Artes Plásticas del Portafolio de Estímulos Germán Vargas Cantillo — Confin-Arte I, Secretaría de Cultura y Patrimonio</p>
                    </div>
                  </div>
                  
                  <div className="border-l-2 border-black/5 pl-6 hover:border-black/15 transition-all">
                    <p className="text-black font-normal text-lg mb-3">2018</p>
                    <div className="space-y-2 text-base">
                      <p>• Beca de Circulación a Huesca España — Portafolio de Estímulos Germán Vargas Cantillo, Secretaría de Cultura y Patrimonio</p>
                    </div>
                  </div>
                  
                  <div className="border-l-2 border-black/5 pl-6 hover:border-black/15 transition-all">
                    <p className="text-black font-normal text-lg mb-3">2016</p>
                    <div className="space-y-2 text-base">
                      <p>• Ganadora Intervenirte Barranquilla — Fundación Cubo Abierto</p>
                    </div>
                  </div>
                
                  
                  <div className="border-l-2 border-black/5 pl-6 hover:border-black/15 transition-all">
                    <p className="text-black font-normal text-lg mb-3">2015</p>
                    <div className="space-y-2 text-base">
                      <p>• Mención de honor. Pintura Figurativa — I Salón Distrital de Artes Plásticas y Visuales, Secretaría de Cultura y Patrimonio</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Publicaciones - Mejorado */}
              <div className="group">
                <div className="h-1 bg-gradient-to-r from-transparent via-black/10 to-transparent mb-8 transition-all group-hover:via-black/20"></div>
                <h3 className="text-2xl font-light text-black mb-8 tracking-widest uppercase text-gray-800">Publicaciones</h3>
                <div className="space-y-8 text-gray-600 font-light">
                  <div>
                    <p className="text-black font-normal text-lg mb-3">2023</p>
                    <p className="text-base">Paz en Femenino, El Arte de Bordar Memorias — Ibeth Rocio Noriega y Angélica María Martínez, Editorial Unimagdalena</p>
                  </div>
                  <div>
                    <p className="text-black font-normal text-lg mb-3">2017</p>
                    <div className="space-y-2 text-base">
                      <p>PUBLIMETRO — "La artista que interviene con inquietantes ojos los árboles de Barranquilla" por Lina Robles</p>
                      <p>Periódico ADN — "Arte joven y con valor" por Wilhelm Garavito</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA - Mejorado con mejor diseño y efectos */}
        <section id="contact" className="py-48 text-center bg-[#f2f2f0] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/2 to-transparent"></div>
          <div className="max-w-4xl mx-auto px-8 relative z-10">
            <div className="mb-12">
              <h2 className="text-[11px] tracking-[0.3em] uppercase text-gray-500 mb-4 font-semibold">Contacto</h2>
              <div className="w-24 h-0.5 bg-black/10 mx-auto mb-8"></div>
              <h2 className="text-5xl md:text-6xl font-light mb-12 tracking-tight text-black leading-[1.1]">
                Comisiona tu obra
              </h2>
            </div>
            <p className="text-gray-600 text-xl font-light mb-16 leading-relaxed max-w-3xl mx-auto">
              Nuestras obras se realizan principalmente como comisiones privadas. Para disponibilidad o discutir una comisión, nos encantaría saber de ti.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <button className="px-12 py-5 border border-black text-black hover:bg-black hover:text-white transition-all duration-500 font-light text-[11px] tracking-[0.3em] uppercase shadow-lg shadow-black/5 hover:shadow-xl hover:shadow-black/10 transform hover:-translate-y-1">
                Contáctanos
              </button>
              <button className="px-12 py-5 bg-black text-white hover:bg-gray-800 transition-all duration-500 font-light text-[11px] tracking-[0.3em] uppercase shadow-xl shadow-black/10 hover:shadow-2xl hover:shadow-black/20 transform hover:-translate-y-1">
                Agenda una llamada
              </button>
            </div>
          </div>
        </section>
      </section>


      <Footer />

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.08);
          border-radius: 4px;
          border: 2px solid transparent;
          background-clip: content-box;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.15);
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.4s ease-out;
        }
      `}</style>
    </div>
  );
};

export default About;