import { Mail, User, GraduationCap, Briefcase } from "lucide-react";
import signUpSideImage from "./assets/signUpSideImage.png";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

export default function Auth() {
    const [isLoginSelected, setIsLoginSelected] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [selectedRole, setSelectedRole] = useState('student'); // 'student', 'educator', or 'industry_expert'
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleEmailLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch(`${backendUrl}/api/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password, role: selectedRole })
            });
            const data = await res.json();

            if (data.success) {
                localStorage.setItem('token', data.data.token);
                localStorage.setItem('authorization', data.data.token);
                localStorage.setItem('userId', JSON.stringify(data.data.user.id));
                localStorage.setItem('isLoggedIn', 'true');

                // Navigate based on role
                if (data.data.user.role === 'educator') {
                    navigate('/dashboard');
                } else if (data.data.user.role === 'industry_expert') {
                    navigate('/dashboard');
                } else {
                    navigate('/dashboard/stu');
                }
            } else {
                setError(data.error || 'Login failed');
            }
        } catch (error) {
            console.error('Error during email login:', error);
            setError('Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleEmailSignup = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch(`${backendUrl}/api/auth/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    firstName,
                    lastName,
                    email,
                    password,
                    role: selectedRole
                })
            });
            const data = await res.json();

            if (data.success) {
                localStorage.setItem('token', data.data.token);
                localStorage.setItem('authorization', data.data.token);
                localStorage.setItem('userId', JSON.stringify(data.data.user.id));
                localStorage.setItem('isLoggedIn', 'true');

                // Navigate based on role
                if (data.data.user.role === 'educator') {
                    navigate('/dashboard/edu');
                } else if (data.data.user.role === 'industry_expert') {
                    navigate('/dashboard/edu');
                } else {
                    navigate('/dashboard/stu');
                }
            } else {
                setError(data.error || 'Registration failed');
            }
        } catch (error) {
            console.error('Error during email signup:', error);
            setError('Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-[100vw] h-[100vh] flex relative">
            <div className="flex-1 h-full bg-[#191919]"></div>
            <div className="absolute w-full h-full backdrop-blur-[3px] flex items-center justify-center">
                <div className="flex border-[1px] border-white/10 rounded-[16px] shadow-md/40 shadow-black">
                    {/* Container for both forms with relative positioning */}
                    <div className="relative w-[412px] h-[586px] bg-[#151515] rounded-l-[16px] overflow-hidden">

                        {/* Sign Up Form */}
                        <div className={`absolute inset-0 p-[52px] pb-[20px] flex flex-col justify-center items-center transition-all duration-500 ${isLoginSelected ? "opacity-0 translate-x-[-100%]" : "opacity-100 translate-x-0"
                            }`}>
                            <div className="text-[24px] mb-[16px] font-bold text-white">Create your account</div>
                            <div className="text-[14px] mb-[20px] font-medium text-[#888888]">Sign up to join</div>

                            {/* Role Selection */}
                            <div className="mb-[20px] w-[308px]">
                                <div className="text-[14px] text-white mb-[8px]">I am a:</div>
                                <div className="grid grid-cols-2 gap-[8px]">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedRole('student')}
                                        className={`h-[44px] flex items-center justify-center gap-[8px] rounded-[10px] border-[1px] ${selectedRole === 'student'
                                                ? 'bg-[#7848ff] border-[#7848ff] text-white'
                                                : 'bg-[#222222] border-white/10 text-[#888888] hover:bg-[#383838]'
                                            }`}
                                    >
                                        <User className="size-[16px]" />
                                        <span className="text-[14px] font-medium">Student</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedRole('educator')}
                                        className={`h-[44px] flex items-center justify-center gap-[8px] rounded-[10px] border-[1px] ${selectedRole === 'educator'
                                                ? 'bg-[#7848ff] border-[#7848ff] text-white'
                                                : 'bg-[#222222] border-white/10 text-[#888888] hover:bg-[#383838]'
                                            }`}
                                    >
                                        <GraduationCap className="size-[16px]" />
                                        <span className="text-[14px] font-medium">Educator</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedRole('industry_expert')}
                                        className={`col-span-2 h-[44px] flex items-center justify-center gap-[8px] rounded-[10px] border-[1px] ${selectedRole === 'industry_expert'
                                                ? 'bg-[#7848ff] border-[#7848ff] text-white'
                                                : 'bg-[#222222] border-white/10 text-[#888888] hover:bg-[#383838]'
                                            }`}
                                    >
                                        <Briefcase className="size-[16px]" />
                                        <span className="text-[14px] font-medium">Industry Expert</span>
                                    </button>
                                </div>
                            </div>

                            <form onSubmit={handleEmailSignup} className="flex flex-col gap-[8px]">
                                <div className="flex gap-[8px]">
                                    <input
                                        type="text"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        className="text-white focus:outline-[1px] focus:outline-[#bb86fc]/80 h-[39px] w-[146px] py-[8px] px-[12px] bg-[#2b2b2b] rounded-[8px] caret-white placeholder:text-white/50 text-[14px]"
                                        placeholder="First Name"
                                        required
                                    />
                                    <input
                                        type="text"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        className="text-white focus:outline-[1px] focus:outline-[#bb86fc]/80 h-[39px] w-[146px] py-[8px] px-[12px] bg-[#2b2b2b] rounded-[8px] caret-white placeholder:text-white/50 text-[14px]"
                                        placeholder="Last Name"
                                        required
                                    />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="text-white focus:outline-[1px] focus:outline-[#bb86fc]/80 h-[39px] w-[300px] py-[8px] px-[12px] bg-[#2b2b2b] rounded-[8px] caret-white placeholder:text-white/50 text-[14px]"
                                    placeholder="Email"
                                    required
                                />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="text-white focus:outline-1 focus:outline-[#bb86fc]/80 h-[39px] w-[300px] py-[8px] px-[12px] bg-[#2b2b2b] rounded-[8px] caret-white placeholder:text-white/50 text-[14px]"
                                    placeholder="Password"
                                    required
                                />
                                {error && (
                                    <div className="text-red-500 text-[12px] text-center">
                                        {error}
                                    </div>
                                )}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-[#7848ff] w-[300px] h-[40px] flex items-center justify-center rounded-[10px] hover:bg-[#593cbc] cursor-pointer text-[14px] text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Creating Account...' : 'Create Account'}
                                </button>
                            </form>

                            <div className="mt-[20px] flex text-[11px] text-[#888888] gap-[5px]">
                                <div>By signing up, you agree to our </div>
                                <a href="/terms" className="underline">Terms</a>
                                <div>&</div>
                                <a href="/privacypolicy" className="underline">Privacy Policy</a>
                            </div>
                            <div className="pt-[16px] flex gap-[5px] text-[11px]">
                                <div className="text-[#888888]">Have an account?</div>
                                <div onClick={() => setIsLoginSelected(true)} className="underline text-[#bb86fc] cursor-pointer">Log in</div>
                            </div>
                        </div>

                        {/* Login Form */}
                        <div className={`absolute inset-0 p-[52px] pb-[20px] flex flex-col justify-center items-center transition-all duration-500 ${isLoginSelected ? "opacity-100 translate-x-0" : "opacity-0 translate-x-[100%]"
                            }`}>
                            <div className="text-[24px] mb-[16px] font-bold text-white">Login</div>
                            <div className="text-[12px] mb-[24px] font-medium text-[#888888] flex gap-[5px]">
                                <div>Don't have an account?</div>
                                <div className="text-[#bb86fc] cursor-pointer"
                                    onClick={() => setIsLoginSelected(false)}
                                >Sign up</div>
                            </div>

                            {/* Role Selection */}
                            <div className="mb-[20px] w-[308px]">
                                <div className="text-[14px] text-white mb-[8px]">Login as:</div>
                                <div className="grid grid-cols-2 gap-[8px]">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedRole('student')}
                                        className={`h-[44px] flex items-center justify-center gap-[8px] rounded-[10px] border-[1px] ${selectedRole === 'student'
                                                ? 'bg-[#7848ff] border-[#7848ff] text-white'
                                                : 'bg-[#222222] border-white/10 text-[#888888] hover:bg-[#383838]'
                                            }`}
                                    >
                                        <User className="size-[16px]" />
                                        <span className="text-[14px] font-medium">Student</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedRole('educator')}
                                        className={`h-[44px] flex items-center justify-center gap-[8px] rounded-[10px] border-[1px] ${selectedRole === 'educator'
                                                ? 'bg-[#7848ff] border-[#7848ff] text-white'
                                                : 'bg-[#222222] border-white/10 text-[#888888] hover:bg-[#383838]'
                                            }`}
                                    >
                                        <GraduationCap className="size-[16px]" />
                                        <span className="text-[14px] font-medium">Educator</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedRole('industry_expert')}
                                        className={`col-span-2 h-[44px] flex items-center justify-center gap-[8px] rounded-[10px] border-[1px] ${selectedRole === 'industry_expert'
                                                ? 'bg-[#7848ff] border-[#7848ff] text-white'
                                                : 'bg-[#222222] border-white/10 text-[#888888] hover:bg-[#383838]'
                                            }`}
                                    >
                                        <Briefcase className="size-[16px]" />
                                        <span className="text-[14px] font-medium">Industry Expert</span>
                                    </button>
                                </div>
                            </div>

                            <form onSubmit={handleEmailLogin} className="flex flex-col gap-[8px]">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="text-white focus:outline-[1px] focus:outline-[#bb86fc]/80 h-[39px] w-[300px] py-[8px] px-[12px] bg-[#2b2b2b] rounded-[8px] caret-white placeholder:text-white/50 text-[14px]"
                                    placeholder="Email"
                                    required
                                />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="text-white focus:outline-1 focus:outline-[#bb86fc]/80 h-[39px] w-[300px] py-[8px] px-[12px] bg-[#2b2b2b] rounded-[8px] caret-white placeholder:text-white/50 text-[14px]"
                                    placeholder="Password"
                                    required
                                />
                                {error && (
                                    <div className="text-red-500 text-[12px] text-center">
                                        {error}
                                    </div>
                                )}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-[#7848ff] w-[300px] h-[40px] flex items-center justify-center rounded-[10px] hover:bg-[#593cbc] cursor-pointer text-[14px] text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Logging in...' : 'Log in'}
                                </button>
                            </form>
                        </div>
                    </div>

                    <div className="w-[500px] h-[586px] pl-[36px] rounded-r-[16px] bg-[#0e0e0e]">
                        <div className="w-full h-full flex items-center justify-center">
                            <img src={signUpSideImage} className="w-[464px] h-[460px]" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}