import React from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Button } from '../ui/button'
import { Avatar, AvatarImage } from '../ui/avatar'
import { LogOut, User2 } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import { USER_API_END_POINT } from '@/utils/constant'
import { setUser } from '@/redux/authSlice'
import { toast } from 'sonner'

const Navbar = () => {
    const { user } = useSelector(store => store.auth)
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const logoutHandler = async () => {
        try {
            const res = await axios.get(`${USER_API_END_POINT}/logout`, { withCredentials: true })
            if (res.data.success) {
                dispatch(setUser(null))
                navigate("/")
                toast.success(res.data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.response?.data?.message || "Logout failed")
        }
    }

    return (
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="text-2xl font-bold tracking-tight">
                    Job<span className="text-[#6b62e6]">Portal</span>
                </Link>

                {/* Navigation Links */}
                <nav className="hidden md:flex items-center gap-6 text-gray-700 font-medium">
                    {user && user.role === 'recruiter' ? (
                        <>
                            <Link to="/admin/companies" className="hover:text-[#6A38C2] transition">Companies</Link>
                            <Link to="/admin/jobs" className="hover:text-[#6A38C2] transition">Jobs</Link>
                            <Link to="/admin/video-interviews" className="hover:text-[#6A38C2] transition">Video Interviews</Link>
                        </>
                    ) : (
                        <>
                            <Link to="/" className="hover:text-[#6A38C2] transition">Home</Link>
                            <Link to="/jobs" className="hover:text-[#6A38C2] transition">Jobs</Link>
                            <Link to="/browse" className="hover:text-[#6A38C2] transition">Browse</Link>

                        </>
                    )}
                </nav>

                {/* Auth Buttons or Avatar */}
                <div className="flex items-center gap-4">
                    {!user ? (
                        <>
                            <Link to="/login">
                                <Button variant="outline" className="px-4 py-2 rounded-full border-gray-300">Login</Button>
                            </Link>
                            <Link to="/signup">
                                <Button className="bg-[#6A38C2] hover:bg-[#5b30a6] text-white px-4 py-2 rounded-full">Signup</Button>
                            </Link>
                        </>
                    ) : (
                        <Popover>
                            <PopoverTrigger asChild>
                                <Avatar className="cursor-pointer ring-1 ring-gray-300">
                                    <AvatarImage src={user?.profile?.profilePhoto} alt="profile" />
                                </Avatar>
                            </PopoverTrigger>
                            <PopoverContent className="w-80 mt-2 rounded-xl shadow-md border p-4">
                                <div className="flex gap-4 items-center mb-4">
                                    <Avatar>
                                        <AvatarImage src={user?.profile?.profilePhoto} alt="profile" />
                                    </Avatar>
                                    <div>
                                        <h4 className="font-semibold text-gray-900">{user?.fullname}</h4>
                                        <p className="text-sm text-gray-500">{user?.profile?.bio}</p>
                                    </div>
                                </div>
                                <div className="space-y-3 text-gray-600">
                                    {user.role === 'student' && (
                                        <div className="flex items-center gap-2">
                                            <User2 className="w-5 h-5" />
                                            <Button variant="link" className="p-0 h-auto">
                                                <Link to="/profile">View Profile</Link>
                                            </Button>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2">
                                        <LogOut className="w-5 h-5" />
                                        <Button variant="link" onClick={logoutHandler} className="p-0 h-auto">Logout</Button>
                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>
                    )}
                </div>
            </div>
        </header>
    )
}

export default Navbar
