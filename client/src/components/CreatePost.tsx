import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
import { Button } from './ui/button'
import { Label } from './ui/label'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { useCreatePostMutation, useGenerateUploadUrlMutation } from '@/state/api'
import { MapPin, X, Upload, Tag, Plus, Navigation, Search } from 'lucide-react'
import Image from 'next/image'

interface CreatePostProps {
    variant?: 'default' | 'fab';
    children?: React.ReactNode;
}

interface CreatePostFormData {
    title: string;
    content: string;
    locationName: string;
    locationAddress: string;
    latitude: number;
    longitude: number;
    tags: string[];
    mediaUrl?: string;
}

const CreatePost = ({ variant = 'default', children }: CreatePostProps) => {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [filePreview, setFilePreview] = useState<string | null>(null)
    const [isDragOver, setIsDragOver] = useState(false)
    const [locationSearch, setLocationSearch] = useState('')
    const [locationResults, setLocationResults] = useState<any[]>([])
    const [isGeolocating, setIsGeolocating] = useState(false)
    const [isSearching, setIsSearching] = useState(false)
    const [selectedLocation, setSelectedLocation] = useState<{
        name: string;
        address: string;
        coordinates: [number, number];
        isManual?: boolean;
    } | null>(null)
    const [tagInput, setTagInput] = useState('')
    const [tags, setTags] = useState<string[]>([])

    const [createPost] = useCreatePostMutation()
    const [generateUploadUrl] = useGenerateUploadUrlMutation()

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
        watch
    } = useForm<CreatePostFormData>({
        defaultValues: {
            title: '',
            content: '',
            locationName: '',
            locationAddress: '',
            latitude: 0,
            longitude: 0,
            tags: []
        }
    })

    // Search for locations using Mapbox
    const searchLocation = async (query: string) => {
        if (!query.trim()) {
            setLocationResults([])
            return
        }

        setIsSearching(true)
        try {
            const response = await fetch(
                `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}&types=poi,address&limit=5`
            )
            const data = await response.json()
            setLocationResults(data.features || [])
        } catch (error) {
            console.error('Error searching location:', error)
            setLocationResults([])
        } finally {
            setIsSearching(false)
        }
    }

    // Handle location selection from search results
    const selectLocation = (location: any) => {
        const [lng, lat] = location.center
        setSelectedLocation({
            name: location.text,
            address: location.place_name,
            coordinates: [lng, lat]
        })
        setValue('locationName', location.text)
        setValue('locationAddress', location.place_name)
        setValue('latitude', lat)
        setValue('longitude', lng)
        setLocationSearch(location.place_name)
        setLocationResults([])
    }

    // Handle geolocation
    const handleGeolocation = async () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser')
            return
        }

        setIsGeolocating(true)
        try {
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 60000
                })
            })

            const { latitude, longitude } = position.coords
            
            // Reverse geocode to get location name
            const response = await fetch(
                `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}&types=poi,address&limit=1`
            )
            const data = await response.json()
            
            let locationName = 'My Location'
            let locationAddress = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
            
            if (data.features && data.features.length > 0) {
                const feature = data.features[0]
                locationName = feature.text || 'My Location'
                locationAddress = feature.place_name || locationAddress
            }

            setSelectedLocation({
                name: locationName,
                address: locationAddress,
                coordinates: [longitude, latitude]
            })
            
            setValue('locationName', locationName)
            setValue('locationAddress', locationAddress)
            setValue('latitude', latitude)
            setValue('longitude', longitude)
            setLocationSearch(locationAddress)
            
        } catch (error) {
            console.error('Error getting location:', error)
            alert('Unable to get your location. Please try again or search for a location.')
        } finally {
            setIsGeolocating(false)
        }
    }

    // Clear location selection
    const clearLocation = () => {
        setSelectedLocation(null)
        setLocationSearch('')
        setLocationResults([])
        setValue('locationName', '')
        setValue('locationAddress', '')
        setValue('latitude', 0)
        setValue('longitude', 0)
    }

    // Handle file selection
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            validateAndSetFile(file)
        }
    }

    // Validate and set file
    const validateAndSetFile = (file: File) => {
        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file')
            return
        }
        
        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024 // 5MB
        if (file.size > maxSize) {
            alert('File size must be less than 5MB')
            return
        }
        
        setSelectedFile(file)
        const reader = new FileReader()
        reader.onload = (e) => {
            setFilePreview(e.target?.result as string)
        }
        reader.readAsDataURL(file)
    }

    // Handle drag and drop
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragOver(true)
    }

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragOver(false)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragOver(false)
        
        const files = e.dataTransfer.files
        if (files.length > 0) {
            validateAndSetFile(files[0])
        }
    }

    // Handle tag addition
    const addTag = () => {
        const tag = tagInput.trim()
        if (tag && !tags.includes(tag)) {
            setTags([...tags, tag])
            setValue('tags', [...tags, tag])
            setTagInput('')
        }
    }

    // Handle tag removal
    const removeTag = (tagToRemove: string) => {
        const newTags = tags.filter(tag => tag !== tagToRemove)
        setTags(newTags)
        setValue('tags', newTags)
    }

    // Handle form submission
    const onSubmit = async (data: CreatePostFormData) => {
        if (!selectedLocation) {
            alert('Please select a location')
            return
        }

        setIsLoading(true)
        try {
            let mediaUrl: string | undefined = undefined

            // Upload image to S3 if selected
            if (selectedFile) {
                setIsUploading(true)
                try {
                    // Get pre-signed URL for upload
                    const uploadUrlResponse = await generateUploadUrl({
                        fileType: selectedFile.type,
                        fileName: selectedFile.name,
                        folder: 'posts'
                    }).unwrap()

                    // Upload file directly to S3
                    const uploadResponse = await fetch(uploadUrlResponse.uploadUrl, {
                        method: 'PUT',
                        body: selectedFile,
                        headers: {
                            'Content-Type': selectedFile.type,
                        },
                    })

                    if (!uploadResponse.ok) {
                        throw new Error('Failed to upload image to S3')
                    }

                    mediaUrl = uploadUrlResponse.fileUrl
                    console.log('Image uploaded successfully:', mediaUrl)
                } catch (uploadError) {
                    console.error('Error uploading image:', uploadError)
                    alert('Failed to upload image. Please try again.')
                    return
                } finally {
                    setIsUploading(false)
                }
            }

            // Use the selected location data
            const postData = {
                title: data.title,
                content: data.content,
                locationName: selectedLocation.name,
                locationAddress: selectedLocation.address,
                latitude: selectedLocation.coordinates[1], // latitude
                longitude: selectedLocation.coordinates[0], // longitude
                tags: data.tags,
                mediaUrl: mediaUrl
            }

            console.log('Submitting post data:', postData)
            await createPost(postData).unwrap()
            
            // Reset form and close modal
            reset()
            setSelectedFile(null)
            setFilePreview(null)
            setLocationSearch('')
            setSelectedLocation(null)
            setTags([])
            setOpen(false)
        } catch (error) {
            console.error('Error creating post:', error)
            // Show more specific error message
            if (error && typeof error === 'object' && 'status' in error) {
                if (error.status === 'FETCH_ERROR') {
                    alert('Network error: Unable to connect to server. Please check your connection and try again.')
                } else {
                    alert(`Error creating post: ${error.status}`)
                }
            } else {
                alert('Error creating post. Please try again.')
            }
        } finally {
            setIsLoading(false)
        }
    }
  
  return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {variant === 'fab' ? (
                    <Button 
                        variant="default" 
                        size="lg"
                        className="rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all duration-200 bg-primary-500 hover:bg-primary-600"
                    >
                        <Plus className="w-6 h-6" />
                    </Button>
                ) : (
                    children || <Button variant="outline">Create Post</Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create a Vibe</DialogTitle>
                    <DialogDescription>
                        Share your experience with the community
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Image Upload */}
                    <div className="space-y-2">
                        <Label>Image</Label>
                        <div 
                            className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                                isDragOver 
                                    ? 'border-blue-500 bg-blue-50' 
                                    : 'border-gray-300'
                            }`}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                        >
                            {filePreview ? (
                                <div className="relative">
                                    <Image
                                        src={filePreview}
                                        alt="Preview"
                                        width={200}
                                        height={200}
                                        className="mx-auto rounded-lg object-cover"
                                    />
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="sm"
                                        className="absolute top-2 right-2"
                                        onClick={() => {
                                            setSelectedFile(null)
                                            setFilePreview(null)
                                        }}
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            ) : (
                    <div>
                                    <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                                    <p className="text-sm text-gray-600 mb-2">
                                        Click to upload or drag and drop an image
                                    </p>
                                    <p className="text-xs text-gray-500 mb-3">
                                        Maximum file size: 5MB
                                    </p>
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="mt-2"
                                    />
                    </div>
                            )}
                        </div>
                    </div>

                    {/* Title */}
                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            placeholder="Give your post a title"
                            {...register('title')}
                        />
                    </div>

                    {/* Location */}
                    <div className="space-y-2">
                            <Label>Location</Label>
                        
                        {/* Location Search */}
                        <div className="space-y-3">
                            <div className="relative">
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <Input
                                            placeholder="Search for a location..."
                                            value={locationSearch}
                                            onChange={(e) => {
                                                setLocationSearch(e.target.value)
                                                searchLocation(e.target.value)
                                            }}
                                            className="pl-10"
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={clearLocation}
                                        disabled={!selectedLocation}
                                    >
                                        Clear
                                    </Button>
                                </div>
                                
                                {/* Search Results Dropdown */}
                                {locationResults.length > 0 && (
                                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                        {isSearching ? (
                                            <div className="p-3 text-center text-gray-500">
                                                Searching...
                        </div>
                                        ) : (
                                            locationResults.map((location, index) => (
                                                <button
                                                    key={index}
                                                    type="button"
                                                    className="w-full text-left px-4 py-3 hover:bg-gray-100 flex items-center border-b border-gray-100 last:border-b-0"
                                                    onClick={() => selectLocation(location)}
                                                >
                                                    <MapPin className="w-4 h-4 mr-3 text-gray-400 flex-shrink-0" />
                        <div>
                                                        <div className="font-medium text-gray-900">{location.text}</div>
                                                        <div className="text-sm text-gray-500">{location.place_name}</div>
                                                    </div>
                                                </button>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>
                            
                            {/* OR Divider */}
                            <div className="flex items-center">
                                <div className="flex-1 border-t border-gray-300"></div>
                                <span className="px-3 text-sm text-gray-500">OR</span>
                                <div className="flex-1 border-t border-gray-300"></div>
                            </div>
                            
                            {/* Geolocation Button */}
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleGeolocation}
                                disabled={isGeolocating}
                                className="w-full"
                            >
                                <Navigation className="w-4 h-4 mr-2" />
                                {isGeolocating ? 'Getting location...' : 'Use my current location'}
                            </Button>
                        </div>
                        
                        {/* Selected Location Display */}
                        {selectedLocation && (
                            <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-md">
                                <MapPin className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                                <div className="flex-1">
                                    <div className="font-medium text-green-800">{selectedLocation.name}</div>
                                    <div className="text-sm text-green-600">{selectedLocation.address}</div>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={clearLocation}
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="content">Description</Label>
                        <Textarea
                            id="content"
                            placeholder="Tell us about your experience..."
                            rows={4}
                            {...register('content', { required: 'Description is required' })}
                        />
                        {errors.content && (
                            <p className="text-sm text-red-600">{errors.content.message}</p>
                        )}
                    </div>

                    {/* Tags */}
                    <div className="space-y-2">
                        <Label>Tags</Label>
                        <div className="flex gap-2">
                            <Input
                                placeholder="Add a tag"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault()
                                        addTag()
                                    }
                                }}
                            />
                            <Button
                                type="button"
                                variant="outline"
                                onClick={addTag}
                                disabled={!tagInput.trim()}
                            >
                                <Tag className="w-4 h-4" />
                            </Button>
                        </div>
                        {tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {tags.map((tag, index) => (
                                    <span
                                        key={index}
                                        className="inline-flex items-center px-2 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                                    >
                                        {tag}
                                        <button
                                            type="button"
                                            onClick={() => removeTag(tag)}
                                            className="ml-1 text-blue-600 hover:text-blue-800"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading || isUploading || !selectedLocation}
                        >
                            {isUploading ? 'Uploading...' : isLoading ? 'Creating...' : 'Create Post'}
                        </Button>
                </div>
                </form>
            </DialogContent>
    </Dialog>
  )
}

export default CreatePost

