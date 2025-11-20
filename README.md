# 🩺 Nelson-GPT — Pediatric Knowledge Assistant

A comprehensive, evidence-based pediatric AI assistant powered by the Nelson Textbook of Pediatrics, featuring RAG (Retrieval-Augmented Generation) capabilities with real-time streaming responses and automatic citations.

## 🚀 Features

- **📱 Progressive Web App (PWA)** - Installable on mobile and desktop
- **🔄 Real-time Streaming** - Live AI responses with Mistral API integration
- **🔍 Vector Search** - Semantic search through medical knowledge base
- **📚 Automatic Citations** - Source attribution to Nelson Textbook chapters
- **🎨 Medical-themed UI** - Professional, warm design optimized for healthcare
- **♿ Accessibility** - WCAG compliant with keyboard navigation
- **🌐 Offline Support** - Service worker caching for offline functionality

## 🏗️ Architecture

### Frontend Stack
- **React 18** with TypeScript and Vite
- **TailwindCSS** with custom medical theme
- **Zustand** for state management
- **Framer Motion** for animations
- **PWA** with service worker

### Backend Integration
- **Vector Search**: MongoDB Atlas Vector Search or Supabase pgvector
- **LLM**: Mistral API with streaming support
- **Embeddings**: Hugging Face sentence-transformers
- **Citations**: Automatic source attribution system

## 📁 Project Structure

```
nelson-gpt/
├── src/
│   ├── components/          # React UI components
│   ├── store/              # Zustand state management
│   ├── utils/              # API integrations & utilities
│   ├── types/              # TypeScript definitions
│   └── styles/             # Global CSS & design system
├── backend/                # Python setup scripts
│   ├── setup_vector_search.py
│   ├── requirements.txt
│   └── README.md
├── public/                 # PWA assets
└── Configuration files
```
## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/apkaapna007-a11y/-NelsonGPT.git
cd -NelsonGPT
npm install
```

### 2. Environment Setup

Copy the environment template and configure your API keys:

```bash
cp .env.example .env
```

Edit `.env` with your API credentials:

```bash
# Required: Mistral AI
VITE_MISTRAL_API_KEY=your_mistral_api_key

# Required: Hugging Face (for embeddings)
VITE_HF_API_KEY=your_hugging_face_api_key

# Choose ONE vector search provider:

# Option A: Supabase (recommended)
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Option B: MongoDB Atlas
VITE_MONGODB_DATA_API_URL=your_mongodb_data_api_url
VITE_MONGODB_API_KEY=your_mongodb_atlas_api_key
```

### 3. Database Setup

#### Option A: Supabase Setup
1. Create a [Supabase](https://supabase.com) project
2. Enable the pgvector extension
3. Run the SQL schema from `src/utils/supabase.ts`
4. Load your medical embeddings data

#### Option B: MongoDB Atlas Setup
1. Create a [MongoDB Atlas](https://cloud.mongodb.com) cluster
2. Set up the vector search indexes:
   ```bash
   cd backend
   pip install -r requirements.txt
   python setup_vector_search.py
   ```
3. Follow the instructions to create vector search indexes
4. Load your medical embeddings data

### 4. Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🔧 API Keys Setup

### Mistral AI
1. Go to [Mistral AI Console](https://console.mistral.ai/)
2. Create an account and generate an API key
3. Add to `.env`: `VITE_MISTRAL_API_KEY=your_key`

### Hugging Face
1. Go to [Hugging Face](https://huggingface.co/settings/tokens)
2. Create a new token with read permissions
3. Add to `.env`: `VITE_HF_API_KEY=your_token`

### Supabase (Option A)
1. Create a new project at [Supabase](https://supabase.com)
2. Go to Settings → API
3. Copy the URL and anon key to `.env`

### MongoDB Atlas (Option B)
1. Create a cluster at [MongoDB Atlas](https://cloud.mongodb.com)
2. Enable Data API in your project
3. Create an API key and add to `.env`

## 📊 Data Requirements

Nelson-GPT requires medical embeddings data in your chosen vector database:

### Data Format
```json
{
  "content": "Medical text content from Nelson Textbook",
  "embedding": [0.1, 0.2, ...], // 384-dimensional vector
  "metadata": {
    "chapter": "Chapter 45",
    "page": 123,
    "section": "Respiratory Disorders"
  }
}
```

### Loading Data
- For Supabase: Use the Supabase client to insert embeddings
- For MongoDB: Use the Python scripts in the `backend/` directory

## 🧪 Testing

```bash
# Run type checking
npm run build

# Test development server
npm run dev
```

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main

### Netlify
1. Connect repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables

### Self-hosted
```bash
npm run build
# Serve the `dist` directory with any static file server
```

## 🔍 Troubleshooting

### Common Issues

1. **Build Errors**
   - Ensure all environment variables are set
   - Check TypeScript compilation: `npm run build`

2. **API Connection Issues**
   - Verify API keys are correct and active
   - Check network connectivity
   - Review browser console for errors

3. **Vector Search Not Working**
   - Ensure vector database is set up correctly
   - Verify embeddings data is loaded
   - Check vector search indexes are created

### Debug Mode
Set `VITE_DEV_MODE=true` in your `.env` for detailed logging.

## 📚 Documentation

- [Backend Setup Guide](backend/README.md) - MongoDB Atlas vector search setup
- API Documentation: coming soon
- Deployment Guide: coming soon

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Medical Disclaimer

Nelson-GPT is designed as an educational and reference tool for healthcare professionals. It should not be used as a substitute for professional medical judgment, diagnosis, or treatment. Always consult with qualified healthcare providers for medical decisions.

---

**Nelson-GPT** - Empowering pediatric healthcare with AI-driven knowledge assistance.
