import os
from typing import List, Dict, Any

# Lazy import ChromaDB to avoid startup issues
try:
    import chromadb
    from chromadb.config import Settings
    CHROMA_AVAILABLE = True
except ImportError:
    CHROMA_AVAILABLE = False


def search_tool(query: str, top_k: int = 5) -> List[Dict[str, Any]]:
    """
    Search for relevant code snippets and documentation using Chroma vector database.

    This implements RAG (Retrieval-Augmented Generation) using ChromaDB for semantic search
    of smart contract security knowledge, best practices, and vulnerability patterns.

    Args:
        query: Search query string
        top_k: Number of top results to return

    Returns:
        List of search results with id, score, snippet, and metadata
    """
    try:
        if not CHROMA_AVAILABLE:
            return _fallback_search(query, top_k)

        # Initialize Chroma client with persistent storage
        chroma_client = chromadb.PersistentClient(
            path=os.path.join(os.getcwd(), "agent_service", "data", "chroma_db")
        )

        # Get or create collection
        collection = chroma_client.get_or_create_collection(
            name="smart_contract_knowledge",
            metadata={"description": "Smart contract security knowledge base"}
        )

        # Initialize collection with mock data if empty
        if collection.count() == 0:
            _initialize_knowledge_base(collection)

        # Query the collection
        results = collection.query(
            query_texts=[query],
            n_results=top_k,
            include=["documents", "metadatas", "distances"]
        )

        # Format results
        formatted_results = []
        if results["documents"] and results["metadatas"] and results["distances"]:
            for i in range(len(results["documents"][0])):
                formatted_results.append({
                    "id": results["ids"][0][i],
                    "score": 1.0 - results["distances"][0][i],  # Convert distance to similarity score
                    "snippet": results["documents"][0][i],
                    "metadata": results["metadatas"][0][i]
                })

        return formatted_results

    except Exception as e:
        # Fallback to basic keyword search if Chroma fails
        return _fallback_search(query, top_k)


def _initialize_knowledge_base(collection):
    """Initialize the knowledge base with mock security data."""
    documents = [
        "Reentrancy vulnerabilities occur when external calls are made before state updates. Always update state before calling external functions.",
        "Use require(msg.sender == owner) for access control. Consider using OpenZeppelin's Ownable contract for standardized implementation.",
        "Solidity 0.8+ has built-in overflow protection. For older versions, use SafeMath library for arithmetic operations.",
        "Use uint256 for state variables unless smaller sizes are sufficient. Packing variables can save gas costs.",
        "Emit events for important state changes. Events provide transparency and enable off-chain monitoring.",
        "Avoid using block.timestamp for critical logic. Miners can manipulate timestamp within certain bounds."
    ]

    metadatas = [
        {"type": "security_pattern", "category": "reentrancy", "source": "OWASP_Smart_Contract_Security"},
        {"type": "best_practice", "category": "access_control", "source": "OpenZeppelin_Docs"},
        {"type": "vulnerability", "category": "arithmetic", "source": "Solidity_Documentation"},
        {"type": "optimization", "category": "gas_efficiency", "source": "Ethereum_Gas_Optimization_Guide"},
        {"type": "best_practice", "category": "logging", "source": "Ethereum_Event_Best_Practices"},
        {"type": "vulnerability", "category": "timestamp_dependency", "source": "Smart_Contract_Weaknesses"}
    ]

    ids = [
        "reentrancy_pattern_001",
        "access_control_002",
        "integer_overflow_003",
        "gas_optimization_004",
        "event_logging_005",
        "timestamp_dependency_006"
    ]

    collection.add(
        documents=documents,
        metadatas=metadatas,
        ids=ids
    )


def _fallback_search(query: str, top_k: int = 5) -> List[Dict[str, Any]]:
    """Fallback keyword-based search if Chroma fails."""
    mock_results = [
        {
            "id": "reentrancy_pattern_001",
            "score": 0.95,
            "snippet": "Reentrancy vulnerabilities occur when external calls are made before state updates. Always update state before calling external functions.",
            "metadata": {"type": "security_pattern", "category": "reentrancy", "source": "OWASP_Smart_Contract_Security"}
        },
        {
            "id": "access_control_002",
            "score": 0.89,
            "snippet": "Use require(msg.sender == owner) for access control. Consider using OpenZeppelin's Ownable contract for standardized implementation.",
            "metadata": {"type": "best_practice", "category": "access_control", "source": "OpenZeppelin_Docs"}
        },
        {
            "id": "integer_overflow_003",
            "score": 0.87,
            "snippet": "Solidity 0.8+ has built-in overflow protection. For older versions, use SafeMath library for arithmetic operations.",
            "metadata": {"type": "vulnerability", "category": "arithmetic", "source": "Solidity_Documentation"}
        },
        {
            "id": "gas_optimization_004",
            "score": 0.82,
            "snippet": "Use uint256 for state variables unless smaller sizes are sufficient. Packing variables can save gas costs.",
            "metadata": {"type": "optimization", "category": "gas_efficiency", "source": "Ethereum_Gas_Optimization_Guide"}
        },
        {
            "id": "event_logging_005",
            "score": 0.78,
            "snippet": "Emit events for important state changes. Events provide transparency and enable off-chain monitoring.",
            "metadata": {"type": "best_practice", "category": "logging", "source": "Ethereum_Event_Best_Practices"}
        },
        {
            "id": "timestamp_dependency_006",
            "score": 0.75,
            "snippet": "Avoid using block.timestamp for critical logic. Miners can manipulate timestamp within certain bounds.",
            "metadata": {"type": "vulnerability", "category": "timestamp_dependency", "source": "Smart_Contract_Weaknesses"}
        }
    ]

    # Simple keyword filtering
    filtered_results = []
    query_lower = query.lower()

    for result in mock_results:
        if any(keyword in query_lower for keyword in [
            result["metadata"]["category"],
            result["metadata"]["type"]
        ]) or any(word in result["snippet"].lower() for word in query_lower.split()):
            filtered_results.append(result)

    return sorted(filtered_results, key=lambda x: x["score"], reverse=True)[:top_k]