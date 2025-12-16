# AgriChain - Farm to Table Supply Chain Tracking System

A comprehensive supply chain tracking system that ensures transparency and traceability from farm to table. AgriChain enables farmers, transporters, warehouses, retailers, and customers to track agricultural products throughout the entire supply chain journey.

## 🌟 Features

### 🔐 **Role-Based Authentication System**
- **Farmer**: Manage crops, create product batches, track farm operations
- **Transporter**: Handle logistics, update shipment status, manage delivery routes
- **Warehouse**: Manage inventory, process incoming/outgoing products, quality control
- **Retailer**: List products for sale, manage inventory, process customer orders
- **Customer**: Track purchases, view product history, verify authenticity
- **Admin**: System oversight, user management, analytics dashboard

### 📱 **Core Functionality**
- **Product Tracking**: Real-time tracking using unique product codes
- **Phone-Based Tracking**: Track purchases using customer phone numbers
- **Supply Chain Transparency**: Complete journey visibility from farm to retail
- **Farm Location Management**: GPS-based farm location tracking for pickup coordination
- **Inventory Management**: Real-time stock management across all stakeholders
- **Quality Assurance**: Quality checkpoints at each stage of the supply chain

### 🎨 **Enhanced User Experience**
- **Modern UI/UX**: Responsive design with smooth animations
- **Dashboard Navigation**: Role-specific dashboards with intuitive navigation
- **Real-time Updates**: Live status updates throughout the supply chain
- **Mobile Responsive**: Optimized for desktop and mobile devices
- **Professional Design**: Modern, clean interface with consistent branding

### 🔒 **Security & Privacy**
- **Data Isolation**: Role-based data access control
- **Secure Sessions**: Session-based authentication
- **Privacy Protection**: User data protection and secure API endpoints
- **Access Control**: Proper authorization for all operations

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v14 or higher)
- **MongoDB** (v4.4 or higher)
- **npm** or **yarn** package manager

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/varunjoshi84/AgTrace.git
cd AgTrace
```

2. **Install Backend Dependencies**
```bash
cd backend
npm install
```

3. **Install Frontend Dependencies**
```bash
cd ../frontend
npm install
```

4. **Environment Configuration**

Create `.env` file in the backend directory:
```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/agrichain
DB_NAME=agrichain

# Server Configuration
PORT=5000
NODE_ENV=development

# Session Configuration
SESSION_SECRET=your_session_secret_here

# CORS Configuration
FRONTEND_URL=http://localhost:5173
```

5. **Start MongoDB**
```bash
# Using MongoDB service
sudo systemctl start mongod

# Or using MongoDB Compass/Atlas for cloud database
```

6. **Run the Application**

**Start Backend Server:**
```bash
cd backend
npm start
# Server runs on http://localhost:5000
```

**Start Frontend Development Server:**
```bash
cd frontend
npm run dev
# Frontend runs on http://localhost:5173
```

## 📖 Usage Guide

### 🌾 **For Farmers**
1. **Register/Login** with Farmer role
2. **Create Products**: Add new crop batches with details
3. **Set Farm Locations**: Configure pickup locations for transporters
4. **Track Shipments**: Monitor when products are picked up
5. **View Analytics**: Access farm performance metrics

### 🚛 **For Transporters**
1. **Register/Login** with Transporter role
2. **View Available Pickups**: See products ready for transport
3. **Update Transport Status**: Mark products as in transit
4. **Coordinate Deliveries**: Manage delivery schedules
5. **Track Performance**: View transport metrics and history

### 🏭 **For Warehouses**
1. **Register/Login** with Warehouse role
2. **Receive Products**: Process incoming shipments
3. **Manage Inventory**: Track stock levels and storage
4. **Quality Control**: Perform quality checks and certifications
5. **Dispatch Products**: Prepare products for retail distribution

### 🏪 **For Retailers**
1. **Register/Login** with Retailer role
2. **List Products**: Add products to retail inventory
3. **Manage Sales**: Process customer orders and sales
4. **Track Inventory**: Monitor stock levels and reorder points
5. **Customer Service**: Handle customer inquiries and returns

### 🛒 **For Customers**
1. **Register/Login** with Customer role
2. **Track Products**: Use product codes to trace journey
3. **View Purchase History**: Access past purchases and receipts
4. **Phone Tracking**: Track purchases using phone number
5. **Verify Authenticity**: Confirm product authenticity and origin

### 👑 **For Administrators**
1. **Login** with Admin credentials
2. **User Management**: Monitor and manage system users
3. **System Analytics**: View platform-wide metrics
4. **Data Oversight**: Access comprehensive system data
5. **Performance Monitoring**: Track system performance and usage

## 🎯 **Product Tracking**

### **Track by Product Code**
```
Example Product Code: PC1734590123ABCDE
```

1. Navigate to **Track Page**
2. Enter the **Product Code** in the search field
3. Click **"Track Product"** button
4. View complete product journey with timestamps

### **Track by Phone Number**
```
Example: +1234567890
```

1. Navigate to **Track Page**
2. Switch to **"Track by Phone Number"** tab
3. Enter your **phone number**
4. Click **"Find Purchases"** button
5. View all your purchase history

## 🛠 Tech Stack

### **Frontend**
- **React 19.2.0**: Modern React with latest features
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Beautiful icon library
- **React Router DOM**: Client-side routing
- **Axios**: HTTP client for API requests

### **Backend**
- **Node.js**: JavaScript runtime
- **Express.js**: Web application framework
- **MongoDB**: NoSQL database
- **Mongoose**: MongoDB object modeling
- **Express Session**: Session management
- **CORS**: Cross-origin resource sharing
- **Socket.io**: Real-time communication

### **Development Tools**
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Nodemon**: Development server auto-restart
- **Git**: Version control

## 📡 API Endpoints

### **Authentication Routes**
```
POST /api/auth/register    - User registration
POST /api/auth/login       - User login
POST /api/auth/logout      - User logout
GET  /api/auth/check       - Check authentication status
```

### **Product Management**
```
GET    /api/products              - Get all products
POST   /api/products              - Create new product
GET    /api/products/:id          - Get product by ID
PUT    /api/products/:id          - Update product
DELETE /api/products/:id          - Delete product
```

### **Tracking Routes**
```
GET /api/customer/track/:productId        - Track by product ID
GET /api/customer/track-by-code/:code     - Track by product code
GET /api/customer/purchases/:phone       - Track by phone number
```

### **Role-Specific Routes**
```
# Farmer Routes
GET    /api/farmer/products       - Get farmer's products
POST   /api/farmer/products       - Create new product
PUT    /api/farmer/products/:id   - Update product

