# Nelson-GPT Backend Setup

This directory contains backend utilities and setup scripts for the Nelson-GPT RAG pipeline, specifically for MongoDB Atlas Vector Search integration.

## 🗂️ Files Overview

- `setup_vector_search.py` - MongoDB Atlas vector search index setup script
- `requirements.txt` - Python dependencies for backend operations
- `README.md` - This documentation file

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure Environment

Create a `.env` file in the backend directory:

```bash
# MongoDB Atlas Connection
MONGODB_URI=mongodb+srv://username:password@peadknowledgebase.mongodb.net/

# Optional: MongoDB Atlas API Keys (for programmatic index creation)
ATLAS_PUBLIC_KEY=your_atlas_public_key
ATLAS_PRIVATE_KEY=your_atlas_private_key
ATLAS_PROJECT_ID=your_project_id
```

### 3. Run Vector Search Setup

```bash
python setup_vector_search.py
```

This will:
- Connect to your MongoDB Atlas cluster
- Analyze existing embedding dimensions
- Display vector search index definitions
- Provide instructions for creating indexes

## 📋 MongoDB Atlas Vector Search Indexes

The setup script creates definitions for three indexes:

### 1. Medical Embeddings Index
- **Collection**: `medical_embeddings`
- **Index Name**: `vector_index_medical`
- **Vector Field**: `embedding_vector`
- **Dimensions**: Auto-detected (typically 384)
- **Similarity**: Cosine

### 2. Godzilla Medical Dataset Index
- **Collection**: `godzilla_medical_dataset`
- **Index Name**: `vector_index_godzilla`
- **Vector Field**: `text_embedding`
- **Dimensions**: Auto-detected (typically 384)
- **Similarity**: Cosine

### 3. Drug Search Index (Text Search)
- **Collection**: `pediatric_drug_dosages`
- **Index Name**: `drug_search_index`
- **Type**: Text search (not vector)
- **Fields**: `drug_name`, `generic_name`, `indication`

## 🔧 Manual Index Creation

Since MongoDB Atlas requires manual index creation through the UI or API, follow these steps:

### Option 1: MongoDB Atlas UI

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Navigate to your cluster: `peadknowledgebase`
3. Click the **"Search"** tab
4. Click **"Create Search Index"**
5. Select **"JSON Editor"**
6. Copy the index definition from the script output
7. Select the appropriate collection
8. Click **"Create Search Index"**

### Option 2: MongoDB Atlas API

Use the Atlas Admin API with your API keys to create indexes programmatically.

## 🔗 Frontend Integration

The frontend uses the MongoDB Atlas Data API to perform vector searches. Configure these environment variables in your main `.env` file:

```bash
# MongoDB Atlas Data API
VITE_MONGODB_DATA_API_URL=https://data.mongodb-api.com/app/your-app-id/endpoint/data/v1
VITE_MONGODB_API_KEY=your_mongodb_atlas_api_key
VITE_MONGODB_CLUSTER=peadknowledgebase
VITE_MONGODB_DATABASE=supabase_migration
```

## 📊 Data Structure

### Medical Embeddings Collection
```json
{
  "_id": "ObjectId",
  "content": "Medical text content",
  "embedding_vector": [0.1, 0.2, ...], // 384-dimensional vector
  "medical_specialty": "pediatrics",
  "confidence_score": 0.95,
  "chapter": "Chapter 45",
  "page_number": 123,
  "section": "Respiratory Disorders"
}
```

### Godzilla Medical Dataset Collection
```json
{
  "_id": "ObjectId",
  "content": "Medical text content",
  "text_embedding": [0.1, 0.2, ...], // 384-dimensional vector
  "medical_specialty": "pediatrics",
  "clinical_relevance_score": 0.9,
  "age_groups": ["infant", "child", "adolescent"]
}
```

### Pediatric Drug Dosages Collection
```json
{
  "_id": "ObjectId",
  "drug_name": "Acetaminophen",
  "generic_name": "paracetamol",
  "indication": "fever, pain",
  "age_group": "pediatric",
  "route": "oral",
  "dosage": "10-15 mg/kg every 4-6 hours"
}
```

## 🧪 Testing Vector Search

After creating the indexes, test the vector search functionality:

```python
from pymongo import MongoClient
import os

client = MongoClient(os.getenv('MONGODB_URI'))
db = client['supabase_migration']

# Test vector search
pipeline = [
    {
        "$vectorSearch": {
            "index": "vector_index_medical",
            "path": "embedding_vector",
            "queryVector": [0.1, 0.2, ...],  # Your query vector
            "numCandidates": 100,
            "limit": 10
        }
    },
    {
        "$addFields": {
            "score": {"$meta": "vectorSearchScore"}
        }
    }
]

results = list(db.medical_embeddings.aggregate(pipeline))
print(f"Found {len(results)} results")
```

## 🔍 Troubleshooting

### Common Issues

1. **Connection Errors**
   - Verify MongoDB URI format
   - Check network access in Atlas (whitelist IP)
   - Ensure database user has proper permissions

2. **Index Creation Fails**
   - Verify collection exists and has data
   - Check embedding field names match index definition
   - Ensure vector dimensions are consistent

3. **Search Returns No Results**
   - Verify index is active (not building)
   - Check query vector dimensions match index
   - Verify similarity threshold settings

### Debug Commands

```bash
# Check connection
python -c "from pymongo import MongoClient; import os; print(MongoClient(os.getenv('MONGODB_URI')).admin.command('ping'))"

# List collections
python -c "from pymongo import MongoClient; import os; db = MongoClient(os.getenv('MONGODB_URI'))['supabase_migration']; print(db.list_collection_names())"

# Check sample document
python -c "from pymongo import MongoClient; import os; db = MongoClient(os.getenv('MONGODB_URI'))['supabase_migration']; print(db.medical_embeddings.find_one())"
```

## 📚 Additional Resources

- [MongoDB Atlas Vector Search Documentation](https://www.mongodb.com/docs/atlas/atlas-vector-search/)
- [MongoDB Atlas Data API Documentation](https://www.mongodb.com/docs/atlas/api/data-api/)
- [Nelson-GPT Frontend Integration Guide](../README.md)

## 🤝 Contributing

When adding new collections or modifying indexes:

1. Update the `setup_vector_search.py` script
2. Update this README with new data structures
3. Update frontend TypeScript types if needed
4. Test the integration end-to-end
