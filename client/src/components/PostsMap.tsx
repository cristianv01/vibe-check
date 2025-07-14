"use client";

import React, { useRef, useEffect, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

import { Post } from '@/lib/api/posts';

// Set your Mapbox access token
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

interface PostsMapProps {
  posts: Post[];
  onPostClick?: (post: Post) => void;
  onMapBoundsChange?: (bounds: mapboxgl.LngLatBounds) => void;
  center?: [number, number];
  zoom?: number;
  className?: string;
}

interface MapMarker {
  id: string;
  post: Post;
  element: HTMLDivElement;
  popup?: mapboxgl.Popup;
}

export default function PostsMap({
  posts,
  onPostClick,
  onMapBoundsChange,
  center = [-74.006, 40.7128], 
  zoom = 12,
  className = "h-[600px] w-full"
}: PostsMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<MapMarker[]>([]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center,
      zoom,
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add geolocation control
    map.current.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true,
        },
        trackUserLocation: true,
        showUserHeading: true,
      }),
      'top-right'
    );

    // Handle map bounds change
    map.current.on('moveend', () => {
      if (onMapBoundsChange && map.current) {
        const bounds = map.current.getBounds();
        if (bounds) {
          onMapBoundsChange(bounds);
        }
      }
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [center, zoom, onMapBoundsChange]);

  // Create marker element
  const createMarkerElement = useCallback((): HTMLDivElement => {
    const markerEl = document.createElement('div');
    markerEl.className = 'cursor-pointer';
    markerEl.style.width = '40px';
    markerEl.style.height = '40px';
    markerEl.style.background = 'white';
    markerEl.style.borderRadius = '50%';
    markerEl.style.border = '3px solid #3b82f6';
    markerEl.style.display = 'flex';
    markerEl.style.alignItems = 'center';
    markerEl.style.justifyContent = 'center';
    markerEl.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
    markerEl.style.transition = 'transform 0.2s ease';

    // Add hover effect
    markerEl.addEventListener('mouseenter', () => {
      markerEl.style.transform = 'scale(1.1)';
    });
    markerEl.addEventListener('mouseleave', () => {
      markerEl.style.transform = 'scale(1)';
    });

    // Add icon
    const icon = document.createElement('div');
    icon.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`;
    markerEl.appendChild(icon);

    return markerEl;
  }, []);

  // Create popup content
  const createPopupContent = useCallback((post: Post): string => {
    return `
      <div class="p-4 max-w-xs">
        <div class="flex items-start gap-3">
          <div class="flex-shrink-0">
            <div class="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              ${post.author.profilePictureUrl 
                ? `<img src="${post.author.profilePictureUrl}" class="w-10 h-10 rounded-full object-cover" />`
                : `<span class="text-gray-600 font-semibold">${post.author.username.charAt(0).toUpperCase()}</span>`
              }
            </div>
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="font-semibold text-gray-900 truncate">${post.location.name}</h3>
            <p class="text-sm text-gray-600">by ${post.author.username}</p>
            <p class="text-sm text-gray-800 mt-1 line-clamp-2">${post.content}</p>
            ${post.tags && post.tags.length > 0 ? `
              <div class="flex flex-wrap gap-1 mt-2">
                ${post.tags.slice(0, 3).map(tag => 
                  `<span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">${tag.tagName}</span>`
                ).join('')}
                ${post.tags.length > 3 ? `<span class="text-xs text-gray-500">+${post.tags.length - 3} more</span>` : ''}
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }, []);

  // Update markers when posts change
  useEffect(() => {
    if (!map.current) return;

    // Remove existing markers
    markers.current.forEach(marker => {
      if (marker.popup) {
        marker.popup.remove();
      }
      if (marker.element.parentNode) {
        marker.element.parentNode.removeChild(marker.element);
      }
    });
    markers.current = [];

    // Add new markers
    posts.forEach(post => {
      if (!post.location || !post.location.coordinates) return;

      const markerEl = createMarkerElement();
      const popup = new mapboxgl.Popup({
        closeButton: true,
        closeOnClick: false,
        maxWidth: '300px',
      }).setHTML(createPopupContent(post));

      new mapboxgl.Marker(markerEl)
        .setLngLat([post.location.coordinates.longitude, post.location.coordinates.latitude])
        .setPopup(popup)
        .addTo(map.current!);

      // Handle marker click
      markerEl.addEventListener('click', () => {
        if (onPostClick) {
          onPostClick(post);
        }
      });

      markers.current.push({
        id: `post-${post.id}`,
        post,
        element: markerEl,
        popup,
      });
    });
  }, [posts, createMarkerElement, createPopupContent, onPostClick]);

      // Fit map to markers if no center is provided
    useEffect(() => {
      if (!map.current || posts.length === 0) return;

      const bounds = new mapboxgl.LngLatBounds();
      posts.forEach(post => {
        if (post.location && post.location.coordinates) {
          bounds.extend([post.location.coordinates.longitude, post.location.coordinates.latitude]);
        }
      });

      if (!bounds.isEmpty()) {
        map.current.fitBounds(bounds, {
          padding: 50,
          maxZoom: 15,
        });
      }
    }, [posts]);

  return (
    <div className={className}>
      <div ref={mapContainer} className="w-full h-full rounded-lg" />
    </div>
  );
} 