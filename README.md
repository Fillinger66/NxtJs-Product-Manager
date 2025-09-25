# Product Manager API
### This project is in progress

A comprehensive REST API built with Next.js 14+ that demonstrates modern full-stack development practices. This project showcases how to build a complete API using Next.js App Router, Prisma ORM for PostgreSQL database interactions, and Vercel AI SDK integration with Google's Gemini model for AI-powered advertisement generation.

## 🚀 Key Features

- **Complete CRUD Operations** for products, categories, and brands (marks)
- **CSV Bulk Import** functionality for efficient database population
- **AI Advertisement Generation** using Google's Gemini 2.0 Flash model via Vercel AI SDK
- **Type-safe Development** with TypeScript and Prisma
- **Structured API Responses** with consistent error handling
- **Relational Database Design** with proper foreign key constraints
- **Production Ready** - optimized for deployment

## 🛠️ Technology Stack

- **Framework**: Next.js 14+ with App Router
- **Database**: PostgreSQL with Prisma ORM
- **AI Integration**: Vercel AI SDK + Google Gemini 2.0 Flash
- **Language**: TypeScript
- **CSV Processing**: Papa Parse for file uploads
- **Development**: Hot reload, TypeScript strict mode
- **Deployment**: Optimized for Vercel platform

## 📁 Project Architecture

```
product-manager/
├── app/
│   └── api/                     # API Routes (App Router)
│       ├── categories/          # Category management
│       │   ├── route.ts         # GET all, POST new
│       │   └── [id]/
│       │       └── route.ts     # GET, PUT, DELETE by ID
│       ├── marks/               # Brand/Mark management  
│       │   ├── route.ts         # GET all, POST new
│       │   └── [id]/
│       │       └── route.ts     # GET, PUT, DELETE by ID
│       ├── products/            # Product management
│       │   ├── route.ts         # GET all, POST new
│       │   ├── [id]/
│       │   │   └── route.ts     # GET, PUT, DELETE by ID
│       │   └── advert/
│       │       └── [id]/
│       │           └── route.ts # AI advertisement generation
│       └── upload/
│           └── route.ts         # CSV bulk import endpoint
├── lib/
│   ├── types.ts                 # Shared TypeScript definitions
│   └── AdvertGenAI.ts          # AI advertisement logic
├── prisma/
│   └── schema.prisma           # Database schema definition
├── docker/
│   └── docker-compose.yaml    # Local development setup
└── tech_products_v3.csv       # Sample data 
```

## 🗄️ Database Schema

The application uses a relational design with three core entities:

```prisma
model Category {
  id       Int       @id @default(autoincrement())
  name     String    @unique
  products Product[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Mark {
  id       Int       @id @default(autoincrement())
  name     String    @unique
  products Product[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Product {
  id          Int      @id @default(autoincrement())
  name        String   @unique
  description String?
  price       Decimal  @db.Decimal(10, 2)
  stock       Int      @default(0)
  categoryId  Int
  markId      Int
  category    Category @relation(fields: [categoryId], references: [id])
  mark        Mark     @relation(fields: [markId], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

**Key Design Decisions:**
- Normalized structure prevents data duplication
- Unique constraints on names prevent duplicates
- Decimal type for precise price handling
- Cascading relationships for data integrity
- Timestamps for audit trails

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Google AI API key (for Gemini integration)

### Installation

1. **Clone and install**
```bash
git clone <repository-url>
cd product-manager
npm install
```

2. **Environment setup**
```bash
# Create .env file
DATABASE_URL="postgresql://username:password@localhost:5432/product_manager"
GOOGLE_GENERATIVE_AI_API_KEY="your-google-ai-api-key"
```

2b. **PostgreSQL with Docker (Optional)**

If you don't have PostgreSQL installed locally, you can use Docker to run it:

```bash
# Using the provided docker-compose file
docker-compose -f docker/docker-compose.yaml up -d

# Or run PostgreSQL directly with Docker
docker run --name product-manager-db \
  -e POSTGRES_DB=product_manager \
  -e POSTGRES_USER=username \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  -d postgres:15
```

**Docker Compose Configuration:**
```yaml
# docker/docker-compose.yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: product_manager
      POSTGRES_USER: username
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:
```

**Update your .env for Docker:**
```bash
DATABASE_URL="postgresql://username:password@localhost:5432/product_manager"
```

3. **Database initialization**
```bash
# Generate Prisma client
npx prisma generate

# Apply schema to database
npx prisma db push

