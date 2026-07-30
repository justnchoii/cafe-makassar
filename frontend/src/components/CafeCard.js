'use client';

import Link from 'next/link';

export default function CafeCard({ cafe, index }) {
  const categoryEmoji = {
    aesthetic: '📸',
    coworking: '💻',
    outdoor: '🌿',
    rooftop: '🌆',
    traditional: '☕',
    cozy: '🛋️',
  };

  const categoryColors = {
    aesthetic: 'bg-pink-50 text-pink-600',
    coworking: 'bg-blue-50 text-blue-600',
    outdoor: 'bg-green-50 text-green-600',
    rooftop: 'bg-purple-50 text-purple-600',
    traditional: 'bg-amber-50 text-amber-600',
    cozy: 'bg-orange-50 text-orange-600',
  };

  return (
    <Link 
      href={`/cafe/${cafe._id}`}
      className="glass-card overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-fade-in-up block cursor-pointer"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* Image */}
      <div className="h-48 relative overflow-hidden">
        {cafe.image ? (
          <img 
            src={cafe.image} 
            alt={cafe.name}
            className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
          />
        ) : null}
        <div 
          className="h-full bg-gradient-to-br from-warm to-secondary/30 flex items-center justify-center"
          style={{ display: cafe.image ? 'none' : 'flex' }}
        >
          <span className="text-6xl opacity-50">{categoryEmoji[cafe.category] || '☕'}</span>
        </div>
        {/* Price Badge */}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-bold text-primary">
          {cafe.priceRange === '$' ? 'Murah' : cafe.priceRange === '$$' ? 'Sedang' : cafe.priceRange === '$$$' ? 'Mahal' : cafe.priceRange || 'Sedang'}
        </div>
        {/* Rating Badge */}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-bold text-primary flex items-center gap-1">
          ⭐ {cafe.rating}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-primary text-lg leading-tight">{cafe.name}</h3>
        </div>
        
        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium mb-3 ${categoryColors[cafe.category] || 'bg-gray-50 text-gray-600'}`}>
          {categoryEmoji[cafe.category]} {cafe.category}
        </span>

        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{cafe.description}</p>

        <div className="flex items-center gap-1 text-xs text-gray-400 mb-3">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="truncate">{cafe.address}</span>
        </div>

        {/* Facilities */}
        <div className="flex flex-wrap gap-1.5">
          {cafe.facilities?.slice(0, 3).map((f, i) => (
            <span key={i} className="text-[10px] px-2 py-0.5 bg-warm rounded-full text-gray-600">
              {f}
            </span>
          ))}
          {cafe.facilities?.length > 3 && (
            <span className="text-[10px] px-2 py-0.5 bg-warm rounded-full text-gray-400">
              +{cafe.facilities.length - 3} more
            </span>
          )}
        </div>

        {/* Open Hours */}
        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs text-gray-400">🕐 {cafe.openHours}</span>
          <span className="text-xs text-secondary font-medium">
            Lihat Detail →
          </span>
        </div>
      </div>
    </Link>
  );
}
