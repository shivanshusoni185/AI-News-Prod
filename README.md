# TheCloudMind.ai - AI News Platform

A modern, full-stack news platform dedicated to artificial intelligence news and insights.

![TheCloudMind.ai](client/src/assets/logo.jpg)

## Features

- **Latest AI News**: Browse and read the latest AI news articles
- **Rich Content**: Articles with images, tags, and detailed content
- **Admin Dashboard**: Manage articles, publish/unpublish content
- **Contact Form**: Users can contact via integrated form
- **About Page**: Learn more about TheCloudMind.ai
- **Responsive Design**: Beautiful UI that works on all devices
- **Search Functionality**: Search through articles

## Tech Stack

### Frontend
- **React** (v19.2.0) - UI framework
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **TailwindCSS** - Styling
- **Axios** - HTTP client
- **Lucide React** - Icon library

### Backend
- **FastAPI** - Python web framework
- **SQLAlchemy** - ORM
- **PostgreSQL/Supabase** - Database
- **Uvicorn** - ASGI server
- **Argon2** - Password hashing
- **JWT** - Authentication

## Project Structure

```
AI-Newsroom/
├── backend/
│   ├── app/
│   │   ├── routers/        # API routes
│   │   ├── models.py       # Database models
│   │   ├── schemas.py      # Pydantic schemas
│   │   ├── database.py     # Database connection
│   │   ├── auth.py         # Authentication logic
│   │   └── main.py         # FastAPI app
│   ├── uploads/            # Uploaded images
│   ├── .env                # Environment variables
│   └── requirements.txt    # Python dependencies
│
└── client/
    ├── src/
    │   ├── components/     # React components
    │   ├── pages/          # Page components
    │   ├── lib/            # Utilities
    │   └── assets/         # Static assets
    ├── public/             # Public files
    └── package.json        # Node dependencies
```

## Installation

### Prerequisites
- Python 3.11+
- Node.js 16+
- PostgreSQL or Supabase account

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create a `.env` file in the backend directory:
```env
DATABASE_URL=postgresql://user:password@host:5432/database
ADMIN_USERNAME=your_admin_email@example.com
ADMIN_PASSWORD=your_secure_password
JWT_SECRET=your_jwt_secret_key
```

5. Run the backend server:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup

1. Navigate to the client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## Environment Variables

### Backend (.env)
- `DATABASE_URL` - PostgreSQL connection string
- `ADMIN_USERNAME` - Admin login username/email
- `ADMIN_PASSWORD` - Admin login password
- `JWT_SECRET` - Secret key for JWT tokens

## API Endpoints

### Public Endpoints
- `GET /news` - Get all published news articles
- `GET /news/{id}` - Get specific article by ID
- `POST /contact/` - Submit contact form

### Admin Endpoints (Requires Authentication)
- `POST /admin/login` - Admin login
- `GET /admin/news` - Get all news (including unpublished)
- `POST /admin/news` - Create new article
- `PUT /admin/news/{id}` - Update article
- `DELETE /admin/news/{id}` - Delete article
- `GET /contact/` - Get all contact submissions
- `DELETE /contact/{id}` - Delete contact submission

## Features in Detail

### News Management
- Create, read, update, and delete articles
- Upload images for articles
- Add tags to categorize content
- Publish/unpublish articles
- Rich text content support

### User Interface
- Modern, gradient-based design
- Responsive layout for all screen sizes
- Smooth animations and transitions
- Professional branding with logo integration

### Contact System
- Contact form with validation
- Store submissions in database
- Admin can view and manage submissions

## Development

### Backend Development
```bash
cd backend
uvicorn app.main:app --reload
```

### Frontend Development
```bash
cd client
npm run dev
```

### Building for Production

#### Frontend Build
```bash
cd client
npm run build
```

The build output will be in `client/dist/`

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Contact

- Email: shivanshusoni1111@gmail.com
- Website: [cloudmindai.in]

## Acknowledgments

- Logo and branding design
- AI community for inspiration
- Open source libraries and frameworks used

---

Made with ❤️ for AI Enthusiasts
