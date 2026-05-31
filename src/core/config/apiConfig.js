// API Configuration
export const API_CONFIG = {
    // Using Vite proxy in dev, direct URL in prod
    BASE_URL: import.meta.env.VITE_API_BASE_URL,
    ENDPOINTS: {
        LOGIN: '/user/login',
        SIGNUP: '/user/signup',
        PROFILE: '/user/profile',
        MY_PROFILE: '/user/me',
        VERIFY_EMAIL: '/user/verify-email',
        VERIFY_EMAIL_TOKEN: '/user/verify-token',
        UPDATE_PASSWORD: '/user/update-password',
        DELETE_ACCOUNT: '/user/delete',
        ANALYTICS: '/user/analytics',
        RESET_PASSWORD_REQUEST: '/user/reset-password-request',
        RESET_PASSWORD: '/user/reset-password',
        COLLECTIONS: '/c',
        COLLECTION_BY_ID: '/c/getCollectionById',
        EXPLORE: '/c/explore/collections',
        USERS: '/user/all',
        FOLLOW_USER: '/user/follow',
        FOLLOWERS: '/user/followers',
        FOLLOWING: '/user/following',
        MY_COLLECTIONS: '/c/getMyCollection',
        UPDATE_COLLECTION_VISIBILITY: '/c/updateVisibility',
        NOTIFICATIONS: '/user/notification',
        MARK_NOTIFICATION_READ: '/user/notification/markRead',
        ADD_PRODUCT: '/product/cId',
        PRODUCT_EXPLORE: '/product/explore',
        PRODUCT_BY_ID: '/product/pId',
        LIKE_PRODUCT: '/product/like',
        DELETE_PRODUCT: '/product',
        SEARCH_PRODUCTS: '/product/search', // GET /product/search?q={query}
        UPDATE_PRODUCT: '/product/pId', // PATCH /product/pId/{productId}
        PRODUCT_BY_PID: '/product/pId', // GET /product/pId/{productId}
        PRODUCT_MEDIA: '/product/media/pId', // POST /product/media/pId/{productId}
        DELETE_PRODUCT_MEDIA: '/product/media', // DELETE /product/media/{mediaId}/pId/{productId}/delete
        PIN_PRODUCT: '/product/pin', // PATCH /product/pin/{productId}
        FEATURE_PRODUCT: '/product', // POST /product/{productId}/feature
        INVITE_MEMBER: '/c/invite', // PATCH /c/invite/{collectionId}
        REVOKE_MEMBER: '/c/revokeMember', // DELETE /c/revokeMember/{collectionId} body: { memberId }
        PIN_COLLECTION: '/c/pin', // PATCH /c/pin/{collectionId}
        PROFILE_VIEWS: '/user/profile-views',
        LIKED_PRODUCTS: '/user/liked/products',
        SUBSCRIPTION_CREATE: '/subscription/create',
        SUBSCRIPTION_VERIFY: '/subscription/verify',
        SUBSCRIPTION_TRANSACTIONS: '/subscription/transactions',
        SUBSCRIPTION_CANCEL: '/subscription/cancel',
        BRAND_SIGNUP: '/brand/signup',
        BRAND_LOGIN: '/brand/login',
        BRAND_PROFILE: '/brand',
        BRAND_ALL: '/brand/all',              // GET /brand/all?start=0&limit=10  (public)
        BRAND_UPDATE: '/brand/update',
        BRAND_DELETE: '/brand/delete',
        BRAND_ANALYTICS: '/brand/analytics',          // GET
        BRAND_CAMPAIGNS: '/brand/campaigns',
        BRAND_CAMPAIGNS_EXPLORE: '/brand/campaigns/explore',
        BRAND_CAMPAIGN_CREATE: '/brand/campaign/create',
        BRAND_CAMPAIGN_DELETE: '/brand/campaign',
        BRAND_CAMPAIGN_PUBLISH: '/brand/campaign/publish',
        BRAND_CAMPAIGN_UPDATE: '/brand/campaign/update',
        BRAND_CAMPAIGN_APPLY: '/brand/campaign',                  // POST /brand/campaign/:id/apply
        BRAND_CAMPAIGN_BY_ID: '/brand/campaign',                  // GET  /brand/campaign/:id
        BRAND_CAMPAIGN_UPDATE_APPLICANT: '/brand/campaign',       // PUT  /brand/campaign/:id/update-applicant/:applicantId?operation=
        BRAND_CAMPAIGNS_BY_BRAND: '/brand',                       // GET  /brand/:id/campaigns
        YOUTUBE_CONNECT: '/youtube/connect',
        YOUTUBE_STATUS: '/youtube/status',
        YOUTUBE_DISCONNECT: '/youtube/disconnect',
        YOUTUBE_OVERVIEW: '/youtube/overview',
        YOUTUBE_TOP_VIDEOS: '/youtube/top-videos',
        BRAND_PRODUCT_CREATE: '/brand/product/create',
        BRAND_MY_PRODUCTS: '/brand/me/products',
        BRAND_PRODUCT_DELETE: '/brand/product',   // DELETE /brand/product/:id/delete
        BRAND_PRODUCT_UPDATE: '/brand/product',   // PATCH  /brand/product/:id/update
        BRAND_PRODUCT_MEDIA: '/brand/product/media', // PATCH /brand/product/media/:id
        BRAND_PRODUCT_EXPLORE: '/product/brands/explore', // GET /product/brands/explore?page=0&limit=20
        BRAND_PRODUCT_BY_ID: '/brand/product',            // GET /brand/product/:id
        BRAND_PRODUCT_LIKE: '/brand/product/like',         // GET /brand/product/like/:id
        BRAND_PRODUCT_PIN: '/brand/product/pin',           // PATCH /brand/product/pin/:id
        WALLET: '/wallet',                                 // GET /wallet/
        WALLET_TRANSACTIONS: '/wallet/transactions',        // GET /wallet/transactions
        WALLET_DEPOSIT: '/wallet/create-deposit-order',   // POST /wallet/create-deposit-order (Brand)
        WALLET_VERIFY_DEPOSIT: '/wallet/verify-deposit-order', // POST /wallet/verify-deposit-order (Brand)
        BRAND_CAMPAIGN_THREAD: '/brand/campaign',          // GET/PUT /brand/campaign/:campaignId/thread/:threadId
        BRAND_CAMPAIGN_AGREEMENTS: '/brand/campaign',      // PUT /brand/campaign/:id/agreements
        USER_APPLIED_CAMPAIGNS: '/user/get-campaigns',     // GET /user/get-campaigns
    },
    TIMEOUT: 10000,
};

// Storage Keys
export const STORAGE_KEYS = {
    AUTH_TOKEN: 'dropp_auth_token',
    USER_DATA: 'dropp_user_data',
    ACCOUNT_TYPE: 'dropp_account_type',
};
