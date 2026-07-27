import { Product, ChatConversation, CommunityPost, OrderItem, SellerProfile, DoloAffiliate, PendingProductApproval } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Jordan 1 Retro High OG',
    category: 'Footwear',
    price: 45000,
    currency: 'MWK',
    image: 'https://lh3.googleusercontent.com/aida/AP1WRLvydygMkF2gVHxXlx2xYr6grdMQHtrMNVcQcWihI2WRVAi-jWeOQcgJhDtb5iVJ4bY4naAlGiMEDOyiFgLrRxxIxCVo2OzOpzA_Jqpp5-FBwFhXQKFg5ncdrY7np4xTWbH-STsKCPotdhJg5RY3Q3J580VpO0JgxLJPOiXOaKy7KW3gD56ZmH_hUkcP9hqG3HbaPYi9p8NsO9jKoU300UqDLVyU9Of4XlBP8ZeBnMjc3eZDTs1VOg94_UI',
    description: 'Iconic high-top sneaker crafted with premium leather, classic color blocking and air cushioning.',
    sellerName: 'Malawi Electronics',
    sellerVerified: true,
    commission: 5,
    likesCount: 340,
    viewsCount: 1200,
    stock: 8,
    badge: 'HOT',
    rating: 4.9,
    status: 'Approved'
  },
  {
    id: 'prod-2',
    name: 'Puma Suede Heritage',
    category: 'Footwear',
    price: 85000,
    currency: 'MWK',
    image: 'https://lh3.googleusercontent.com/aida/AP1WRLu9yxSl_W_rC2zoC3mP8qMwR49x0eLVybu7LAPB3wGup9bf1OUbcDXDcWUZ792ZYeGYaBXFzwikgY7F0v0e5ktCyJD_SYHCSupXjXA5XzN0vb98VFFrvZ0BprxDO0vk5bEkzuDhl3s7ti1nXSmkMoG2t0J_nyFicuZOP1XZaO01OkVh_zYJcstt9BXc-w1fp_B10gyAF3yX3sz1wrKXQP9U_GpInVpZkQd6dy4i1jxBa4PujDs53o4l1hQ',
    description: 'Timeless suede low-top classic with soft texture and rubber cupsole.',
    sellerName: 'Zimba Fashion',
    sellerVerified: true,
    commission: 8,
    likesCount: 215,
    viewsCount: 850,
    stock: 14,
    badge: 'NEW',
    rating: 4.7,
    status: 'Approved'
  },
  {
    id: 'prod-3',
    name: 'Zara Cargo Collection',
    category: 'Fashion',
    price: 35000,
    currency: 'MWK',
    image: 'https://lh3.googleusercontent.com/aida/AP1WRLsomHc4ZcdkJK7SUfjaD2kRGG40_Iz3rR5ePms3Pb7f6uAJ5shwJ53cKabNYhb37nbRDknnehQ71JZKhYhGk_vPiYiKxV2GVg4IHAgEyV7vYjAFk5qDZ-TgSEXE-qIHvomMY7zuRpjg3paTFQG34bof7ie6HILPuiWjiVGMIxIxva8ozqzMQWQFtY4gKv45oiyprgPrdmakKx8wnvd3PFthAvZ8cA5s8D3ypFzv9d32pQm1PphwFj8MITk',
    description: 'Relaxed fit utility cargo trousers with side flap pockets and durable cotton twill fabric.',
    sellerName: 'Streetwear Blantyre',
    sellerVerified: true,
    commission: 5,
    likesCount: 430,
    viewsCount: 1420,
    stock: 22,
    badge: 'FEATURED',
    rating: 4.8,
    status: 'Approved'
  },
  {
    id: 'prod-4',
    name: 'Luxe Leather Tote',
    category: 'Luxury Bags',
    price: 150000,
    currency: 'MWK',
    image: 'https://lh3.googleusercontent.com/aida/AP1WRLuCyG6fSitUGOx8xnVa_NUqSZ7-o8dgSK0fe06Zrd7RUcvZbNGYYfCWLbj3jvWPqUumz9v9Ni5bId0Oof5WeHVQXC3eywes6aUiP0EFlDhIAaDuUloLiQiyrjdPA4kyALDU99GL4QJln2pD4KHCw0_ftvTGMbnuEhDNGzarPJN-_cq_zOxa8sZUkz2eWF1ubPkSuF7K0lhj40ESrfzCgmT_8QIJZYu997dLBWii25NTTu4GgYMM-mdL6g',
    description: 'Handcrafted full-grain leather tote bag with roomy main compartment and interior organizer.',
    sellerName: 'John\'s Artisanal Crafts',
    sellerVerified: true,
    commission: 12,
    likesCount: 512,
    viewsCount: 2300,
    stock: 5,
    badge: 'EXCLUSIVE',
    rating: 5.0,
    status: 'Approved'
  },
  {
    id: 'prod-5',
    name: 'Titanium Aero Chronograph',
    category: 'Timepieces',
    price: 549000,
    currency: 'MWK',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBtlyl4FVh77e_Nm6QsM4VbXhQ8o8i0nHNNS1HU_LyLkJBV7M8Cj7vVO04MMbfPD571JduHU0w6J6yGi1Siv2ws0EDnnnRKuXrFs3EUCoGpdhKjwrhnT-53lr65193Yk96Df_oWHkpgY5O59cvt93V3avi7OPQmnSJ5zcg_3fsYoSTCHOLqfp5M16qkhiUAe08lOfUMTVq1QcY0cT5i1AtCM0tbp3zBT4Vk22XwayH-la3ZQu40CHnkXVs6RivYMi3nJWfjzFB4hFA',
    description: 'Ultra-lightweight titanium case, sapphire crystal glass, and Japanese quartz movement.',
    sellerName: 'Vertex Peripheral Lab',
    sellerVerified: true,
    commission: 8.5,
    likesCount: 890,
    viewsCount: 3400,
    stock: 12,
    badge: 'FEATURED',
    rating: 4.9,
    status: 'Approved'
  },
  {
    id: 'prod-6',
    name: 'Solar-Go 5KVA Hybrid Inverter',
    category: 'Electronics',
    price: 450000,
    currency: 'MWK',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDjByb9Ef7SLFaUbI5I_XBVVuSqd_ery1Hj_ZAEFd7OK0VQTHdCaveJzSaO27RMI90FspNKIB5LveWFu_K8d8Cs8k5ob6g6-0Dc9zlFMSMzXnvRuMNPlj2dE6uALEQUlP1plP1emLZ2uauasCIBAaZnpmr0Plgju2mVOmJLPW99v9lupmVqoaqN2n3cHOFmtPZW_BykwcNkppziCZ8LiY4j-CZ8DbHpvaRZO2_p4f41HDi5t8RUovF4CSj3rRGDQMpfeUJm3QvTgnA',
    description: 'High efficiency pure sine wave hybrid solar inverter with LCD monitoring panel.',
    sellerName: 'Malawi Electronics',
    sellerVerified: true,
    commission: 5,
    likesCount: 620,
    viewsCount: 2900,
    stock: 18,
    badge: 'HOT',
    rating: 4.8,
    status: 'Approved'
  }
];