# Transport Routes
GET    /api/transport             - Get transport entries
POST   /api/transport             - Create transport entry
PUT    /api/transport/:id         - Update transport status

# Warehouse Routes
GET    /api/warehouse             - Get warehouse entries
POST   /api/warehouse             - Create warehouse entry
PUT    /api/warehouse/:id         - Update warehouse status

# Retail Routes
GET    /api/retail                - Get retail entries
POST   /api/retail                - Create retail entry
PUT    /api/retail/:id/sell-out   - Mark as sold out
```

## 🎨 UI Components

### **Reusable Components**
- **Footer**: Professional footer with links and contact info
- **ScrollToTop**: Automatic scroll to top on route change
- **BackToTopButton**: Manual scroll to top button
- **ProductTimeline**: Visual product journey timeline
- **Enhanced Loading**: Skeleton UI with animations

### **Dashboard Features**
- **Role-based Navigation**: Customized navigation per user role
- **Real-time Statistics**: Live data updates
- **Responsive Design**: Mobile and desktop optimized
- **Interactive Elements**: Hover effects and smooth transitions

## 📱 Mobile Experience

- **Responsive Design**: Optimized for all screen sizes
- **Touch-Friendly**: Large buttons and intuitive gestures
- **Mobile Navigation**: Collapsible menu for small screens
- **Fast Loading**: Optimized for mobile networks

## 🔧 Development

### **Project Structure**
```
AgriChain/
├── backend/
│   ├── config/          # Database configuration
│   ├── middleware/      # Authentication & error handling
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── utils/           # Utility functions
│   └── server.js        # Main server file
├── frontend/
│   ├── public/          # Static assets
│   ├── src/
│   │   ├── api/         # API client configuration
│   │   ├── components/  # Reusable components
│   │   ├── context/     # React context providers
│   │   ├── hooks/       # Custom React hooks
│   │   ├── pages/       # Page components
│   │   ├── utils/       # Utility functions
│   │   └── App.jsx      # Main App component
│   └── package.json
└── README.md
```

### **Running in Development**
```bash
# Backend with auto-restart
cd backend
npm run dev

# Frontend with hot reload
cd frontend
npm run dev
```

### **Building for Production**
```bash
# Build frontend
cd frontend
npm run build

# Serve backend in production mode
cd backend
npm start
```

## 🚧 Future Enhancements

- [ ] **Blockchain Integration**: True blockchain implementation for immutable records
- [ ] **IoT Sensor Integration**: Real-time environmental monitoring
- [ ] **AI Quality Prediction**: Machine learning for quality assessment
- [ ] **Mobile App**: Native mobile applications
- [ ] **Multi-language Support**: Internationalization
- [ ] **Advanced Analytics**: Business intelligence dashboard
- [ ] **API Documentation**: Swagger/OpenAPI documentation
- [ ] **Testing Suite**: Comprehensive unit and integration tests

## 🤝 Contributing

We welcome contributions to AgriChain! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add some AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

### **Development Guidelines**
- Follow existing code style and conventions
- Write clear commit messages
- Add comments for complex logic
- Test your changes thoroughly
- Update documentation as needed
                                
**AgriChain** - Connecting farms to consumers through technology and transparency 🌱➡️🍽️

                            🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