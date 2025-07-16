"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postFavorites = exports.posts = exports.tags = exports.locations = exports.owners = exports.users = void 0;
exports.users = [
    {
        cognitoId: 'cognito-user-01',
        username: 'nicovo',
        email: 'nickar8@gmail.com',
        profilePictureUrl: '/landing-icon-heart.png', // Using available image
        createdAt: new Date('2024-01-15T10:30:00Z'),
        updatedAt: new Date('2024-01-15T10:30:00Z'),
    },
    {
        cognitoId: 'cognito-user-02',
        username: 'yarny',
        email: 'yarny@example.com',
        profilePictureUrl: '/landing-icon-calendar.png', // Using available image
        createdAt: new Date('2025-02-15T14:15:00Z'),
        updatedAt: new Date('2025-02-15T14:15:00Z'),
    },
    {
        cognitoId: 'cognito-user-03',
        username: 'cris_test',
        email: 'charlie@example.com',
        profilePictureUrl: '/landing-icon-wand.png', // Using available image
        createdAt: new Date('2024-01-25T09:45:00Z'),
        updatedAt: new Date('2024-01-25T09:45:00Z'),
    },
];
exports.owners = [
    {
        cognitoId: 'cognito-owner-01',
        username: 'sunny_cafe_owner',
        email: 'owner@sunnycafe.com',
        profilePictureUrl: '/logo.svg', // Using your logo
        createdAt: new Date('2024-01-10T08:00:00Z'),
        updatedAt: new Date('2024-01-10T08:00:00Z'),
    },
];
exports.locations = [
    {
        name: 'My Apartment',
        address: 'Juliet Lane, 8031 Juliet Lane, Manassas, Virginia 20109, United States',
        coordinates: { type: 'Point', coordinates: [-77.5311859514143, 38.782568010619194] }, // Fixed: [longitude, latitude]
        createdAt: new Date('2025-01-26T12:00:00Z'),
        updatedAt: new Date('2025-01-26T12:00:00Z'),
    },
    {
        name: 'La Estrella',
        address: 'Calle 65 Sur 72-309 La Estrella, Antioquia, Colombia',
        coordinates: { type: 'Point', coordinates: [-75.6544568306821, 6.169692700667623] }, // Fixed: [longitude, latitude]
        createdAt: new Date('2025-02-15T16:30:00Z'),
        updatedAt: new Date('2024-01-15T16:30:00Z'),
    },
    {
        name: 'Sunset Dumpling House',
        address: '789 Noodle Way, San Francisco, CA 94122',
        coordinates: { type: 'Point', coordinates: [-122.4834, 37.7592] },
        createdAt: new Date('2024-01-18T11:20:00Z'),
        updatedAt: new Date('2024-01-18T11:20:00Z'),
    },
    {
        name: 'Sunny Cafe',
        address: '101 Sunshine Ave, San Francisco, CA 94107',
        coordinates: { type: 'Point', coordinates: [-122.4065, 37.7857] },
        createdAt: new Date('2024-01-22T13:45:00Z'),
        updatedAt: new Date('2024-01-22T13:45:00Z'),
    },
    {
        name: 'National Bonsai Museum',
        address: '3501 New York Ave NE, Washington, DC 20002',
        coordinates: { type: 'Point', coordinates: [-76.96943169143344, 38.91238492848372] },
        createdAt: new Date('2024-05-15T10:00:00Z'),
        updatedAt: new Date('2024-05-15T10:00:00Z'),
    },
];
exports.tags = [
    { tagName: '#GoodForDates', createdAt: new Date('2024-01-01T00:00:00Z'), updatedAt: new Date('2024-01-01T00:00:00Z') },
    { tagName: '#Quiet', createdAt: new Date('2024-01-01T00:00:00Z'), updatedAt: new Date('2024-01-01T00:00:00Z') },
    { tagName: '#LGBTQFriendly', createdAt: new Date('2024-01-01T00:00:00Z'), updatedAt: new Date('2024-01-01T00:00:00Z') },
    { tagName: '#WorkFriendly', createdAt: new Date('2024-01-01T00:00:00Z'), updatedAt: new Date('2024-01-01T00:00:00Z') },
    { tagName: '#LiveMusic', createdAt: new Date('2024-01-01T00:00:00Z'), updatedAt: new Date('2024-01-01T00:00:00Z') },
    { tagName: '#Accessible', createdAt: new Date('2024-01-01T00:00:00Z'), updatedAt: new Date('2024-01-01T00:00:00Z') },
    { tagName: '#PetFriendly', createdAt: new Date('2024-01-01T00:00:00Z'), updatedAt: new Date('2024-01-01T00:00:00Z') },
    { tagName: '#VeganOptions', createdAt: new Date('2024-01-01T00:00:00Z'), updatedAt: new Date('2024-01-01T00:00:00Z') },
    { tagName: '#Educational', createdAt: new Date('2024-01-01T00:00:00Z'), updatedAt: new Date('2024-01-01T00:00:00Z') },
    { tagName: '#Nature', createdAt: new Date('2024-01-01T00:00:00Z'), updatedAt: new Date('2024-01-01T00:00:00Z') },
    { tagName: '#Peaceful', createdAt: new Date('2024-01-01T00:00:00Z'), updatedAt: new Date('2024-01-01T00:00:00Z') },
    { tagName: '#Sadness', createdAt: new Date('2024-01-01T00:00:00Z'), updatedAt: new Date('2024-01-01T00:00:00Z') },
    { tagName: '#NextYear', createdAt: new Date('2024-01-01T00:00:00Z'), updatedAt: new Date('2024-01-01T00:00:00Z') },
];
exports.posts = [
    {
        userEmail: 'nickar8@gmail.com',
        locationName: 'My Apartment',
        title: 'Commanders Fumble',
        content: 'We had a good season #Sadness #NextYear',
        mediaUrl: '/commanders.jpg', // Using real image
        createdAt: new Date('2025-01-26T12:00:00Z'),
        updatedAt: new Date('2025-01-26T12:00:00Z'),
    },
    {
        userEmail: 'yarny@example.com',
        locationName: 'La Estrella',
        title: 'Birthday Debut',
        content: 'Delicious steak with a great view',
        mediaUrl: '/estrella.jpg', // Using estrella image
        createdAt: new Date('2025-02-15T16:30:00Z'),
        updatedAt: new Date('2025-02-15T16:30:00Z'),
    },
    {
        userEmail: 'bob@example.com',
        locationName: 'Sunset Dumpling House',
        title: 'Spicy Wontons',
        content: 'Came back again! The spicy wontons are also incredible. It can get a bit loud during peak hours though.',
        mediaUrl: '/landing-search2.png', // Using real image
        createdAt: new Date('2024-02-05T19:45:00Z'),
        updatedAt: new Date('2024-02-05T19:45:00Z'),
    },
    {
        userEmail: 'charlie@example.com',
        locationName: 'Bytes & Brews Bistro',
        title: 'First Date Spot',
        content: "Fantastic spot for a first date. The lighting is just right and the music isn't too loud. #GoodForDates",
        mediaUrl: '/singlelisting-2.jpg', // Using real image
        createdAt: new Date('2024-02-07T20:00:00Z'),
        updatedAt: new Date('2024-02-07T20:00:00Z'),
    },
    {
        userEmail: 'charlie@example.com',
        locationName: 'National Bonsai Museum',
        title: 'Big Tree Fans',
        content: 'Absolutely stunning collection of bonsai trees! So peaceful and meditative. A hidden gem in DC. #Nature #Peaceful #Educational',
        mediaUrl: '/bonsai.jpg', // Using bonsai image
        createdAt: new Date('2024-06-01T14:30:00Z'),
        updatedAt: new Date('2024-06-01T14:30:00Z'),
    },
];
// postFavorites: userEmail, postContent (to match post), favoritedAt
exports.postFavorites = [
    // Alice favorites her own post at The Daily Grind
    {
        userEmail: 'alice@example.com',
        postContent: 'Absolutely love the quiet ambiance here. Perfect for getting work done. The espresso is top-notch! #WorkFriendly #Quiet',
        createdAt: new Date('2024-02-01T10:30:00Z'),
        updatedAt: new Date('2024-02-01T10:30:00Z'),
    },
    // Bob favorites Charlie's post at Bytes & Brews Bistro
    {
        userEmail: 'bob@example.com',
        postContent: "Fantastic spot for a first date. The lighting is just right and the music isn't too loud. #GoodForDates",
        createdAt: new Date('2024-02-08T08:15:00Z'),
        updatedAt: new Date('2024-02-08T08:15:00Z'),
    },
    // Nicovo favorites Charlie's post at National Bonsai Museum
    {
        userEmail: 'nickar8@gmail.com',
        postContent: 'Absolutely stunning collection of bonsai trees! So peaceful and meditative. A hidden gem in DC. #Nature #Peaceful #Educational',
        createdAt: new Date('2024-06-02T10:00:00Z'),
        updatedAt: new Date('2024-06-02T10:00:00Z'),
    },
];
