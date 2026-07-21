"use client"

import { useEffect } from "react"
import { useAdminStore } from "@/store/admin"
import Link from "next/link"
import Image from "next/image"
import { Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react"

export default function AdminProductosPage() {
  const { products, loading, loadProducts, deleteProduct, toggleActive } =
    useAdminStore()

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <span className="font-[family-name:var(--font-libre)] text-[10px] uppercase tracking-[0.3em] text-rust">
            Productos
          </span>
          <h1 className="font-[family-name:var(--font-libre)] text-3xl uppercase tracking-[0.05em] text-charcoal mt-1">
            Gestionar productos
          </h1>
          <p className="mt-1 text-sm text-charcoal/40">
            {products.length} productos totales
          </p>
        </div>
        <Link
          href="/admin/productos/nuevo"
          className="btn-retro inline-flex items-center gap-2 px-6 py-3 text-sm"
        >
          <Plus size={16} />
          Nuevo producto
        </Link>
      </div>

      {loading && (
        <div className="card-retro p-8 text-center">
          <p className="font-[family-name:var(--font-libre)] text-sm uppercase tracking-wider text-charcoal/40 animate-pulse">
            Cargando productos...
          </p>
        </div>
      )}

      {!loading && (
        <div className="card-retro overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-charcoal/10 bg-cream-dark">
                <th className="text-left p-4 font-[family-name:var(--font-libre)] text-[10px] uppercase tracking-[0.2em] text-charcoal/50">
                  Producto
                </th>
                <th className="text-left p-4 font-[family-name:var(--font-libre)] text-[10px] uppercase tracking-[0.2em] text-charcoal/50 hidden sm:table-cell">
                  Categoría
                </th>
                <th className="text-left p-4 font-[family-name:var(--font-libre)] text-[10px] uppercase tracking-[0.2em] text-charcoal/50 hidden md:table-cell">
                  Precio
                </th>
                <th className="text-left p-4 font-[family-name:var(--font-libre)] text-[10px] uppercase tracking-[0.2em] text-charcoal/50 hidden md:table-cell">
                  Stock
                </th>
                <th className="text-left p-4 font-[family-name:var(--font-libre)] text-[10px] uppercase tracking-[0.2em] text-charcoal/50">
                  Estado
                </th>
                <th className="text-right p-4 font-[family-name:var(--font-libre)] text-[10px] uppercase tracking-[0.2em] text-charcoal/50">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr
                  key={product.id}
                  className="border-b border-charcoal/5 hover:bg-cream-dark/50 transition-colors"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-10 flex-shrink-0 overflow-hidden bg-cream-dark rounded">
                        {product.images[0] ? (
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-[8px] text-charcoal/20">
                            img
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-[family-name:var(--font-libre)] text-sm uppercase tracking-wider text-charcoal">
                          {product.name}
                        </p>
                        <p className="text-[10px] text-charcoal/30 font-[family-name:var(--font-libre)] uppercase">
                          {product.sizes.join(" · ") || "Sin talle"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 hidden sm:table-cell">
                    <span className="font-[family-name:var(--font-libre)] text-xs uppercase tracking-wider text-charcoal/60">
                      {product.category}
                    </span>
                  </td>
                  <td className="p-4 hidden md:table-cell">
                    <span className="font-[family-name:var(--font-libre)] text-sm font-medium text-charcoal">
                      ${product.price.toLocaleString("es-AR")}
                    </span>
                    {product.originalPrice && (
                      <span className="text-[10px] text-charcoal/30 line-through ml-2">
                        ${product.originalPrice.toLocaleString("es-AR")}
                      </span>
                    )}
                  </td>
                  <td className="p-4 hidden md:table-cell">
                    <span
                      className={`font-[family-name:var(--font-libre)] text-sm ${
                        product.stock < 10 ? "text-red-600" : "text-charcoal"
                      }`}
                    >
                      {product.stock}
                    </span>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => toggleActive(product.id)}
                      className={`inline-flex items-center gap-1 text-[10px] font-[family-name:var(--font-libre)] uppercase tracking-wider px-2 py-1 rounded transition-colors ${
                        product.active
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-red-100 text-red-700 hover:bg-red-200"
                      }`}
                    >
                      {product.active ? (
                        <Eye size={10} />
                      ) : (
                        <EyeOff size={10} />
                      )}
                      {product.active ? "Activo" : "Inactivo"}
                    </button>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/producto/${product.slug}`}
                        target="_blank"
                        className="p-2 text-charcoal/30 hover:text-charcoal transition-colors"
                      >
                        <Eye size={14} />
                      </Link>
                      <Link
                        href={`/admin/productos/${product.id}`}
                        className="p-2 text-charcoal/30 hover:text-rust transition-colors"
                      >
                        <Pencil size={14} />
                      </Link>
                      <button
                        onClick={() => {
                          if (confirm("¿Eliminar este producto?")) {
                            deleteProduct(product.id)
                          }
                        }}
                        className="p-2 text-charcoal/30 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