export const INITIAL_CONVERSATIONS: ChatConversation[] = [
  {
    id: 'conv-admin',
    name: 'Pamsika Admin Support',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBSvfJuzPARrxXeA7S1rkuIs-ZMUoUX25f6rOJcMPXiGEg7kEh5liDtULYL2yn9A94aQJ1e2thBicalJoo-Ex6dngi1lxVtYEpzEnsKooA2_f2fPVeL2-obpzMdjG4jUOprsxUT_m0Kr9qb9ceZ35NuP5HGXPm53lJMHEsoVAoU-a83M95ccfKfkPFYqkPocHAg-XH-R4pVoR0gpDQnGbJvhKLu4ijRhZ1it3ThhJzqfgZ-1Rt_SX3lAXvbCRcdbnFczzzzKFL4gZA',
    online: true,
    lastMessage: 'Welcome to Pamsika Official Admin Desk! How can we assist with your orders?',
    timestamp: 'Just now',
    unreadCount: 0,
    type: 'vendor',
    messages: [
      {
        id: 'admin-m1',
        sender: 'vendor',
        text: 'Hello! Welcome to Pamsika Official Admin Desk. We assist buyers with order placement, payment verification, and seller coordination across Malawi.',
        timestamp: '08:00 AM'
      }
    ]
  },
  {
    id: 'conv-1',
    name: 'Malawi Electronics',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBSvfJuzPARrxXeA7S1rkuIs-ZMUoUX25f6rOJcMPXiGEg7kEh5liDtULYL2yn9A94aQJ1e2thBicalJoo-Ex6dngi1lxVtYEpzEnsKooA2_f2fPVeL2-obpzMdjG4jUOprsxUT_m0Kr9qb9ceZ35NuP5HGXPm53lJMHEsoVAoU-a83M95ccfKfkPFYqkPocHAg-XH-R4pVoR0gpDQnGbJvhKLu4ijRhZ1it3ThhJzqfgZ-1Rt_SX3lAXvbCRcdbnFczzzzKFL4gZA',
    online: true,
    lastMessage: 'Is the solar inverter still available for bulk order?',
    timestamp: '2m ago',
    unreadCount: 1,
    type: 'seller',
    messages: [
      {
        id: 'm1',
        sender: 'vendor',
        text: 'Hello! Welcome to Malawi Electronics. How can we help you with your tech needs today?',
        timestamp: '09:41 AM'
      },
      {
        id: 'm2',
        sender: 'user',
        text: 'Hi! I saw your post. Is the Jordan 1 Retro High OG still available in size 42?',
        timestamp: '09:43 AM'
      },
      {
        id: 'm3',
        sender: 'vendor',
        text: 'Yes, we actually have one pair left in size 42! It\'s currently in our central display. Would you like me to put it on hold for you?',
        timestamp: '09:45 AM',
        productRef: INITIAL_PRODUCTS[0]
      }
    ]
  },
  {
    id: 'conv-2',
    name: 'Zimba Fashion',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCnRfyPIXEy5IbLxM0HNe9ZFhZBTA2HSWE0Auwe5RPIwfjta8_DBed1fcvZWd01OK7RQPdHp2WYsNfdNkrMp6PwhkbjSHBJ5Ry8mZ6BAWO8TPR8WYp80-mxuAgsQsugZbDDWV0kWCAkwOb8NUgmXdEdydgvbayLIbpThkScG-b8uCuBsaZpzXCJKy0CbUo4Hu_7mPp0c6AsEl7SfgnlYHwQCgKoz-bMz2YxX5_mWkvBOfwjMlvf05QybPKZaoOvs5xnusQfvVMzBd0',
    online: false,
    lastMessage: 'The delivery person is on the way to your location.',
    timestamp: '1h ago',
    unreadCount: 0,
    type: 'seller',
    messages: [
      {
        id: 'zm1',
        sender: 'vendor',
        text: 'Your order for Puma Suede Heritage has been processed!',
        timestamp: '10:15 AM'
      },
      {
        id: 'zm2',
        sender: 'vendor',
        text: 'The delivery person is on the way to your location in Lilongwe.',
        timestamp: '11:00 AM'
      }
    ]
  },
  {
    id: 'conv-3',
    name: 'John Phiri',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuALRpXQjkaMa3sdBsYYsORGKRkec7Qbyom6WDZmQqTcRu1z6y1WrvKYPV-kubZ8Qosq1WfCToWK5hDddTtytmsS-PjvN83f5J7QU4_C3RuMDupN2MgQ6LzSZwhzzu3HqyAAUC1dMNC3ltZPobGpMa65eUmzKmaLHQ5ZXvo3iU839P6-F0IibmLUmhpk4qTP96EYsQ6JZVEBmyTBXHx70QbF7TuQpb7JH0fN4IEEicPA21bEqC2TFNmG-mWJt6-3_pn5nZozwzpRBZo',
    online: true,
    lastMessage: 'Sent a photo',
    timestamp: '4h ago',
    unreadCount: 0,
    type: 'buyer',
    messages: [
      {
        id: 'jp1',
        sender: 'vendor',
        text: 'Hello, thanks for inquiring about the hand-carved ebony bowls!',
        timestamp: '07:30 AM'
      }
    ]
  }
];

