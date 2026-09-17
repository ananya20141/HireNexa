import React from 'react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from './ui/carousel';
import { Button } from './ui/button';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setSearchedQuery } from '@/redux/jobSlice';

const category = [
    "Frontend Developer",
    "Backend Developer",
    "Data Science",
    "Graphic Designer",
    "FullStack Developer"
];

const CategoryCarousel = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const searchJobHandler = (query) => {
        dispatch(setSearchedQuery(query));
        navigate("/browse");
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Carousel className="w-full max-w-xl mx-auto my-16">
                <CarouselContent>
                    {
                        category.map((cat, index) => (
                            <CarouselItem key={index} className="basis-1/2 sm:basis-1/3">
                                <Button 
                                    onClick={()=>searchJobHandler(cat)} 
                                    variant="outline" 
                                    className="w-full rounded-xl border border-surface-border bg-surface text-text-primary hover:text-accent hover:border-accent hover:bg-muted shadow-warm-sm transition-colors font-semibold text-xs py-2"
                                >
                                    {cat}
                                </Button>
                            </CarouselItem>
                        ))
                    }
                </CarouselContent>
                <CarouselPrevious className="border-surface-border bg-surface text-text-secondary hover:text-accent hover:bg-muted" />
                <CarouselNext className="border-surface-border bg-surface text-text-secondary hover:text-accent hover:bg-muted" />
            </Carousel>
        </div>
    );
};

export default CategoryCarousel;