# (Optional) View database in browser
npx prisma studio
```

4. **Start development server**
```bash
npm run dev
# Server runs on http://localhost:3000
```

## 📡 API Documentation

### Categories Management
```
GET    /api/categories                    # List all categories
POST   /api/categories                    # Create new category
GET    /api/categories/[id]               # Get category by ID
GET    /api/categories/[id]?includeProducts=true  # Include related products
PUT    /api/categories/[id]               # Update category
DELETE /api/categories/[id]               # Delete category
```

### Brands (Marks) Management
```
GET    /api/marks                         # List all brands
POST   /api/marks                         # Create new brand
GET    /api/marks/[id]                    # Get brand by ID
GET    /api/marks/[id]?includeProducts=true        # Include related products
PUT    /api/marks/[id]                    # Update brand
DELETE /api/marks/[id]                    # Delete brand
```

### Products Management
```
GET    /api/products                      # List all products with relations
POST   /api/products                      # Create new product
GET    /api/products/[id]                 # Get specific product
PUT    /api/products/[id]                 # Update product
DELETE /api/products/[id]                 # Delete product
```

### AI Advertisement Generation
```
GET    /api/products/advert/[id]          # Generate text advertisement
GET    /api/products/advert/[id]?format=html      # Generate HTML advertisement
```

### CSV Bulk Import
```
POST   /api/upload                        # Upload CSV file for bulk import
```

## 📝 API Response Formats

### Success Response
```json
{
  "data": {
    "id": 1,
    "name": "Laptops",
    "products": [...]
  },
  "message": "Success"
}
```

### Error Response
```json
{
  "errorCode": -1,
  "message": "Resource not found"
}
```

## 📄 CSV Import Format

The bulk import endpoint accepts CSV files with this structure:

```csv
Product Name,Mark,Category,Price,Stock
Apple Laptops Product 1,Apple,Laptops,1770.49,39
Samsung Gaming Accessories Product 1,Samsung,Gaming Accessories,1008.49,57
Microsoft Monitors Product 1,Microsoft,Monitors,106.79,61
```

**Required Columns:**
- `Product Name` - Unique product identifier
- `Mark` - Brand/manufacturer name  
- `Category` - Product category
- `Price` - Decimal price value
- `Stock` - Integer stock quantity

**Import Process:**
1. Categories and marks are automatically created if they don't exist
2. Products are upserted (created or updated) based on name
3. Relations are established automatically
4. Comprehensive error handling for malformed data

## 🤖 AI Advertisement Features

Powered by Google's Gemini 2.0 Flash model through Vercel AI SDK:

**Capabilities:**
- Dynamic content generation based on product data
- Professional marketing copy with engaging hooks
- Feature highlighting and benefit articulation
- Support for both plain text and HTML formats
- Brand-aware messaging

**Example Request:**
```bash
GET /api/products/advert/1?format=html
```

**Sample Generated Advertisement:**
```html
<h2>🚀 Apple Laptops Product 1 - Where Innovation Meets Performance!</h2>
<p>Discover the perfect blend of cutting-edge technology and sleek design...</p>
<ul>
  <li>✨ Premium Apple craftsmanship</li>
  <li>💪 Laptop category excellence</li>
  <li>🎯 Competitive pricing at $1770.49</li>
</ul>
```

### Database Operations Pattern
```typescript
// Proper async/await with error handling
try {
    const prisma = new PrismaClient();
    
    const result = await prisma.product.upsert({
        where: { name: productName },
        update: { ...updateData },
        create: { ...createData }
    });
    
    return NextResponse.json({ data: result, message: "Success" });
} catch (error) {
    return NextResponse.json({ 
        errorCode: -2, 
        message: "Database operation failed" 
    }, { status: 500 });
} finally {
    await prisma.$disconnect();
}
```

### Type Safety Implementation
- Prisma-generated types for database models
- Strict TypeScript configuration
- Input validation at API boundaries
- Response type consistency

## 🧪 Sample Data

The project includes `tech_products_v3.csv` with 383 sample products across categories:

**Categories:** Laptops, Tablets, Smartphones, Monitors, Keyboards, Mice, Headphones, Webcams, Gaming Accessories, Smart Home Devices

**Brands:** Apple, Samsung, Microsoft, Sony, HP, Dell, Lenovo, Logitech, Razer, Google

**Use Cases:**
- Development testing
- API demonstration
- Performance benchmarking
- Feature validation

## 🚀 Deployment

### Vercel Deployment (Recommended)

1. **Push to GitHub**
2. **Connect to Vercel**
3. **Set environment variables:**
   - `DATABASE_URL`
   - `GOOGLE_GENERATIVE_AI_API_KEY`
4. **Deploy automatically**

### Alternative Platforms

For other deployment platforms:
- Ensure Node.js 18+ runtime
- Configure environment variables
- Set up PostgreSQL database
- Run build process: `npm run build`

## 🔧 Configuration

### Environment Variables
```env
# Database Configuration
DATABASE_URL="postgresql://user:password@host:port/database"

# AI Integration
GOOGLE_GENERATIVE_AI_API_KEY="your-google-ai-api-key"

# Optional: Custom configuration
NEXT_PUBLIC_API_URL="https://your-domain.com"
```

### Database Configuration
```typescript
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"  // or "mysql", "sqlite"
  url      = env("DATABASE_URL")
}
```

## 🧪 Testing the API

### Using cURL
```bash
# Get all products
curl http://localhost:3000/api/products

# Create new category
curl -X POST http://localhost:3000/api/categories \
  -H "Content-Type: application/json" \
  -d '{"name": "New Category"}'

# Upload CSV file
curl -X POST http://localhost:3000/api/upload \
  -F "csv=@tech_products_v3.csv"

# Generate advertisement
curl http://localhost:3000/api/products/advert/1?format=html
```

### Using Postman
1. Import the API endpoints
2. Set base URL to `http://localhost:3000`
3. Test CRUD operations
4. Upload CSV files
5. Generate AI advertisements

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Add tests if applicable
5. Commit changes: `git commit -m 'Add amazing feature'`
6. Push to branch: `git push origin feature/amazing-feature`
7. Open Pull Request

### Development Guidelines
- Follow TypeScript strict mode
- Use Prisma for database operations
- Implement proper error handling
- Add JSDoc comments for functions
- Maintain consistent API response formats

## 📚 Learning Resources

This project demonstrates:
- **Next.js App Router** - Modern React framework patterns
- **Prisma ORM** - Type-safe database operations
- **API Design** - RESTful endpoint structure
- **TypeScript** - Advanced type system usage
- **AI Integration** - Vercel AI SDK implementation
- **File Processing** - CSV parsing and validation
- **Error Handling** - Production-ready patterns

## 📄 License

This project is created for educational and demonstration purposes. Feel free to use it as a reference for learning Next.js, Prisma, and modern API development.

---

**Built with ❤️ using Next.js, Prisma, and Google Gemini**

*This project showcases modern full-stack development practices and serves as a comprehensive example of building production-ready APIs with Next.js.*