export const INITIAL_COMMUNITY_POSTS: CommunityPost[] = [
  {
    id: 'post-1',
    authorName: 'Pa_mSikA Official Admin',
    authorAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBSvfJuzPARrxXeA7S1rkuIs-ZMUoUX25f6rOJcMPXiGEg7kEh5liDtULYL2yn9A94aQJ1e2thBicalJoo-Ex6dngi1lxVtYEpzEnsKooA2_f2fPVeL2-obpzMdjG4jUOprsxUT_m0Kr9qb9ceZ35NuP5HGXPm53lJMHEsoVAoU-a83M95ccfKfkPFYqkPocHAg-XH-R4pVoR0gpDQnGbJvhKLu4ijRhZ1it3ThhJzqfgZ-1Rt_SX3lAXvbCRcdbnFczzzzKFL4gZA',
    authorBadge: 'ADMIN',
    isAdminPost: true,
    timestamp: '1h ago',
    content: '🎉 OFFICIAL MARKETPLACE BROADCAST: Handcrafted luxury artisan pieces from verified Lilongwe workshops are now live on Pa_mSikA! Enjoy 100% buyer protection, direct mobile money checkout, and express nationwide dispatch. What do you think of this week\'s feature collection? 🎨🇲🇼',
    image: 'https://lh3.googleusercontent.com/aida/AP1WRLsomHc4ZcdkJK7SUfjaD2kRGG40_Iz3rR5ePms3Pb7f6uAJ5shwJ53cKabNYhb37nbRDknnehQ71JZKhYhGk_vPiYiKxV2GVg4IHAgEyV7vYjAFk5qDZ-TgSEXE-qIHvomMY7zuRpjg3paTFQG34bof7ie6HILPuiWjiVGMIxIxva8ozqzMQWQFtY4gKv45oiyprgPrdmakKx8wnvd3PFthAvZ8cA5s8D3ypFzv9d32pQm1PphwFj8MITk',
    categoryTag: '#Artisans',
    likes: 242,
    isLiked: false,
    commentsCount: 3,
    taggedProduct: INITIAL_PRODUCTS[3], // Minimalist Hand-carved Bowl
    comments: [
      {
        id: 'c-1',
        authorName: 'Amara Okafor',
        authorAvatar: 'https://lh3.googleusercontent.com/aida/AP1WRLtDc1Kv2kxn1FOpNukilhb0bk_b7IGZTcPEr26k9JjgQAstaZ5iBtNUL6f8SwDZI5UGK5BItZ1tymLsNTzEKqb-r7lzrmviOUfTnDJqYlq8uyD7NZjMelSQB2WwqcsAbRH9uzYJYiO_3AocM89rBwUwh79a_OPKOwbW8zSPkKJmo1miMtZCU_5EUMvCj6gnxm6xeSX05JX7h5L6YWJ1fsiy_UWkxfhi9PsXHY2qKSG2uOpfC5kc5uQpQ-o',
        authorBadge: 'Verified Vendor',
        timestamp: '45m ago',
        text: 'The woodwork finish on these is incredible! Proud to have our products featured on the official feed. 🌟',
        likes: 14,
        isLiked: true
      },
      {
        id: 'c-2',
        authorName: 'Chifundo Banda',
        authorAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuALRpXQjkaMa3sdBsYYsORGKRkec7Qbyom6WDZmQqTcRu1z6y1WrvKYPV-kubZ8Qosq1WfCToWK5hDddTtytmsS-PjvN83f5J7QU4_C3RuMDupN2MgQ6LzSZwhzzu3HqyAAUC1dMNC3ltZPobGpMa65eUmzKmaLHQ5ZXvo3iU839P6-F0IibmLUmhpk4qTP96EYsQ6JZVEBmyTBXHx70QbF7TuQpb7JH0fN4IEEicPA21bEqC2TFNmG-mWJt6-3_pn5nZozwzpRBZo',
        authorBadge: 'Buyer (Blantyre)',
        timestamp: '30m ago',
        text: 'How long does delivery take to Blantyre for this handcrafted bowl?',
        likes: 5,
        isLiked: false
      },
      {
        id: 'c-3',
        authorName: 'Pa_mSikA Official Admin',
        authorAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBSvfJuzPARrxXeA7S1rkuIs-ZMUoUX25f6rOJcMPXiGEg7kEh5liDtULYL2yn9A94aQJ1e2thBicalJoo-Ex6dngi1lxVtYEpzEnsKooA2_f2fPVeL2-obpzMdjG4jUOprsxUT_m0Kr9qb9ceZ35NuP5HGXPm53lJMHEsoVAoU-a83M95ccfKfkPFYqkPocHAg-XH-R4pVoR0gpDQnGbJvhKLu4ijRhZ1it3ThhJzqfgZ-1Rt_SX3lAXvbCRcdbnFczzzzKFL4gZA',
        authorBadge: 'ADMIN',
        timestamp: '15m ago',
        text: '@Chifundo Banda Hello! Blantyre deliveries take 24–48 hours via Pa_mSikA Express Courier. You can tap the tagged item above to order directly!',
        likes: 12,
        isLiked: true
      }
    ]
  },
  {
    id: 'post-2',
    authorName: 'Pa_mSikA Official Admin',
    authorAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBSvfJuzPARrxXeA7S1rkuIs-ZMUoUX25f6rOJcMPXiGEg7kEh5liDtULYL2yn9A94aQJ1e2thBicalJoo-Ex6dngi1lxVtYEpzEnsKooA2_f2fPVeL2-obpzMdjG4jUOprsxUT_m0Kr9qb9ceZ35NuP5HGXPm53lJMHEsoVAoU-a83M95ccfKfkPFYqkPocHAg-XH-R4pVoR0gpDQnGbJvhKLu4ijRhZ1it3ThhJzqfgZ-1Rt_SX3lAXvbCRcdbnFczzzzKFL4gZA',
    authorBadge: 'ADMIN',
    isAdminPost: true,
    timestamp: '4h ago',
    content: '📢 AUTOMOBILES & ELECTRONICS UPDATE: Restock alert! Solar-Go 5KVA Hybrid Inverters & Genuine Toyota Hilux Revo OEM Spares have just been verified and approved by Pa_mSikA Quality Assurance. Check out the marketplace or leave a comment below for custom inquiries! 🛠️⚡',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDjByb9Ef7SLFaUbI5I_XBVVuSqd_ery1Hj_ZAEFd7OK0VQTHdCaveJzSaO27RMI90FspNKIB5LveWFu_K8d8Cs8k5ob6g6-0Dc9zlFMSMzXnvRuMNPlj2dE6uALEQUlP1plP1emLZ2uauasCIBAaZnpmr0Plgju2mVOmJLPW99v9lupmVqoaqN2n3cHOFmtPZW_BykwcNkppziCZ8LiY4j-CZ8DbHpvaRZO2_p4f41HDi5t8RUovF4CSj3rRGDQMpfeUJm3QvTgnA',
    categoryTag: '#MarketUpdate',
    likes: 189,
    isLiked: true,
    commentsCount: 2,
    taggedProduct: INITIAL_PRODUCTS[5], // Solar-Go Hybrid Inverter
    comments: [
      {
        id: 'c-201',
        authorName: 'Julian Darko',
        authorAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBVKvMRY3ClpDIUrPT5Rhxaaf2gr6DHCi8QzObKSCKxx9uJ10BS3_Ze8bWusRF8rw14BqwabBt-2HT6zvoP08-vWE0_gA4sbMcXy1f87eQ-tR3toNX0GgQ0AKVqOOz6A5cwREtNLfnVSHbVLdDyreG_VYQhb0d3nbag9z6bDehCcZTboENp5oKAJ2DHiYwpOjjIOaaIb3i-FtVW9RNcSXgzgpMWvTvSg8Mmw-lmdvtu8h0XGvfdeACe6sCcgmZ1qPPxAXR2BxKDubA',
        authorBadge: 'Verified Buyer',
        timestamp: '3h ago',
        text: 'Great news! Does the 5KVA inverter come with installation support or warranty?',
        likes: 8,
        isLiked: false
      },
      {
        id: 'c-202',
        authorName: 'Pa_mSikA Official Admin',
        authorAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBSvfJuzPARrxXeA7S1rkuIs-ZMUoUX25f6rOJcMPXiGEg7kEh5liDtULYL2yn9A94aQJ1e2thBicalJoo-Ex6dngi1lxVtYEpzEnsKooA2_f2fPVeL2-obpzMdjG4jUOprsxUT_m0Kr9qb9ceZ35NuP5HGXPm53lJMHEsoVAoU-a83M95ccfKfkPFYqkPocHAg-XH-R4pVoR0gpDQnGbJvhKLu4ijRhZ1it3ThhJzqfgZ-1Rt_SX3lAXvbCRcdbnFczzzzKFL4gZA',
        authorBadge: 'ADMIN',
        timestamp: '2h ago',
        text: '@Julian Darko Yes! All Solar-Go inverters include a 2-Year Official Manufacturer Warranty and free technical setup assistance in Lilongwe, Blantyre & Zomba.',
        likes: 19,
        isLiked: true
      }
    ]
  }
];

