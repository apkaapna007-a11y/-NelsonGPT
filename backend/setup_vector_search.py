#!/usr/bin/env python3
"""
Setup MongoDB Atlas Vector Search Indexes for Nelson-GPT RAG Pipeline
"""

import os
import json
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

def setup_vector_search_indexes():
    """Create vector search indexes on MongoDB Atlas"""

    client = MongoClient(os.getenv('MONGODB_URI'))
    db = client['supabase_migration']

    print("="*70)
    print("SETTING UP MONGODB ATLAS VECTOR SEARCH FOR NELSON-GPT")
    print("="*70)
    print()

    # Note: Vector search indexes must be created through MongoDB Atlas UI or API
    # This script provides the index definitions

    print("📋 VECTOR SEARCH INDEX DEFINITIONS")
    print("="*70)
    print()

    # Medical Embeddings Vector Search Index
    medical_embeddings_index = {
        "name": "vector_index_medical",
        "type": "vectorSearch",
        "definition": {
            "fields": [
                {
                    "type": "vector",
                    "path": "embedding_vector",
                    "numDimensions": 384,  # Will be determined from actual data
                    "similarity": "cosine"
                },
                {
                    "type": "filter",
                    "path": "medical_specialty"
                },
                {
                    "type": "filter",
                    "path": "confidence_score"
                }
            ]
        }
    }

    print("1. MEDICAL_EMBEDDINGS COLLECTION")
    print("-" * 70)
    print("Index Name: vector_index_medical")
    print("Collection: medical_embeddings")
    print()
    print("Index Definition (JSON):")
    print(json.dumps(medical_embeddings_index, indent=2))
    print()

    # Godzilla Medical Dataset - needs embedding field
    godzilla_index = {
        "name": "vector_index_godzilla",
        "type": "vectorSearch",
        "definition": {
            "fields": [
                {
                    "type": "vector",
                    "path": "text_embedding",
                    "numDimensions": 384,
                    "similarity": "cosine"
                },
                {
                    "type": "filter",
                    "path": "medical_specialty"
                },
                {
                    "type": "filter",
                    "path": "clinical_relevance_score"
                },
                {
                    "type": "filter",
                    "path": "age_groups"
                }
            ]
        }
    }

    print("2. GODZILLA_MEDICAL_DATASET COLLECTION")
    print("-" * 70)
    print("Index Name: vector_index_godzilla")
    print("Collection: godzilla_medical_dataset")
    print()
    print("Index Definition (JSON):")
    print(json.dumps(godzilla_index, indent=2))
    print()

    # Drug Dosages Search Index (text search)
    drug_search_index = {
        "name": "drug_search_index",
        "type": "search",
        "definition": {
            "mappings": {
                "dynamic": False,
                "fields": {
                    "drug_name": {
                        "type": "string",
                        "analyzer": "lucene.standard"
                    },
                    "generic_name": {
                        "type": "string",
                        "analyzer": "lucene.standard"
                    },
                    "indication": {
                        "type": "string",
                        "analyzer": "lucene.standard"
                    },
                    "age_group": {
                        "type": "string"
                    },
                    "route": {
                        "type": "string"
                    }
                }
            }
        }
    }

    print("3. PEDIATRIC_DRUG_DOSAGES COLLECTION (Text Search)")
    print("-" * 70)
    print("Index Name: drug_search_index")
    print("Collection: pediatric_drug_dosages")
    print()
    print("Index Definition (JSON):")
    print(json.dumps(drug_search_index, indent=2))
    print()

    print("="*70)
    print("📝 INSTRUCTIONS TO CREATE INDEXES")
    print("="*70)
    print()
    print("Option 1: MongoDB Atlas UI")
    print("-" * 70)
    print("1. Go to https://cloud.mongodb.com/")
    print("2. Navigate to your cluster: peadknowledgebase")
    print("3. Click 'Search' tab")
    print("4. Click 'Create Search Index'")
    print("5. Select 'JSON Editor'")
    print("6. Paste the index definitions above")
    print("7. Select the appropriate collection")
    print("8. Click 'Create Search Index'")
    print()

    print("Option 2: MongoDB Atlas API")
    print("-" * 70)
    print("Use the Atlas Admin API to create indexes programmatically")
    print()

    print("Option 3: Use this script's helper function")
    print("-" * 70)
    print("Run: python setup_vector_search.py --create-indexes")
    print("(Requires Atlas API keys)")
    print()

    # Check current embedding dimension
    print("="*70)
    print("🔍 ANALYZING EXISTING EMBEDDINGS")
    print("="*70)
    print()

    medical_embeddings = db['medical_embeddings']
    sample = medical_embeddings.find_one({'_metadata': {'$exists': False}})

    if sample and 'embedding' in sample:
        embedding_str = sample['embedding']

        # Try to parse the embedding
        try:
            import ast
            if isinstance(embedding_str, str):
                embedding_list = ast.literal_eval(embedding_str)
                dimension = len(embedding_list)
                print(f"✓ Embedding dimension detected: {dimension}")
                print(f"  Update numDimensions in index definition to: {dimension}")
                print()

                # Update index definitions
                medical_embeddings_index['definition']['fields'][0]['numDimensions'] = dimension
                godzilla_index['definition']['fields'][0]['numDimensions'] = dimension

                print("✓ Index definitions updated with correct dimension")
            else:
                print("⚠ Embedding format not recognized")
        except Exception as e:
            print(f"⚠ Could not parse embedding: {e}")

    print()
    print("="*70)
    print("✅ SETUP COMPLETE")
    print("="*70)
    print()
    print("Next steps:")
    print("1. Create the vector search indexes in MongoDB Atlas")
    print("2. Run the RAG pipeline setup script")
    print("3. Test semantic search with sample queries")
    print()

    client.close()

    return {
        'medical_embeddings_index': medical_embeddings_index,
        'godzilla_index': godzilla_index,
        'drug_search_index': drug_search_index
    }


if __name__ == "__main__":
    import sys

    if '--create-indexes' in sys.argv:
        print("⚠ Atlas API integration not yet implemented")
        print("Please create indexes manually through Atlas UI")
        print()

    setup_vector_search_indexes()
