# backend/app/core/o3_client.py
"""
OpenAI O3 Client - Simplified Version for Job Matching
"""

import asyncio
import json
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime
import openai
from openai import AsyncOpenAI
import os

class O3ClientSimplified:
    """Simplified O3 client for job matching"""
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        if not self.api_key:
            raise ValueError("OpenAI API key is required. Please set OPENAI_API_KEY environment variable")
        
        self.client = AsyncOpenAI(api_key=self.api_key)
        self.model = "o3-2025-04-16"  # or fallback to "gpt-4" for testing
        self.reasoning_effort = "high"
        
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)
    
    async def batch_screening(self, cvs: List[Dict], job_description: str,
                              qualification_threshold: float = 85.0,
                              elimination_conditions: Optional[str] = None) -> Dict[str, Any]:
        """
        Simplified batch screening that actually works
        """
        
        # Simplified, working prompt
        screening_prompt = f"""
        Analyze {len(cvs)} candidates for the position described below using your advanced reasoning capabilities.

        JOB REQUIREMENTS:
        {job_description}

        ELIMINATION CONDITIONS:
        {elimination_conditions or 'None'}

        CANDIDATES TO ANALYZE:
        {json.dumps(cvs, indent=2)}

        Qualification threshold: {qualification_threshold}%

        For each candidate, analyze their qualifications and provide a detailed assessment.
        Return a JSON object with this exact structure:
        {{
            "analysis": {{
                "total_candidates": {len(cvs)},
                "qualification_threshold": {qualification_threshold},
                "screening_date": "{datetime.now().isoformat()}"
            }},
            "candidates": [
                {{
                    "id": "candidate_id",
                    "name": "candidate_name", 
                    "overall_score": 85.5,
                    "qualified": true,
                    "strengths": ["strength1", "strength2"],
                    "weaknesses": ["weakness1"],
                    "match_summary": "Brief summary of fit"
                }}
            ],
            "summary": {{
                "qualified_count": 0,
                "top_candidates": [],
                "recommendations": "Overall recommendations"
            }}
        }}
        """
        
        try:
            system_msg = (
                "You are an advanced AI recruitment specialist with expertise in candidate evaluation. "
                "Analyze each candidate thoroughly and provide detailed, objective assessments."
            )
            
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_msg},
                    {"role": "user", "content": screening_prompt}
                ],
                response_format={"type": "json_object"},
                max_completion_tokens=16000,
                reasoning_effort=self.reasoning_effort
            )
            
            raw_content = response.choices[0].message.content
            self.logger.info(f"O3 response length: {len(raw_content)} characters")
            
            if not raw_content:
                return self._fallback_response(cvs, "Empty response from O3")
            
            try:
                result = json.loads(raw_content)
                return result
            except json.JSONDecodeError as e:
                self.logger.error(f"Failed to parse O3 response: {e}")
                return self._fallback_response(cvs, f"JSON parse error: {e}")
                
        except Exception as e:
            self.logger.error(f"O3 batch screening error: {str(e)}")
            return self._fallback_response(cvs, f"O3 API error: {str(e)}")
    
    def _fallback_response(self, cvs: List[Dict], error_msg: str) -> Dict[str, Any]:
        """Generate fallback response when O3 fails"""
        return {
            "analysis": {
                "total_candidates": len(cvs),
                "qualification_threshold": 85.0,
                "screening_date": datetime.now().isoformat(),
                "error": error_msg
            },
            "candidates": [
                {
                    "id": cv.get("id", f"candidate_{i}"),
                    "name": cv.get("name", f"Candidate {i+1}"),
                    "overall_score": 50.0,
                    "qualified": False,
                    "strengths": ["Resume uploaded successfully"],
                    "weaknesses": ["Could not analyze due to system error"],
                    "match_summary": f"Analysis failed: {error_msg}"
                }
                for i, cv in enumerate(cvs)
            ],
            "summary": {
                "qualified_count": 0,
                "top_candidates": [],
                "recommendations": f"System error occurred: {error_msg}. Please try again."
            }
        }
    
    async def health_check(self) -> Dict[str, Any]:
        """Check O3 model health"""
        try:
            start_time = datetime.now()
            
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": "Test message: Analyze what makes a great data scientist."}],
                max_completion_tokens=100
            )
            
            response_time = datetime.now() - start_time
            
            return {
                "status": "healthy",
                "model": self.model,
                "reasoning_effort": self.reasoning_effort,
                "response_time_ms": response_time.total_seconds() * 1000,
                "message": "O3 model responding normally"
            }
            
        except Exception as e:
            return {
                "status": "error",
                "model": self.model,
                "error": str(e),
                "message": "O3 model not available"
            }


# Create client instance
def get_o3_client():
    """Get O3 client instance"""
    try:
        return O3ClientSimplified()
    except Exception as e:
        logging.error(f"Failed to initialize O3 client: {e}")
        return None