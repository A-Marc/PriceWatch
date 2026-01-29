import { useEffect } from 'react';
import { Link } from 'react-router-dom'; 
import logo from '../assets/logo.jpg'; 
import addcartlogo from '../assets/addcartlogo.jpg';
import darklogo from '../assets/darklogo.jpg'

function Navbar({ onAddProductClick, theme, toggleTheme, onLogout, token }) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-center p-4 bg-white dark:bg-gray-800 transition-colors duration-300 gap-4">
      
      {/* LEFT SECTION: Logo and Title */}
      <div className="flex gap-2 items-center self-start md:self-center">
        <img src={theme === "light" ? logo : darklogo} alt="PriceWatch Logo" className="h-7 w-7" />
        <h1 className="font-bold text-xl text-black dark:text-white whitespace-nowrap">
          PriceWatch Tracker
        </h1>
      </div>

      {/* RIGHT SECTION: Buttons Group */}
      <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 w-full md:w-auto">
        
        {/* Track Product Button */}
        <button 
          onClick={onAddProductClick}
          className="flex items-center bg-blue-500 dark:bg-blue-900 text-white font-semibold py-1.5 px-3 rounded shadow-sm active:scale-95 transition-transform"
        >
          <span className="text-sm sm:text-base">Track New Product</span>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 ml-2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
          </svg>
        </button>

        {/* Toggle Dark Mode Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 shadow-sm transform transition-all hover:scale-110 flex items-center justify-center"
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

        {/* Auth Section */}
        <div className="flex items-center border-l pl-3 border-gray-200 dark:border-gray-600 gap-2">
          {token ? (
          <button
  onClick={onLogout}
  className="p-2 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 hover:bg-red-600 hover:text-white dark:hover:bg-red-500 dark:hover:text-white transition-all"
  title="Logout"
>
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
  </svg>
</button>
          ) : (
            <div className="flex gap-1 items-center">
              <Link 
                to="/login" 
                className="text-xs sm:text-sm font-bold text-blue-600 dark:text-blue-400 px-2 py-1 hover:underline whitespace-nowrap"
              >
                Login
              </Link>
              <Link 
                to="/signup" 
                className="text-xs sm:text-sm bg-blue-600 text-white px-3 py-1.5 rounded-md font-semibold hover:bg-blue-700 transition whitespace-nowrap"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default Navbar;