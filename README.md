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

## 📡 API Routes

### Categories
```
GET    /api/categories              # List all categories
POST   /api/categories              # Create new category
GET    /api/categories/[id]         # Get category by ID
PUT    /api/categories/[id]         # Update category
DELETE /api/categories/[id]         # Delete category
```

### Brands (Marks)
```
GET    /api/marks                   # List all brands/marks
POST   /api/marks                   # Create new brand/mark
GET    /api/marks/[id]              # Get mark by ID
PUT    /api/marks/[id]              # Update mark
DELETE /api/marks/[id]              # Delete mark
```

### Products
```
GET    /api/products                # List all products
POST   /api/products                # Create new product
GET    /api/products/[id]           # Get product by ID
PUT    /api/products/[id]           # Update product
DELETE /api/products/[id]           # Delete product
```

### AI Advertisement Generation
```
GET    /api/products/advert/[id]    # Generate AI advertisement for product
```

### CSV Bulk Import
```
POST   /api/upload                  # Bulk import products from CSV file
```

**CSV Format Requirements:**
```csv
Product Name,Mark,Category,Price,Stock
Apple Laptops Product 1,Apple,Laptops,1770.49,39
Samsung Gaming Accessories,Samsung,Gaming Accessories,1008.49,57
```

**Import Process:**
- Automatically creates categories and marks if they don't exist
- Products are created or updated based on existing name
- Validates required fields and data types
- Returns comprehensive error reporting

## 📝 API Response Formats

The API uses different response formats depending on the endpoint:

### Standard Entity Responses
Most endpoints return the entity directly:
```json
{
  "id": 1,
  "name": "Laptops",
  "createdAt": "2025-09-26T10:30:00.000Z",
  "updatedAt": "2025-09-26T10:30:00.000Z"
}
```

### Array Responses (GET /api/categories, /api/marks, /api/products)
```json
[
  {
    "id": 1,
    "name": "Laptops",
    "createdAt": "2025-09-26T10:30:00.000Z",
    "updatedAt": "2025-09-26T10:30:00.000Z"
  },
  {
    "id": 2,
    "name": "Tablets",
    "createdAt": "2025-09-26T10:30:00.000Z",
    "updatedAt": "2025-09-26T10:30:00.000Z"
  }
]
```

### Success Responses with Messages (DELETE operations)
```json
{
  "message": "Category deleted successfully",
  "data": {
    "id": 1,
    "name": "Laptops"
  }
}
```

### Advertisement Response
```json
{
    "advert": {
        "success": true,
        "data": {
            "text": "advert text"
        }
    }
}
```

### Error Responses
```json
{
  "message": "Resource not found"
}
```

### Validation Error Examples
```json
{
  "message": "Bad request. Missing required fields."
}
```

```json
{
  "message": "Cannot delete category with associated products."
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

**Categories:**
```bash
# Get all categories
curl http://localhost:3000/api/categories

# Create new category
curl -X POST http://localhost:3000/api/categories \
  -H "Content-Type: application/json" \
  -d '{"name": "Gaming Laptops"}'

# Get category by ID with products
curl "http://localhost:3000/api/categories/1?includeProducts=true"

# Update category
curl -X PUT http://localhost:3000/api/categories/1 \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Category Name"}'

# Delete category
curl -X DELETE http://localhost:3000/api/categories/1
```

**Marks (Brands):**
```bash
# Get all marks
curl http://localhost:3000/api/marks

# Create new mark
curl -X POST http://localhost:3000/api/marks \
  -H "Content-Type: application/json" \
  -d '{"name": "ASUS"}'

# Get mark with products
curl "http://localhost:3000/api/marks/1?includeProducts=true"
```

**Products:**
```bash
# Get all products
curl http://localhost:3000/api/products

# Create new product
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Gaming Laptop Pro",
    "description": "High-performance gaming laptop",
    "price": 1299.99,
    "stock": 15,
    "categoryId": 1,
    "markId": 1
  }'

# Get product with relations
curl "http://localhost:3000/api/products/1?includeMark=true&includeCategory=true"

# Update product
curl -X PUT http://localhost:3000/api/products/1 \
  -H "Content-Type: application/json" \
  -d '{"price": 1199.99, "stock": 20}'
```

**AI Advertisement:**
```bash
# Generate HTML advertisement
curl "http://localhost:3000/api/products/advert/1?format=html"

# Generate text advertisement  
curl "http://localhost:3000/api/products/advert/1?format=text"
```

**CSV Upload:**
```bash
# Upload CSV file (replace with actual file path)
curl -X POST http://localhost:3000/api/upload \
  -F "csv=@./tech_products_v3.csv"
```

### Using Postman

**Ready-to-Use Postman Files:**

The project includes pre-configured Postman files in the `postman/` directory:

- **Collection**: `postman/ProductManager.postman_collection.json`
- **Environment**: `postman/product-manager.postman_environment.json`

**Quick Setup:**
1. **Import Collection**: In Postman, import `ProductManager.postman_collection.json`
2. **Import Environment**: Import `product-manager.postman_environment.json`
3. **Update Environment Variables**: 
   - Set `baseURL` to your server URL (default: `http://localhost:3000`)
   - Update `port` if using a different port (default: `3000`)
4. **Select Environment**: Choose "product-manager" environment in Postman

**Environment Variables to Configure:**
```json
{
  "baseURL": "http://localhost:3000",  // Change if using different host/port
  "port": "3000"                       // Update if server runs on different port
}
```

**Included Requests:**
- ✅ **Categories**: Full CRUD operations with query parameters
- ✅ **Marks (Brands)**: Complete API coverage
- ✅ **Products**: All endpoints with relation includes
- ✅ **AI Advertisement**: Text and HTML format examples
- ✅ **CSV Upload**: File upload with sample data

**Testing Workflow:**
1. Start with creating categories and marks
2. Create products using valid categoryId and markId
3. Test product retrieval with relations
4. Generate advertisements for created products
5. Test bulk import with sample CSV

**Note**: If deploying to a different environment (staging, production), simply update the `baseURL` in the environment variables to match your deployment URL.

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
