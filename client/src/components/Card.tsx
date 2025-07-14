import { Heart, MapPin, Calendar, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { Post } from "@/types/prismaTypes";

interface CardProps {
    post: Post;
    isFavorite: boolean;
    onFavoriteToggle: () => void;
    showFavoriteButton?: boolean;
    postLink?: string;
}

const Card = ({
    post,
    isFavorite,
    onFavoriteToggle,
    showFavoriteButton = true,
    postLink,
}: CardProps) => {
    
    const [imgSrc, setImageSrc] = useState(post.mediaUrl || "/placeholder.jpg")
    
    return (
        <div className="bg-white rounded-xl overflow-hidden shadow-lg w-full mb-5">
            <div className="relative">
                <div className="w-full h-48 relative">
                    <Image
                        src={imgSrc}
                        alt={post.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        onError={() => setImageSrc("/placeholder.jpg")}
                    />
                </div>
                <div className="absolute bottom-4 left-4 flex gap-2">
                    {post.tags && post.tags.length > 0 && (
                        <span className="bg-white/80 text-black text-xs font-semibold px-2 py-1 rounded-full">
                            {post.tags[0].tagName}
                        </span>
                    )}
                    {post.isActive && (
                        <span className="bg-green-500/80 text-white text-xs font-semibold px-2 py-1 rounded-full">
                            Active
                        </span>
                    )}
                </div>
                {showFavoriteButton && (
                    <button
                        className="absolute bottom-4 right-4 bg-white hover:bg-white/90 rounded-full p-2 cursor-pointer"
                        onClick={onFavoriteToggle}
                    >
                        <Heart
                            className={`w-5 h-5 ${isFavorite ? "text-red-500 fill-red-500" : "text-gray-600"}`}
                        />
                    </button>
                )}
            </div>
            <div className="p-4">
                <h2 className="text-xl font-bold mb-1">
                    {postLink ? (
                        <Link
                            href={postLink}
                            className="hover:underline hover:text-blue-600"
                            scroll={false}
                        >
                            {post.title || "Untitled Post"}
                        </Link>
                    ) : (
                        post.title || "Untitled Post"
                    )}
                </h2>
                <p className="text-gray-600 mb-2">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    {post.location?.name}, {post.location?.address}
                </p>
                <div className="flex justify-between items-center">
                    <div className="flex items-center mb-2">
                        <Calendar className="w-4 h-4 text-blue-400 mr-1" />
                        <span className="font-semibold">
                            {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                    </div>
                    {post.price && (
                        <p className="text-lg font-bold mb-3">
                            ${post.price}{" "}
                            <span className="text-gray-600 text-base font-normal"> /event</span>
                        </p>
                    )}
                </div>
                <hr />
                <div className="flex justify-between items-center gap-4 text-gray-600 mt-5">
                    {post.author && (
                        <span className="flex items-center">
                            <User className="w-5 h-5 mr-2" />
                            {post.author.username}
                        </span>
                    )}
                    {post.tags && post.tags.length > 0 && (
                        <span className="flex items-center">
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                {post.tags[0].tagName}
                            </span>
                        </span>
                    )}
                    <span className="flex items-center text-blue-600 font-semibold">
                        View Details
                    </span>
                </div>
            </div>
        </div>
    );
};

export default Card;
