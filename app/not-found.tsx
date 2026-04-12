import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <h2 className="text-4xl font-black uppercase tracking-tighter mb-4 text-[#8B1D3D]">Not Found</h2>
      <p className="text-gray-600 mb-8">Could not find requested resource</p>
      <Link
        href="/"
        className="rounded-full bg-[#8B1D3D] text-white px-8 py-3 text-sm font-bold uppercase tracking-widest hover:bg-[#6A162E] transition-colors"
      >
        Return Home
      </Link>
    </div>
  )
}
