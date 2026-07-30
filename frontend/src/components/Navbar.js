'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">☕</span>
          <span className="font-display text-xl font-bold text-primary">
            Cafe<span className="text-secondary">Makassar</span>
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-sm text-gray-600 hover:text-primary transition-colors">
            Home
          </Link>
          <Link href="/#cafes" className="text-sm text-gray-600 hover:text-primary transition-colors">
            Explore
          </Link>
          <Link href="/chat" className="text-sm text-gray-600 hover:text-primary transition-colors">
            AI Chat
          </Link>
          <Link href="/admin" className="text-sm text-gray-600 hover:text-primary transition-colors flex items-center gap-1">
            🔐 Admin
          </Link>
          <Link href="/chat" className="btn-primary text-sm py-2">
            🤖 Tanya AI
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden p-2"
          onClick={() => setIsOpen(!isOpen)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-3">
          <Link href="/" className="block text-sm text-gray-600" onClick={() => setIsOpen(false)}>Home</Link>
          <Link href="/#cafes" className="block text-sm text-gray-600" onClick={() => setIsOpen(false)}>Explore</Link>
          <Link href="/chat" className="block text-sm text-gray-600" onClick={() => setIsOpen(false)}>AI Chat</Link>
          <Link href="/admin" className="block text-sm text-gray-600" onClick={() => setIsOpen(false)}>🔐 Admin</Link>
        </div>
      )}
    </nav>
  );
}
