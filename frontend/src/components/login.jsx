import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api";
import toast from "react-hot-toast"; 

const Login = ({ setToken }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); 
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post("/login", { email, password });

      if (res.data && res.data.token) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("userName", res.data.user.name);
        setToken(res.data);
        toast.success(`Welcome back, ${res.data.user.name}!`);
        navigate("/");
      }
    } catch (err) {
      console.error("Login Error:", err.response?.data);
      toast.error(err.response?.data?.message || "Invalid Email or Password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-[#0F172A] px-6 transition-colors duration-300">
      {/* Decorative Background Blur */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-400/10 blur-[100px] rounded-full"></div>
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-indigo-400/10 blur-[100px] rounded-full"></div>

      <div className="relative w-full max-w-sm"> 
        <form 
          onSubmit={handleSubmit} 
          className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl py-7 px-8 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white dark:border-slate-700 w-full transition-all"
        >
          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">
              Welcome Back
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
              Enter your details to sign in.
            </p>
          </div>

          <div className="space-y-4"> 
            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 ml-1">
                Email Address
              </label>
              <input 
                type="email" 
                placeholder="name@company.com" 
                className="w-full p-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all dark:text-white text-sm" 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 ml-1">
                Password
              </label>
              <input 
                type="password" 
                placeholder="••••••••" 
                className="w-full p-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all dark:text-white text-sm" 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
            </div>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading}
            className={`w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-2xl font-bold transition-all transform active:scale-[0.98] shadow-lg shadow-blue-500/25 flex justify-center items-center ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span className="text-sm">Logging in</span>
              </div>
            ) : (
              "Sign In"
            )}
          </button>

          {/* Footer */}
          <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
            Don't have an account?{" "}
            <Link to="/signup" className="text-blue-500 hover:text-blue-600 font-bold underline-offset-4 hover:underline">
              Sign up
            </Link>
          </p>
        </form>
        
        <p className="text-center mt-5 text-slate-400 dark:text-slate-500 text-[10px] tracking-widest uppercase">
          Secured by PriceWatch Auth
        </p>
      </div>
    </div>
  );
};

export default Login;