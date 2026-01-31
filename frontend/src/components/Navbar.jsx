import { useEffect } from 'react';
import { Link } from 'react-router-dom'; 
import logo from '../assets/logo.jpg'; 
import addcartlogo from '../assets/addcartlogo.jpg';
import darklogo from '../assets/darklogo.jpg'

function Navbar({ onAddProductClick, theme, toggleTheme, onLogout, token }) {
return (
    /* --- GLASSMORPHIC FLOATING NAV --- */
    <nav className="sticky top-0 z-[100] flex flex-col md:flex-row justify-between items-center p-3 md:p-4 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border-b border-white/20 dark:border-gray-800 transition-all duration-300 gap-4 shadow-sm">
      
      {/* LEFT SECTION: Logo and Title */}
      <div className="flex gap-3 items-center self-start md:self-center group cursor-pointer">
        <div className="relative">
           {/* Subtle glow behind logo */}
           <div className="absolute -inset-1 bg-blue-500 rounded-full blur opacity-20 group-hover:opacity-50 transition duration-500"></div>
           <img 
             src={theme === "light" ? logo : darklogo} 
             alt="PriceWatch Logo" 
             className="relative h-9 w-9 rounded-xl object-cover transition-transform group-hover:rotate-12" 
           />
        </div>
        <div className="flex flex-col">
          <h1 className="font-black text-xl tracking-tight text-slate-800 dark:text-white whitespace-nowrap leading-none">
            PriceWatch
          </h1>
          <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mt-1">Intelligence</span>
        </div>
      </div>

      {/* RIGHT SECTION: Buttons Group */}
      <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 w-full md:w-auto">
        
        {/* Track Product Button - Sleek Gradient Style */}
        {token &&
        <button 
          onClick={onAddProductClick}
          className="group relative flex items-center bg-slate-900 dark:bg-blue-600 text-white font-bold py-2 px-4 rounded-2xl shadow-lg shadow-blue-500/20 active:scale-95 transition-all overflow-hidden"
        >
          <span className="relative z-10 text-sm">Track New Product</span>
          <div className="relative z-10 p-1 bg-white/10 rounded-lg ml-3 group-hover:bg-white/20 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </div>
          {/* Hover Slide Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </button>
}

        {/* Toggle Dark Mode Button - Modern Minimalist */}
        <button
          onClick={toggleTheme}
          className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 shadow-inner transform transition-all hover:rotate-12 flex items-center justify-center text-lg active:scale-90"
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

        {/* Auth Section */}
        <div className="flex items-center border-l-2 pl-3 border-slate-100 dark:border-gray-800 gap-3">
          {token ? (
            <button
              onClick={onLogout}
              className="group flex items-center justify-center w-10 h-10 rounded-2xl bg-red-50 dark:bg-red-900/20 text-red-500 border border-red-100 dark:border-red-900/50 hover:bg-red-500 hover:text-white transition-all duration-300"
              title="Logout"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 group-hover:translate-x-0.5 transition-transform">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
              </svg>
            </button>
          ) : (
            <div className="flex gap-2 items-center">
              <Link 
                to="/login" 
                className="text-sm font-black text-slate-500 dark:text-gray-400 px-3 py-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Login
              </Link>
              <Link 
                to="/signup" 
                className="text-sm bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-xl font-black border border-blue-100 dark:border-blue-800 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-500 dark:hover:text-white transition-all shadow-sm"
              >
                Join Now
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;