import React from 'react';

function Footer() {
  return (
    // Usamos el negro exacto de la sección materiales #1a1a1a
    <footer className="bg-[#1a1a1a] text-white border-t border-white/5">
      <div className="max-w-7xl mx-auto px-8">
        
        {/* Contenido Principal */}
        <div className="py-24 grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8">
          
          {/* Brand Section */}
          <div className="md:col-span-5">
            {/* Texto en blanco puro para máximo destaque de marca */}
            <h2 className="text-2xl font-light tracking-[0.4em] mb-8 text-white uppercase">
              MARALESTE
            </h2>
            <p className="text-gray-400 font-light leading-relaxed max-w-sm text-[15px]">
              Estudio dedicado a la intersección del arte contemporáneo y la innovación matérica. 
              Transformamos espacios a través de piezas que narran historias de diseño y técnica.
            </p>
            <div className="flex gap-8 mt-12">
              {['Instagram', 'LinkedIn', 'Behance'].map((social) => (
                <a 
                  key={social} 
                  href="#" 
                  className="text-[10px] uppercase tracking-[0.3em] text-gray-500 hover:text-white transition-all duration-300 border-b border-transparent hover:border-white/20 pb-1"
                >
                  {social}
                </a>
              ))}
            </div>
          </div>

          {/* Espaciador para desktop */}
          <div className="hidden md:block md:col-span-1"></div>

          {/* Navegación */}
          <div className="md:col-span-2">
            <h3 className="text-[11px] font-medium text-gray-500 mb-10 tracking-[0.25em] uppercase">Estudio</h3>
            <ul className="space-y-5">
              {['Acerca de', 'Obras', 'Materiales', 'Procesos'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm font-light text-gray-400 hover:text-white transition-colors duration-300">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Servicios */}
          <div className="md:col-span-2">
            <h3 className="text-[11px] font-medium text-gray-500 mb-10 tracking-[0.25em] uppercase">Servicios</h3>
            <ul className="space-y-5">
              {['Comisiones', 'Colaboraciones', 'Consultoría', 'Prensa'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm font-light text-gray-400 hover:text-white transition-colors duration-300">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacto Directo */}
          <div className="md:col-span-2">
            <h3 className="text-[11px] font-medium text-gray-500 mb-10 tracking-[0.25em] uppercase">Contacto</h3>
            <address className="not-italic space-y-8">
              <div className="group">
                <p className="text-[10px] text-gray-600 uppercase tracking-[0.2em] mb-2">Email</p>
                <a href="mailto:info@maraleste.com" className="text-sm font-light text-gray-300 hover:text-white transition-colors border-b border-white/5 group-hover:border-white/20 pb-1">
                  info@maraleste.com
                </a>
              </div>
              <div className="group">
                <p className="text-[10px] text-gray-600 uppercase tracking-[0.2em] mb-2">Ubicación</p>
                <p className="text-sm font-light text-gray-400">Madrid, España</p>
              </div>
            </address>
          </div>
        </div>

        {/* Footer Inferior */}
        <div className="py-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-[10px] tracking-[0.3em] text-gray-600 uppercase font-light">
            © 2026 MARALESTE — STUDIO DE ARTE & DISEÑO
          </p>
          <div className="flex gap-12">
            <a href="#" className="text-[10px] tracking-[0.2em] text-gray-600 hover:text-gray-300 uppercase transition font-light">Privacidad</a>
            <a href="#" className="text-[10px] tracking-[0.2em] text-gray-600 hover:text-gray-300 uppercase transition font-light">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;