export const INITIAL_ORDERS: OrderItem[] = [
  {
    id: '#ORD-88219',
    customerName: 'Julianna Vane',
    customerEmail: 'julianna@example.com',
    itemsSummary: 'Jordan 1 Retro High OG, Titanium Aero',
    amount: 142000,
    currency: 'MWK',
    paymentMethod: 'Airtel Money ••• 4421',
    sellerName: 'Malawi Electronics',
    affiliateName: 'Alex Rivera',
    status: 'Processing',
    date: 'Oct 24, 2026'
  },
  {
    id: '#ORD-88102',
    customerName: 'Marcus Thorne',
    customerEmail: 'm.thorne@corp.com',
    itemsSummary: 'Minimalist Hand-carved Bowl',
    amount: 45000,
    currency: 'MWK',
    paymentMethod: 'TNM Mpamba',
    sellerName: 'John\'s Artisanal Crafts',
    status: 'Shipped',
    date: 'Oct 23, 2026'
  },
  {
    id: '#ORD-87994',
    customerName: 'Elena Rossi',
    customerEmail: 'elena@rossi.mw',
    itemsSummary: 'MacBook Air M2 Silver',
    amount: 1199000,
    currency: 'MWK',
    paymentMethod: 'National Bank Card',
    sellerName: 'Malawi Electronics',
    affiliateName: 'Sarah Miller',
    status: 'Delivered',
    date: 'Oct 21, 2026'
  }
];

