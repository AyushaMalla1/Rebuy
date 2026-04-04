"""
PyTest Test Suite for AI Chatbot API
Tests the chatbot server endpoints and response generation
"""

import pytest
import requests
import json
from time import time

# Base URL for chatbot server
BASE_URL = "http://localhost:5001"

class TestChatbotAPI:
    """Test suite for chatbot API endpoints"""
    
    def test_server_health(self):
        """Test if chatbot server is running"""
        try:
            response = requests.get(f"{BASE_URL}/health", timeout=5)
            assert response.status_code == 200
            data = response.json()
            assert data.get("status") == "healthy"
        except requests.exceptions.ConnectionError:
            pytest.skip("Chatbot server is not running")
    
    def test_query_endpoint_exists(self):
        """Test if /query endpoint exists"""
        response = requests.post(
            f"{BASE_URL}/query",
            json={"message": "test"},
            timeout=10
        )
        assert response.status_code in [200, 400, 422]  # Should not be 404
    
    def test_simple_query(self):
        """Test simple customer query"""
        payload = {
            "message": "What are your payment options?",
            "userId": "test_user_123",
            "role": "customer"
        }
        
        response = requests.post(
            f"{BASE_URL}/query",
            json=payload,
            timeout=10
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "response" in data
        assert len(data["response"]) > 0
    
    def test_order_tracking_query(self):
        """Test order tracking query"""
        payload = {
            "message": "How can I track my order?",
            "userId": "test_user_123",
            "role": "customer"
        }
        
        response = requests.post(
            f"{BASE_URL}/query",
            json=payload,
            timeout=10
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "response" in data
        assert any(keyword in data["response"].lower() for keyword in ["track", "order", "status"])
    
    def test_seller_query(self):
        """Test seller-specific query"""
        payload = {
            "message": "How do I add a new product?",
            "userId": "seller_123",
            "role": "seller"
        }
        
        response = requests.post(
            f"{BASE_URL}/query",
            json=payload,
            timeout=10
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "response" in data
    
    def test_admin_query(self):
        """Test admin-specific query"""
        payload = {
            "message": "Show me platform statistics",
            "userId": "admin_123",
            "role": "admin"
        }
        
        response = requests.post(
            f"{BASE_URL}/query",
            json=payload,
            timeout=10
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "response" in data
    
    def test_response_time(self):
        """Test if response time is under 3 seconds"""
        payload = {
            "message": "What is your return policy?",
            "userId": "test_user_123",
            "role": "customer"
        }
        
        start_time = time()
        response = requests.post(
            f"{BASE_URL}/query",
            json=payload,
            timeout=10
        )
        end_time = time()
        
        response_time = end_time - start_time
        assert response_time < 3.0, f"Response time {response_time}s exceeds 3 seconds"
        assert response.status_code == 200
    
    def test_empty_message(self):
        """Test handling of empty message"""
        payload = {
            "message": "",
            "userId": "test_user_123",
            "role": "customer"
        }
        
        response = requests.post(
            f"{BASE_URL}/query",
            json=payload,
            timeout=10
        )
        
        # Should either reject or handle gracefully
        assert response.status_code in [200, 400, 422]
    
    def test_missing_role(self):
        """Test handling of missing role parameter"""
        payload = {
            "message": "Hello",
            "userId": "test_user_123"
        }
        
        response = requests.post(
            f"{BASE_URL}/query",
            json=payload,
            timeout=10
        )
        
        # Should either use default role or reject
        assert response.status_code in [200, 400, 422]
    
    def test_invalid_role(self):
        """Test handling of invalid role"""
        payload = {
            "message": "Hello",
            "userId": "test_user_123",
            "role": "invalid_role"
        }
        
        response = requests.post(
            f"{BASE_URL}/query",
            json=payload,
            timeout=10
        )
        
        # Should reject or use default
        assert response.status_code in [200, 400, 422]
    
    def test_long_message(self):
        """Test handling of very long message"""
        long_message = "What is your policy? " * 100  # Very long message
        payload = {
            "message": long_message,
            "userId": "test_user_123",
            "role": "customer"
        }
        
        response = requests.post(
            f"{BASE_URL}/query",
            json=payload,
            timeout=15
        )
        
        assert response.status_code in [200, 400, 413, 422]
    
    def test_special_characters(self):
        """Test handling of special characters in message"""
        payload = {
            "message": "What's the price of items with 50% discount? #sale @store",
            "userId": "test_user_123",
            "role": "customer"
        }
        
        response = requests.post(
            f"{BASE_URL}/query",
            json=payload,
            timeout=10
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "response" in data
    
    def test_multiple_questions(self):
        """Test handling of multiple questions in one message"""
        payload = {
            "message": "What are your payment options? How do I track my order? What is your return policy?",
            "userId": "test_user_123",
            "role": "customer"
        }
        
        response = requests.post(
            f"{BASE_URL}/query",
            json=payload,
            timeout=10
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "response" in data
        assert len(data["response"]) > 50  # Should have substantial response


class TestChatbotAccuracy:
    """Test suite for chatbot response accuracy"""
    
    def test_payment_options_accuracy(self):
        """Test if chatbot correctly mentions payment options"""
        payload = {
            "message": "What payment methods do you accept?",
            "userId": "test_user_123",
            "role": "customer"
        }
        
        response = requests.post(
            f"{BASE_URL}/query",
            json=payload,
            timeout=10
        )
        
        assert response.status_code == 200
        data = response.json()
        response_text = data["response"].lower()
        
        # Should mention at least one payment method
        assert any(method in response_text for method in ["esewa", "cod", "cash", "delivery"])
    
    def test_shipping_info_accuracy(self):
        """Test if chatbot provides shipping information"""
        payload = {
            "message": "Do you offer free shipping?",
            "userId": "test_user_123",
            "role": "customer"
        }
        
        response = requests.post(
            f"{BASE_URL}/query",
            json=payload,
            timeout=10
        )
        
        assert response.status_code == 200
        data = response.json()
        response_text = data["response"].lower()
        
        # Should mention shipping or delivery
        assert any(keyword in response_text for keyword in ["shipping", "delivery", "free", "charge"])


class TestChatbotPerformance:
    """Test suite for chatbot performance metrics"""
    
    def test_concurrent_requests(self):
        """Test handling of multiple concurrent requests"""
        import concurrent.futures
        
        def send_query(i):
            payload = {
                "message": f"Test query {i}",
                "userId": f"test_user_{i}",
                "role": "customer"
            }
            response = requests.post(
                f"{BASE_URL}/query",
                json=payload,
                timeout=15
            )
            return response.status_code == 200
        
        with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
            results = list(executor.map(send_query, range(5)))
        
        # At least 80% should succeed
        success_rate = sum(results) / len(results)
        assert success_rate >= 0.8
    
    def test_average_response_time(self):
        """Test average response time over multiple requests"""
        times = []
        
        for i in range(5):
            payload = {
                "message": "What are your store hours?",
                "userId": f"test_user_{i}",
                "role": "customer"
            }
            
            start_time = time()
            response = requests.post(
                f"{BASE_URL}/query",
                json=payload,
                timeout=10
            )
            end_time = time()
            
            if response.status_code == 200:
                times.append(end_time - start_time)
        
        if times:
            avg_time = sum(times) / len(times)
            assert avg_time < 2.5, f"Average response time {avg_time}s exceeds 2.5 seconds"


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
