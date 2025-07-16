import { Heart, MapPin, Calendar, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { Post } from "@/types/prismaTypes";

interface CardCompactProps {
  post: Post;
  isFavorite: boolean;
  onFavoriteToggle: () => void;
  showFavoriteButton?: boolean;
  postLink?: string;
}

const CardCompact = ({
  post,
  isFavorite,
  onFavoriteToggle,
  showFavoriteButton = true,
  postLink,
}: CardCompactProps) => {
  const [imgSrc, setImgSrc] = useState(
    post.mediaUrl || "/placeholder.jpg"
  );

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-lg w-full flex h-40 mb-5">
      <div className="relative w-1/3">
        <Image
          src={imgSrc}
          alt={post.title || "Untitled Post"}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          onError={() => setImgSrc("/placeholder.jpg")}
        />
        <div className="absolute bottom-2 left-2 flex gap-1 flex-col">
          {post.tags && post.tags.length > 0 && (
            <span className="bg-white/80 text-black text-xs font-semibold px-2 py-1 rounded-full w-fit">
              {post.tags[0].tagName}
            </span>
          )}
          {post.location?.status === 'VERIFIED' && (
            <span className="bg-green-500/80 text-white text-xs font-semibold px-2 py-1 rounded-full">
              Verified
            </span>
          )}
        </div>
      </div>
      <div className="w-2/3 p-4 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start">
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
            {showFavoriteButton && (
              <button
                className="bg-white rounded-full p-1"
                onClick={onFavoriteToggle}
              >
                <Heart
                  className={`w-4 h-4 ${
                    isFavorite ? "text-red-500 fill-red-500" : "text-gray-600"
                  }`}
                />
              </button>
            )}
          </div>
          <p className="text-gray-600 mb-1 text-sm">
            <MapPin className="w-3 h-3 inline mr-1" />
            {post.location?.name}, {post.location?.address}
          </p>
          <div className="flex text-sm items-center">
            <Calendar className="w-3 h-3 text-blue-400 mr-1" />
            <span className="font-semibold">
              {new Date(post.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
        <div className="flex justify-between items-center text-sm">
          <div className="flex gap-2 text-gray-600">
            {post.author && (
              <span className="flex items-center">
                <User className="w-4 h-4 mr-1" />
                {post.author.username}
              </span>
            )}
          </div>

          <p className="text-base font-bold text-blue-600">
            View Details
          </p>
        </div>
      </div>
    </div>
  );
};

export default CardCompact;
