// Mock Collections Data
export const mockCollections = [
    {
        id: '1',
        image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800',
        title: 'Minimalist Workspace',
        subtitle: 'Clean and productive desk setups',
        link: '/collections/1',
        creator: {
            name: 'Sarah Chen',
            avatar: 'https://i.pravatar.cc/150?img=1',
            username: 'sarahchen'
        },
        itemCount: 24,
        category: 'Design',
        createdAt: '2024-01-15'
    },
    {
        id: '2',
        image: 'https://images.unsplash.com/photo-1493612276216-ee3925520721?w=800',
        title: 'Urban Architecture',
        subtitle: 'Modern cityscapes and buildings',
        link: '/collections/2',
        creator: {
            name: 'Alex Rivera',
            avatar: 'https://i.pravatar.cc/150?img=2',
            username: 'alexrivera'
        },
        itemCount: 45,
        category: 'Architecture',
        createdAt: '2024-01-14'
    },
    {
        id: '3',
        image: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?w=800',
        title: 'Retro Tech',
        subtitle: 'Vintage cameras and equipment',
        link: '/collections/3',
        creator: {
            name: 'Mike Johnson',
            avatar: 'https://i.pravatar.cc/150?img=3',
            username: 'mikej'
        },
        itemCount: 18,
        category: 'Tech',
        createdAt: '2024-01-13'
    },
    {
        id: '4',
        image: 'https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?w=800',
        title: 'Nature Photography',
        subtitle: 'Breathtaking landscapes and wildlife',
        link: '/collections/4',
        creator: {
            name: 'Emma Wilson',
            avatar: 'https://i.pravatar.cc/150?img=4',
            username: 'emmaw'
        },
        itemCount: 67,
        category: 'Photography',
        createdAt: '2024-01-12'
    },
    {
        id: '5',
        image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800',
        title: 'Fashion Forward',
        subtitle: 'Contemporary style inspiration',
        link: '/collections/5',
        creator: {
            name: 'Olivia Davis',
            avatar: 'https://i.pravatar.cc/150?img=5',
            username: 'oliviad'
        },
        itemCount: 92,
        category: 'Fashion',
        createdAt: '2024-01-11'
    },
    {
        id: '6',
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
        title: 'Interior Elegance',
        subtitle: 'Luxurious home design ideas',
        link: '/collections/6',
        creator: {
            name: 'James Lee',
            avatar: 'https://i.pravatar.cc/150?img=6',
            username: 'jameslee'
        },
        itemCount: 38,
        category: 'Interior',
        createdAt: '2024-01-10'
    },
    {
        id: '7',
        image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800',
        title: 'Coffee Culture',
        subtitle: 'Artisanal coffee and cafe vibes',
        link: '/collections/7',
        creator: {
            name: 'Sophia Martinez',
            avatar: 'https://i.pravatar.cc/150?img=7',
            username: 'sophiam'
        },
        itemCount: 56,
        category: 'Lifestyle',
        createdAt: '2024-01-09'
    },
    {
        id: '8',
        image: 'https://images.unsplash.com/photo-1523961131990-5ea7c61b2107?w=800',
        title: 'Abstract Art',
        subtitle: 'Contemporary abstract compositions',
        link: '/collections/8',
        creator: {
            name: 'David Kim',
            avatar: 'https://i.pravatar.cc/150?img=8',
            username: 'davidk'
        },
        itemCount: 29,
        category: 'Art',
        createdAt: '2024-01-08'
    },
    {
        id: '9',
        image: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800',
        title: 'Typography Showcase',
        subtitle: 'Beautiful lettering and fonts',
        link: '/collections/9',
        creator: {
            name: 'Rachel Brown',
            avatar: 'https://i.pravatar.cc/150?img=9',
            username: 'rachelb'
        },
        itemCount: 41,
        category: 'Design',
        createdAt: '2024-01-07'
    },
    {
        id: '10',
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
        title: 'Mountain Escapes',
        subtitle: 'Serene mountain landscapes',
        link: '/collections/10',
        creator: {
            name: 'Chris Anderson',
            avatar: 'https://i.pravatar.cc/150?img=10',
            username: 'chrisa'
        },
        itemCount: 33,
        category: 'Travel',
        createdAt: '2024-01-06'
    },
    {
        id: '11',
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
        title: 'Sneaker Collection',
        subtitle: 'Limited edition kicks',
        link: '/collections/11',
        creator: {
            name: 'Tyler Scott',
            avatar: 'https://i.pravatar.cc/150?img=11',
            username: 'tylers'
        },
        itemCount: 48,
        category: 'Fashion',
        createdAt: '2024-01-05'
    },
    {
        id: '12',
        image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800',
        title: 'Coding Setup',
        subtitle: 'Developer workstations and tools',
        link: '/collections/12',
        creator: {
            name: 'Jessica Taylor',
            avatar: 'https://i.pravatar.cc/150?img=12',
            username: 'jessicat'
        },
        itemCount: 21,
        category: 'Tech',
        createdAt: '2024-01-04'
    }
];

// Mock User Profiles Data
export const mockUsers = [
    {
        id: '1',
        username: 'alexrivera',
        fullName: 'Alex Rivera',
        avatar: 'https://i.pravatar.cc/150?img=2',
        bio: 'Creative Director & Visual Artist. Exploring the intersection of brand identity and digital experience. Let\'s create something meaningful.',
        location: 'New York, NY',
        website: 'https://alexrivera.design',
        stats: {
            collections: 1200,
            followers: 45000,
            following: 800
        },
        isFollowing: false,
        isOwnProfile: false,
        collections: mockCollections.slice(0, 6)
    },
    {
        id: '2',
        username: 'sarahchen',
        fullName: 'Sarah Chen',
        avatar: 'https://i.pravatar.cc/150?img=1',
        bio: 'UX Designer crafting delightful digital experiences. Minimalism enthusiast. Coffee addict ☕',
        location: 'San Francisco, CA',
        website: 'https://sarahchen.co',
        stats: {
            collections: 856,
            followers: 32000,
            following: 543
        },
        isFollowing: true,
        isOwnProfile: false,
        collections: mockCollections.slice(2, 8)
    }
];

// Categories
export const categories = [
    'All',
    'Design',
    'Architecture',
    'Tech',
    'Photography',
    'Fashion',
    'Interior',
    'Lifestyle',
    'Art',
    'Travel'
];

// Helper function to get random collections
export const getRandomCollections = (count = 12) => {
    const shuffled = [...mockCollections].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
};

// Helper function to get collections by category
export const getCollectionsByCategory = (category) => {
    if (category === 'All') return mockCollections;
    return mockCollections.filter(c => c.category === category);
};

// Helper function to get user by username
export const getUserByUsername = (username) => {
    return mockUsers.find(u => u.username === username) || mockUsers[0];
};
