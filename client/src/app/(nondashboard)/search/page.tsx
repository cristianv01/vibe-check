/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import React, { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAppDispatch, useAppSelector } from '@/state/redux';
import { setFilters } from '@/state';
import { cleanParams } from '@/lib/utils';
import { NAVBAR_HEIGHT } from '@/lib/constants';
import FiltersBar from './FiltersBar';
import FiltersFull from './FiltersFull';
import Map from './Map';
import PostBar from './PostBar';
const SearchPage = () => {
    const searchParams = useSearchParams();
    const dispatch = useAppDispatch();
    const isFiltersFullOpen = useAppSelector(
        (state) => state.global.isFiltersFullOpen

    )

    useEffect(() => {
        const initialFilters = Array.from(searchParams.entries()).reduce((acc: Record<string, any>, [key, value]) => {
            if(key === "tags"){
                acc[key] = value.split(",").map((v) => (v === "" ? null : v))
            }else if(key === "location"){
                acc[key] = value === "" ? null : value
            }else{
                acc[key] = value === "" ? null : value
            }
            return acc;
        }, {});
        
        const cleanFilters = cleanParams(initialFilters);
        // Set the initial filters in the Redux store
        dispatch(setFilters(cleanFilters));
    }, []); // eslint-disable-line react-hooks/exhaustive-deps
    return (
        <div className="w-full mx-auto px-5 flex flex-col gap-5"
            style={{
                height: `calc(100vh - ${NAVBAR_HEIGHT}px)`,
             
            }}
        >
            <FiltersBar/>
            <div className="flex justify-between flex-1 overflow-hidden gap-3 mb-5">
                <div
                    className={`h-full overflow-auto transition-all duration-300 ease-in-out ${isFiltersFullOpen ? "w-3/12 opacity-100 visible":"w-0 opacity-0 invisible"}`  }              
                >
                        <FiltersFull></FiltersFull>
                </div>
                <Map/>
         
                <div className="basis-4/12 overflow-y-auto"> <PostBar/> </div>
            </div>
     
        </div>
    )
    }

export default SearchPage
