import { useState } from 'react'
import AdminLayout from '../../components/layouts/AdminLayout'

function SalesArtwork() {
  const [activeSection] = useState('ventas')
  const [formData, setFormData] = useState({
    obra: '',
    nombreComprador: '',
    emailComprador: '',
    telefonoComprador: '',
    lugar: '',
    fechaVenta: '',
    precioVenta: '',
    notas: '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Venta submitted:', formData)
    // Aquí irá la lógica para enviar los datos al backend
  }

  return (
    <AdminLayout activeSection={activeSection}>
      <section>
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-light mb-4 tracking-tight text-black">
            Registrar Ventas de Obras
          </h1>
          <p className="text-lg text-gray-500 font-light">
            Administra y registra las ventas de las obras de la galería
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-sm p-12 shadow-lg shadow-black/5 border border-black/5 mb-16">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Obra */}
            <div>
              <label className="block text-[11px] uppercase tracking-[0.5em] text-gray-500 font-semibold mb-4">
                Obra Vendida
              </label>
              <input
                type="text"
                name="obra"
                value={formData.obra}
                onChange={handleChange}
                placeholder="Ej: Flores Marchitas II"
                className="w-full px-6 py-4 border border-black/10 bg-white/50 text-black placeholder-gray-400 focus:outline-none focus:border-black focus:bg-white transition font-light"
                required
              />
            </div>

            {/* Nombre del Comprador */}
            <div>
              <label className="block text-[11px] uppercase tracking-[0.5em] text-gray-500 font-semibold mb-4">
                Nombre del Comprador
              </label>
              <input
                type="text"
                name="nombreComprador"
                value={formData.nombreComprador}
                onChange={handleChange}
                placeholder="Nombre completo del comprador"
                className="w-full px-6 py-4 border border-black/10 bg-white/50 text-black placeholder-gray-400 focus:outline-none focus:border-black focus:bg-white transition font-light"
                required
              />
            </div>

            {/* Email del Comprador */}
            <div>
              <label className="block text-[11px] uppercase tracking-[0.5em] text-gray-500 font-semibold mb-4">
                Email del Comprador
              </label>
              <input
                type="email"
                name="emailComprador"
                value={formData.emailComprador}
                onChange={handleChange}
                placeholder="correo@ejemplo.com"
                className="w-full px-6 py-4 border border-black/10 bg-white/50 text-black placeholder-gray-400 focus:outline-none focus:border-black focus:bg-white transition font-light"
                required
              />
            </div>

            {/* Teléfono del Comprador */}
            <div>
              <label className="block text-[11px] uppercase tracking-[0.5em] text-gray-500 font-semibold mb-4">
                Teléfono del Comprador
              </label>
              <input
                type="tel"
                name="telefonoComprador"
                value={formData.telefonoComprador}
                onChange={handleChange}
                placeholder="Ej: +57 300 1234567"
                className="w-full px-6 py-4 border border-black/10 bg-white/50 text-black placeholder-gray-400 focus:outline-none focus:border-black focus:bg-white transition font-light"
                required
              />
            </div>

            {/* Lugar de Venta */}
            <div>
              <label className="block text-[11px] uppercase tracking-[0.5em] text-gray-500 font-semibold mb-4">
                Lugar de Venta
              </label>
              <input
                type="text"
                name="lugar"
                value={formData.lugar}
                onChange={handleChange}
                placeholder="Ej: Galería Maraleste, Feria de Arte, Online..."
                className="w-full px-6 py-4 border border-black/10 bg-white/50 text-black placeholder-gray-400 focus:outline-none focus:border-black focus:bg-white transition font-light"
                required
              />
            </div>

            {/* Fecha de Venta */}
            <div>
              <label className="block text-[11px] uppercase tracking-[0.5em] text-gray-500 font-semibold mb-4">
                Fecha de Venta
              </label>
              <input
                type="date"
                name="fechaVenta"
                value={formData.fechaVenta}
                onChange={handleChange}
                className="w-full px-6 py-4 border border-black/10 bg-white/50 text-black focus:outline-none focus:border-black focus:bg-white transition font-light"
                required
              />
            </div>

            {/* Precio de Venta */}
            <div>
              <label className="block text-[11px] uppercase tracking-[0.5em] text-gray-500 font-semibold mb-4">
                Precio de Venta
              </label>
              <input
                type="number"
                name="precioVenta"
                value={formData.precioVenta}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                className="w-full px-6 py-4 border border-black/10 bg-white/50 text-black placeholder-gray-400 focus:outline-none focus:border-black focus:bg-white transition font-light"
                required
              />
            </div>

            {/* Notas */}
            <div className="md:col-span-2">
              <label className="block text-[11px] uppercase tracking-[0.5em] text-gray-500 font-semibold mb-4">
                Notas Adicionales
              </label>
              <textarea
                name="notas"
                value={formData.notas}
                onChange={handleChange}
                placeholder="Información adicional sobre la venta..."
                rows="4"
                className="w-full px-6 py-4 border border-black/10 bg-white/50 text-black placeholder-gray-400 focus:outline-none focus:border-black focus:bg-white transition font-light"
              />
            </div>
          </div>

          <button
            type="submit"
            className="mt-10 w-full px-10 py-4 bg-black text-white hover:bg-gray-800 transition duration-500 font-light text-[11px] tracking-[0.2em] uppercase shadow-lg shadow-black/10"
          >
            Registrar Venta
          </button>
        </form>

        {/* Lista de Ventas */}
        <div>
          <h3 className="text-2xl font-light mb-8 tracking-tight text-black">Ventas Recientes</h3>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="bg-white rounded-sm p-6 shadow-md shadow-black/5 border border-black/5 hover:shadow-lg transition-shadow duration-300">
                <div className="grid md:grid-cols-3 gap-6 mb-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.5em] text-gray-500 font-semibold mb-2">Obra</p>
                    <h4 className="font-light text-lg text-black">Obra {item}</h4>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.5em] text-gray-500 font-semibold mb-2">Comprador</p>
                    <p className="font-light text-black">Nombre Comprador</p>
                    <p className="text-sm text-gray-600 font-light">correo@ejemplo.com</p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.5em] text-gray-500 font-semibold mb-2">Lugar</p>
                    <p className="font-light text-black">Galería Maraleste</p>
                  </div>
                </div>
                <div className="grid md:grid-cols-3 gap-6 border-t border-black/10 pt-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.5em] text-gray-500 font-semibold mb-2">Fecha</p>
                    <p className="font-light text-black">18 de enero, 2026</p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.5em] text-gray-500 font-semibold mb-2">Precio</p>
                    <p className="font-light text-lg text-black">$5,000.00</p>
                  </div>
                  <div className="flex gap-3 items-end">
                    <button className="flex-1 px-4 py-2 border border-black/20 text-[10px] uppercase tracking-wider font-medium hover:bg-black hover:text-white transition">
                      Ver Detalles
                    </button>
                    <button className="flex-1 px-4 py-2 border border-black/20 text-[10px] uppercase tracking-wider font-medium hover:bg-black hover:text-white transition">
                      Editar
                    </button>
                    <button className="flex-1 px-4 py-2 border border-red-300 text-red-600 text-[10px] uppercase tracking-wider font-medium hover:bg-red-50 transition">
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </AdminLayout>
  )
}

export default SalesArtwork