export const INITIAL_SELLERS: SellerProfile[] = [
  {
    id: 'sel-1',
    fullName: 'Kondwani Phiri',
    nationalId: '9283-BT-3122',
    phone: '+265 990 123 456',
    location: 'Blantyre',
    storeName: 'Zomba Electronics',
    category: 'Tech & Gadgets',
    status: 'Active',
    balance: 142500,
    currency: 'MWK',
    totalSales: 128,
    storeViews: '12.4K'
  },
  {
    id: 'sel-2',
    fullName: 'Eness Mwale',
    nationalId: '1144-SL-0092',
    phone: '+265 888 765 432',
    location: 'Salima',
    storeName: 'Lakeview Fabrics',
    category: 'Textiles',
    status: 'Pending',
    balance: 0,
    currency: 'MWK',
    totalSales: 0,
    storeViews: '140'
  },
  {
    id: 'sel-3',
    fullName: 'Isaac Banda',
    nationalId: '5521-LL-8821',
    phone: '+265 999 555 111',
    location: 'Lilongwe',
    storeName: 'Prime Logistics',
    category: 'Delivery Services',
    status: 'Active',
    balance: 890200,
    currency: 'MWK',
    totalSales: 340,
    storeViews: '42.5K'
  }
];

export const INITIAL_DOLO_AFFILIATE: DoloAffiliate = {
  id: 'dolo-1024',
  name: 'John Doe',
  email: 'j.doe@email.com',
  doloId: 'DOLO-1024',
  balance: 45000,
  linkClicks: 1240,
  salesMade: 18,
  totalEarned: 120500,
  inviteLink: 'pamsika.com/join?ref=DOLO1024',
  subEarnings: 2500,
  subInvites: 5
};

