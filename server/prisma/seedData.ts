
export const users = [
  {
    cognitoId: 'cognito-user-01',
    username: 'alice_explores',
    email: 'alice@example.com',
    profilePictureUrl: 'https://placehold.co/400x400/EEDC82/292524?text=A',
  },
  {
    cognitoId: 'cognito-user-02',
    username: 'bob_foodie',
    email: 'bob@example.com',
    profilePictureUrl: 'https://placehold.co/400x400/A3B8A3/292524?text=B',
  },
  {
    cognitoId: 'cognito-user-03',
    username: 'charlie_vibes',
    email: 'charlie@example.com',
    profilePictureUrl: 'https://placehold.co/400x400/E17A4D/FEFBF6?text=C',
  },
];

export const owners = [
  {
    cognitoId: 'cognito-owner-01',
    username: 'sunny_cafe_owner',
    email: 'owner@sunnycafe.com',
    profilePictureUrl: 'https://placehold.co/400x400/DDAA00/4A2E2A?text=S',
  },
];

export const locations = [
  {
    name: 'The Daily Grind',
    address: '123 Coffee Bean Blvd, San Francisco, CA 94102',
    coordinates: { type: 'Point', coordinates: [-122.4194, 37.7749] },
  },
  {
    name: 'Bytes & Brews Bistro',
    address: '456 Tech Terrace, San Francisco, CA 94105',
    coordinates: { type: 'Point', coordinates: [-122.3949, 37.7941] },
  },
  {
    name: 'Sunset Dumpling House',
    address: '789 Noodle Way, San Francisco, CA 94122',
    coordinates: { type: 'Point', coordinates: [-122.4834, 37.7592] },
  },
  {
    name: 'Sunny Cafe',
    address: '101 Sunshine Ave, San Francisco, CA 94107',
    coordinates: { type: 'Point', coordinates: [-122.4065, 37.7857] },
  },
];

export const tags = [
  { tagName: '#GoodForDates' },
  { tagName: '#Quiet' },
  { tagName: '#LGBTQFriendly' },
  { tagName: '#WorkFriendly' },
  { tagName: '#LiveMusic' },
  { tagName: '#Accessible' },
  { tagName: '#PetFriendly' },
  { tagName: '#VeganOptions' },
];

export const posts = [
  {
    userEmail: 'alice@example.com',
    locationName: 'The Daily Grind',
    content:
      'Absolutely love the quiet ambiance here. Perfect for getting work done. The espresso is top-notch! #WorkFriendly #Quiet',
    mediaUrl: 'https://placehold.co/600x400/A3B8A3/FFFFFF?text=Post+from+Alice',
  },
  {
    userEmail: 'bob@foodie.com',
    locationName: 'Sunset Dumpling House',
    content: 'These are the best soup dumplings in the city, hands down. A must-try.',
  },
  {
    userEmail: 'bob@example.com',
    locationName: 'Sunset Dumpling House',
    content:
      'Came back again! The spicy wontons are also incredible. It can get a bit loud during peak hours though.',
    mediaUrl: 'https://placehold.co/600x400/EEDC82/FFFFFF?text=Post+from+Bob',
  },
  {
    userEmail: 'charlie@example.com',
    locationName: 'Bytes & Brews Bistro',
    content:
      
        "Fantastic spot for a first date. The lighting is just right and the music isn't too loud. #GoodForDates",
  },
  {
    userEmail: 'alice@example.com',
    locationName: 'Sunny Cafe',
    content:
      'A very cute cafe with great natural light. However, the wifi was a bit spotty during my visit.',
  },
];

// postFavorites: userEmail, postContent (to match post), favoritedAt (optional)
export const postFavorites = [
  // Alice favorites her own post at The Daily Grind
  {
    userEmail: 'alice@example.com',
    postContent:
      'Absolutely love the quiet ambiance here. Perfect for getting work done. The espresso is top-notch! #WorkFriendly #Quiet',
  },
  // Bob favorites Charlie's post at Bytes & Brews Bistro
  {
    userEmail: 'bob@example.com',
    postContent:
      "Fantastic spot for a first date. The lighting is just right and the music isn't too loud. #GoodForDates",
  },
  // Charlie favorites Alice's post at Sunny Cafe
  {
    userEmail: 'charlie@example.com',
    postContent:
      'A very cute cafe with great natural light. However, the wifi was a bit spotty during my visit.',
  },
];