import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import API_URL from '@/config';
import { Monitor, User, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        username,
        password
      });
      login(response.data.token, response.data.user);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full lg:grid lg:grid-cols-2">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex flex-col justify-between bg-primary p-12 text-primary-foreground relative overflow-hidden">
        {/* Abstract Background Pattern */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light"></div>
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-blue-500 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-purple-500 rounded-full blur-3xl opacity-20"></div>

        <div className="relative z-10 flex items-center gap-3 font-bold text-xl">
            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
              <Monitor className="h-6 w-6" />
            </div>
            <span>Saurav Computer</span>
        </div>

        <div className="relative z-10 space-y-6 max-w-lg">
            <h1 className="text-5xl font-extrabold tracking-tight leading-tight">
                Manage your institute with excellence.
            </h1>
            <p className="text-lg text-blue-100/90 leading-relaxed">
                Streamline fees, track students, and generate comprehensive reports with our professional management system. Designed for efficiency and growth.
            </p>
        </div>

        <div className="relative z-10 text-sm text-blue-200/80 flex items-center gap-4">
            <span>© {new Date().getFullYear()} Saurav Computer</span>
            <span className="h-1 w-1 rounded-full bg-blue-200/50"></span>
            <span>Fee Management System</span>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-[400px] space-y-8">
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">Welcome back</h2>
                <p className="text-sm text-slate-500">Please enter your details to sign in.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 mt-8">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                      <Input 
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter your username"
                        className="pl-10 h-11 bg-white"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-5 w-5 text-slate-400 z-10" />
                      <PasswordInput 
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="pl-10 h-11 bg-white"
                        required
                      />
                    </div>
                  </div>
                </div>

                <Button type="submit" className="w-full h-11 text-base" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in...
                    </>
                  ) : (
                    <>
                      Sign In <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
            </form>

            <div className="text-center text-xs text-slate-400 mt-8">
              <p>Protected by secure authentication.</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
