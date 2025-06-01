import React, { useState } from 'react'
import { Button } from './ui/button'
import { Search } from 'lucide-react'
import { useDispatch } from 'react-redux'
import { setSearchedQuery } from '@/redux/jobSlice'
import { useNavigate } from 'react-router-dom'

const HeroSection = () => {
    const [query, setQuery] = useState("")
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const searchJobHandler = () => {
        dispatch(setSearchedQuery(query))
        navigate("/browse")
    }

    return (
        <section className="bg-white py-16 px-4 sm:px-6 lg:px-8 text-center">
            <div className="max-w-3xl mx-auto flex flex-col gap-6">
                {/* Badge */}
                <span className="inline-block bg-gray-100 text-[#F83002] font-medium text-sm px-4 py-2 rounded-full shadow-sm">
                     Job Hunt Website
                </span>

                {/* Title */}
                <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight text-gray-900">
                    Search, Apply &<br />
                    Get Your <span className="text-[#6A38C2]">Dream Jobs</span>
                </h1>

                {/* Description */}
                {/* <p className="text-gray-600 text-base sm:text-lg">
                    Lorem ipsum dolor sit amet consectetur adipisicing elit. Aliquid aspernatur temporibus nihil tempora dolor!
                </p> */}

                {/* Search Bar */}
                <div className="flex items-center max-w-xl mx-auto w-full rounded-full shadow-lg border border-gray-200 bg-white overflow-hidden">
                    <input
                        type="text"
                        placeholder="Find your dream jobs"
                        onChange={(e) => setQuery(e.target.value)}
                        className="flex-grow px-4 py-3 text-sm sm:text-base focus:outline-none"
                    />
                    <Button
                        onClick={searchJobHandler}
                        className="rounded-none rounded-r-full px-5 bg-[#6A38C2] hover:bg-[#5b30a6] text-white"
                    >
                        <Search className="h-5 w-5" />
                    </Button>
                </div>
            </div>
        </section>
    )
}

export default HeroSection
