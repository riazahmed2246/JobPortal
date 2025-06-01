import React from 'react';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from './ui/carousel';
import { Button } from './ui/button';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setSearchedQuery } from '@/redux/jobSlice';

const categories = [
    "Frontend Developer",
    "Backend Developer",
    "Data Science",
    "Graphic Designer",
    "FullStack Developer",
     "Full Stack Engineer"
];

const CategoryCarousel = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const searchJobHandler = (query) => {
        dispatch(setSearchedQuery(query));
        navigate("/browse");
    };

    return (
        <section className="w-full px-4 lg:px-0 my-20">
            <h2 className="text-2xl font-semibold text-center mb-8 text-gray-800">
                Browse by <span className="text-[#6A38C2]">Job Category</span>
            </h2>

            <Carousel className="w-full max-w-5xl mx-auto">
                <CarouselContent>
                    {categories.map((cat, index) => (
                        <CarouselItem
                            key={index}
                            className="basis-2/3 sm:basis-1/2 md:basis-1/3 lg:basis-1/4 px-2"
                        >
                            <Button
                                onClick={() => searchJobHandler(cat)}
                                variant="outline"
                                className="w-full py-6 rounded-xl text-sm sm:text-base font-medium hover:bg-[#6A38C2] hover:text-white transition-colors"
                            >
                                {cat}
                            </Button>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious className="left-[-1.5rem]" />
                <CarouselNext className="right-[-1.5rem]" />
            </Carousel>
        </section>
    );
};

export default CategoryCarousel;
