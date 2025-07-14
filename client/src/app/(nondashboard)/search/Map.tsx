"use client"
import React from 'react'
import {useRef, useEffect, useState} from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { useGetPostsQuery } from '@/state/api';
import { useAppSelector, useAppDispatch } from '@/state/redux'
import { Post } from '@/types/prismaTypes';
import { setFilters } from '@/state';

const Map = () => {
    const mapRef = useRef<mapboxgl.Map | null>(null)
    const mapContainerRef = useRef<HTMLDivElement>(null)
    const markersRef = useRef<mapboxgl.Marker[]>([])
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
    const dispatch = useAppDispatch();
    
    const filters = useAppSelector((state) => state.global.filters)

    const { data: posts, isLoading, error } = useGetPostsQuery({
        location: filters.location,
        tags: filters.tags,
        coordinates: filters.coordinates || undefined,
        page: 1,
        limit: 20
    });

    // Get user location (only once on mount)
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { longitude, latitude } = position.coords;
                    const coords = [longitude, latitude] as [number, number];
                    setUserLocation(coords);
                    // Only set coordinates if no search coordinates exist
                    if (!filters.coordinates) {
                        dispatch(setFilters({ coordinates: coords }));
                    }
                },
                (error) => {
                    console.log('Geolocation error:', error);
                    // Fallback to New York
                    const fallbackCoords = [-74.0060, 40.7128] as [number, number];
                    setUserLocation(fallbackCoords);
                    // Only set coordinates if no search coordinates exist
                    if (!filters.coordinates) {
                        dispatch(setFilters({ coordinates: fallbackCoords }));
                    }
                }
            );
        } else {
            // Fallback to New York if geolocation not supported
            const fallbackCoords = [-74.0060, 40.7128] as [number, number];
            setUserLocation(fallbackCoords);
            // Only set coordinates if no search coordinates exist
            if (!filters.coordinates) {
                dispatch(setFilters({ coordinates: fallbackCoords }));
            }
        }
    }, [dispatch]); // Remove filters.coordinates dependency

    // Initialize map
    useEffect(() => {
        if (!mapContainerRef.current || !userLocation || mapRef.current) return;

        mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';
        
        mapRef.current = new mapboxgl.Map({
            container: mapContainerRef.current,
            style: "mapbox://styles/mapbox/streets-v11",
            center: userLocation,
            zoom: 12,
        });

        // Add navigation controls
        mapRef.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

        // Add geolocation control
        mapRef.current.addControl(
            new mapboxgl.GeolocateControl({
                positionOptions: {
                    enableHighAccuracy: true,
                },
                trackUserLocation: true,
                showUserHeading: true,
            }),
            'top-right'
        );

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, [userLocation]);

    // Update map center when search coordinates change
    useEffect(() => {
        if (!mapRef.current || !filters.coordinates) return;
        
        console.log('Moving map to search coordinates:', filters.coordinates);
        mapRef.current.flyTo({
            center: filters.coordinates,
            zoom: 12,
            duration: 2000
        });
    }, [filters.coordinates]);

    // Update markers when posts change
    useEffect(() => {
        if (!mapRef.current || !posts) return;

        // Clear existing markers
        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];

        // Group posts by location coordinates
        const locationGroups = new globalThis.Map<string, Post[]>();
        posts.forEach((post: Post) => {
            if (!post.location?.coordinates) return;
            
            const coordKey = `${post.location.coordinates.longitude},${post.location.coordinates.latitude}`;
            if (!locationGroups.has(coordKey)) {
                locationGroups.set(coordKey, []);
            }
            locationGroups.get(coordKey)!.push(post);
        });

        // Add markers with offset for overlapping locations
        locationGroups.forEach((postsAtLocation: Post[], coordKey: string) => {
            const [lng, lat] = coordKey.split(',').map(Number);
            
            postsAtLocation.forEach((post: Post, index: number) => {
                // Calculate offset for overlapping markers
                const offset = postsAtLocation.length > 1 ? calculateOffset(index, postsAtLocation.length) : [0, 0];
                const offsetLng = lng + offset[0];
                const offsetLat = lat + offset[1];
                
                const marker = createMarker(post, mapRef.current!, [offsetLng, offsetLat]);
                markersRef.current.push(marker);
            });
        });
    }, [posts]);

    // Loading state
    if (isLoading) {
        return (
            <div className='basis-10/12 grow relative rounded-xl flex items-center justify-center'>
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-2"></div>
                    <p className="text-gray-600">Loading map...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className='basis-10/12 grow relative rounded-xl flex items-center justify-center'>
                <div className="text-center">
                    <p className="text-red-600 mb-2">Error loading map</p>
                    <p className="text-gray-600 text-sm">Please try refreshing the page</p>
                </div>
            </div>
        );
    }

    return (
        <div className='basis-10/12 grow relative rounded-xl'>
            <div className="map-container rounded-xl" ref={mapContainerRef} style={{height: "100%", width: "100%"}}></div>
        </div>
    );
};

// Calculate offset for overlapping markers
const calculateOffset = (index: number, total: number): [number, number] => {
    if (total <= 1) return [0, 0];
    
    // Create a small circle pattern for overlapping markers
    const angle = (index / total) * 2 * Math.PI;
    const radius = 0.0001; // Small offset in degrees (about 10-15 meters)
    
    return [
        radius * Math.cos(angle), // longitude offset
        radius * Math.sin(angle)  // latitude offset
    ];
};

const createMarker = (post: Post, map: mapboxgl.Map, customCoordinates?: [number, number]) => {
    // Create popup content
    const popupContent = `
        <div class="marker-popup">
            <div class="marker-popup-image">
                ${post.mediaUrl 
                    ? `<img src="${post.mediaUrl}" alt="${post.title || 'Post image'}" />`
                    : `<div class="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                         <span class="text-gray-600 text-xs">No image</span>
                       </div>`
                }
            </div>
            <div class="marker-popup-content">
                <h3 class="marker-popup-title">${post.title || 'Untitled Post'}</h3>
                <p class="text-sm text-gray-300 mb-2">by ${post.author.username}</p>
                <p class="text-sm mb-2">${post.content.substring(0, 100)}${post.content.length > 100 ? '...' : ''}</p>
                ${post.tags.length > 0 ? `
                    <div class="flex flex-wrap gap-1">
                        ${post.tags.slice(0, 3).map((tag: { id: number; tagName: string }) => 
                            `<span class="px-2 py-1 bg-blue-600 text-white text-xs rounded-full">${tag.tagName}</span>`
                        ).join('')}
                        ${post.tags.length > 3 ? `<span class="text-xs text-gray-400">+${post.tags.length - 3} more</span>` : ''}
                    </div>
                ` : ''}
            </div>
        </div>
    `;

    const coordinates = customCoordinates || [post.location.coordinates.longitude, post.location.coordinates.latitude];
    
    const marker = new mapboxgl.Marker()
        .setLngLat(coordinates)
        .setPopup(
            new mapboxgl.Popup({ closeButton: true, maxWidth: '300px' })
                .setHTML(popupContent)
        )
        .addTo(map);

    // Style the marker (black surrounding white circle)
    const markerElement = marker.getElement();
    const path = markerElement.querySelector("path[fill='#3FB1CE']");
    if (path) {
        path.setAttribute("fill", "#000000");
    }

    return marker;
};

export default Map