export const INITIAL_PENDING_APPROVALS: PendingProductApproval[] = [
  {
    id: 'appr-1',
    productName: 'The Heritage Bifold - Cognac',
    category: 'Fashion & Accessories',
    sellerName: 'Aiden Craftworks',
    sellerPrice: 45.0,
    stock: 150,
    submittedTime: '2h ago',
    description: 'Full-grain vegetable tanned leather bifold wallet with RFID blocking technology. Hand-stitched with waxed linen thread.',
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDgbnRiJJF1oIK21RwWAcnk18dkRw6JzPz_OsTDVpE7tjxadCQEzzlaFmZMybPkDCt2RAzIfuWpKlbgX3qqneDlef11n-n01iQX6L4YBqXO9XAJMdw4S-Krv4rrA2uaqHEARZDk3IYTkZXFnKbn2vyoAhEUN-S7AWTwA2Hy80VWHS6sgFYUKVuseoiw2yuLe-eDIDmZ1DkxNnTPkv4iuMJvGIZsqpmp0hhfRmfWoua5_Ht0KRGUkyB1SBpqZ8wMeSL-Y_Sx37Pi74s',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBW1gcOuE2QXtdUx3zNyDs_UXTwF-M9oKeOoOgjTZz8ZyJ-JBDETcP3QaFmwYX2huCjNteIufmvRnIHr4V7YsdGRu3ynfikTcT0PQSCIPOAGMod3epHR_nLg_DSTl-mErH8qZ6oym03tHGNiLGByzUsw8gJxz01y6Jd6uO4FGzFaaUgYsfOjmJMKRaKuPZlsbmaMJAMQr-qO_u4s7kJIWg8ObUx7ErDi1Vi1taxgrcdlQc9J98Z8QGmFdxXq-at9_Pw5_FpzJh6auo'
    ],
    platformMarkupPct: 25,
    affiliateCommPct: 10
  },
  {
    id: 'appr-2',
    productName: 'Apex TKL Mechanical Keyboard',
    category: 'Tech & Gaming',
    sellerName: 'Vertex Peripheral Lab',
    sellerPrice: 120.0,
    stock: 45,
    submittedTime: '5h ago',
    description: 'Wireless mechanical keyboard with hot-swappable switches, PBT keycaps, and a 4000mAh battery.',
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBX7WfKBknYejP7xyVWan5LBk58svhe4WnUy80RJT1xDgOmWhex3zomTB-zNZSq8aZ9NrQ3u60nndQvzxDXBaCKKTq-eLKR8w-ASEwdg3Y2RKV4pS9WVQPZoW0ym-fWwTPNPGYy4BBHHrXrgJDTm_pgU-XY_o1P4ZBMGyC6fdmwJKUiMVkzS_OG9v4Ud4lJFTK_5_8L0F55ukQhR8AhTc5HOm8lmEP2cCWOlGq1FIWd6ndlqqK-uTBt-FYZzrkotQnT8qUdlQ9uJqA',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDeqpnw9ZuWde7kXZrp-k-pAksmZAGPUkJ5lDGrszLvPQ5cmDaec4Re1beczSNw5riVtzzcxUUMca_mhd2O8dB0Y5caNkJvhhbVN9qqC8cGsaKopxNJrb91dYdqmSwIeysDlj115t1oZQSQhI4Tol28XFHOqvMrjdJN_csoB_NAkTTkKajsFrA6DhtAFa6Y-e5yG9X6EySO0w-TzbHqpVboSNqiLeNTfSOJchUZwk34pLr1NTboIRU-WNaTtkbEyVfGqGMop9P0xOo'
    ],
    platformMarkupPct: 25,
    affiliateCommPct: 10
  }
];
