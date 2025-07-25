import { LucideIcon } from "lucide-react";
import { AuthUser } from "aws-amplify/auth";
// Import all necessary types from the Prisma client
import { User, Owner, Post, Location, Tag, OfficialResponse, Follow } from "@prisma/client";

// --- Extended Prisma Types (with relations) ---
// It's a best practice to create specific types for frontend use that include relations.
// This avoids having to pass around complex generic types from Prisma.

export type PostWithRelations = Post & {
  author: User;
  location: Location;
  tags: { tag: Tag }[]; // Prisma represents the link table result this way
  officialResponse?: OfficialResponse | null;
};

export type UserWithRelations = User & {
  posts: Post[];
  following: Follow[];
  followedBy: Follow[];
};

export type OwnerWithRelations = Owner & {
  claimedLocations: Location[];
  officialResponses: OfficialResponse[];
};

export type LocationWithRelations = Location & {
  posts: PostWithRelations[];
  claimedBy?: Owner | null;
};


// --- Global Declarations ---
declare global {

  // --- App State & Context Types ---

  // Represents the fully authenticated user object available throughout the app context.
  interface AuthenticatedUser {
    cognitoInfo: AuthUser; // From AWS Amplify for session/token management
    dbInfo: User | Owner;  // From our database for profile info, etc.
    userType: 'user' | 'owner'; // Type to distinguish between User and Owner
  }


  // --- UI Component Prop Interfaces ---

  // For links in the sidebar or other navigation elements.
  interface SidebarLinkProps {
    href: string;
    icon: LucideIcon;
    label: string;
  }

  // For the main interactive map component.
  interface MapViewProps {
    locations: LocationWithRelations[];
    initialCenter: { lat: number; lng: number };
    onMarkerClick: (location: LocationWithRelations) => void;
  }

  // For displaying a single post card in a feed or as a map popup.
  interface PostCardProps {
    post: PostWithRelations;
    onSelectPost?: (post: PostWithRelations) => void; // Optional for different contexts
  }

  // For the modal that shows post details or allows creation.
  interface PostModalProps {
    isOpen: boolean;
    onClose: () => void;
    post?: PostWithRelations; // Provide to view an existing post
    location?: Location;      // Provide to create a new post for a specific location
  }
  
  // For displaying a summary of a location, perhaps in search results.
  interface LocationCardProps {
    location: LocationWithRelations;
  }
  
  // For the header section of a user's public profile page.
  interface ProfileHeaderProps {
    user: UserWithRelations | OwnerWithRelations;
    isCurrentUser: boolean; // To show/hide "Edit Profile" buttons
  }

  // For the form where users can update their settings.
  interface SettingsFormProps {
    initialData: Partial<User | Owner>; // Form might only update a subset of user/owner fields
    onSubmit: (data: Partial<User | Owner>) => Promise<void>;
    userType: "user" | "owner";
  }

  // For the main application Navbar.
  interface NavbarProps {
    user?: AuthenticatedUser; // User might be logged in or not
  }

}

// This is required to make the file a module and allow global declarations.
export {};
