# backend/app/core/o3_client_simplified.py
"""
OpenAI O3 Client - Simplified Version for Job Matching
Fixed version that works with proper prompts and error handling
"""

import asyncio
import json
import logging
from typing import List, Dict, Any, Optional, AsyncGenerator
from datetime import datetime
import openai
from openai import AsyncOpenAI
import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()
class O3ClientSimplified:
    """Simplified O3 client that actually works"""
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("OPENAI_API_KEY") or "your-openai-api-key-here"
        if not self.api_key or self.api_key == "your-openai-api-key-here":
            raise ValueError("OpenAI API key is required. Please set OPENAI_API_KEY environment variable or update the .env file")
        
        self.client = AsyncOpenAI(api_key=self.api_key)
        self.model = "o3-2025-04-16"
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

        If no explicit elimination conditions are provided above, identify any 'must have', 'required', or mandatory criteria from the job description itself and apply them as elimination conditions.

        CANDIDATES TO ANALYZE:
        {json.dumps(cvs, indent=2)}

        Qualification threshold: {qualification_threshold}%

        For each candidate, if they do not meet any of the mandatory elimination conditions (explicit or extracted) above, mark "qualified": false and include a field "rejection_reason": "Does not satisfy mandatory condition '<condition>'".

        Otherwise, if they satisfy all mandatory conditions, evaluate them against the full job description and calculate an overall_score from 0-100.

        Return a properly formatted JSON object with this exact structure:
        {{
            "analysis": {{
                "total_candidates": {len(cvs)},
                "qualification_threshold": {qualification_threshold},
                "screening_date": "{datetime.now().isoformat()}",
                "job_title": "extracted from job description"
            }},
            "candidates": [
                {{
                    "id": "unique_id",
                    "name": "candidate_name_from_cv", 
                    "overall_score": 75.5,
                    "qualified": true,
                    "strengths": ["specific strength 1", "specific strength 2"],
                    "weaknesses": ["specific weakness 1", "specific weakness 2"],
                    "match_summary": "2-3 sentence summary of candidate fit",
                    "rejection_reason": null
                }}
            ],
            "summary": {{
                "qualified_count": 2,
                "top_candidates": ["candidate1_name", "candidate2_name"],
                "recommendations": "Brief hiring recommendation and next steps"
            }}
        }}

        CRITICAL: 
        - You must return valid JSON only
        - No markdown formatting or code blocks
        - Each candidate MUST have all required fields
        - overall_score must be a number between 0-100
        - qualified must be true/false based on score >= threshold AND meeting all mandatory conditions
        - Be objective and thorough in your analysis
        """
        
        try:
            system_msg = (
                f"You are an expert AI recruiter with deep expertise in candidate evaluation and job matching. "
                f"The explicit mandatory requirements for this role are: {elimination_conditions or 'None'}. "
                "Additionally, extract any 'Must have' or 'Required' criteria from the job description text and treat them as mandatory requirements. "
                "You must first disqualify any candidate who fails to meet any one of these mandatory requirements: "
                "set 'qualified' = false and include a 'rejection_reason' specifying the missing requirement. "
                "Only candidates satisfying all mandatory requirements should be scored and evaluated further. "
                "After elimination, evaluate the remaining candidates against the job description, calculate their overall_score, and apply the qualification threshold exactly: "
                "mark 'qualified' = true only if overall_score >= threshold. "
                "Under no circumstances should you qualify a candidate who does not meet all mandatory requirements. "
                "Do not introduce any additional heuristics or randomness. Provide results in the exact JSON format requested."
            )
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_msg},
                    {"role": "user", "content": screening_prompt}
                ],
                response_format={"type": "json_object"},
                max_completion_tokens=16000,  # Reasonable limit that works
                reasoning_effort=self.reasoning_effort
            )
            
            raw_content = response.choices[0].message.content
            self.logger.info(f"O3 response length: {len(raw_content)} characters")
            
            if not raw_content or len(raw_content.strip()) == 0:
                self.logger.error("O3 returned empty response!")
                return self._create_fallback_response(cvs, "O3 returned empty response")
            
            try:
                # Clean the response - remove any potential markdown formatting
                cleaned_content = raw_content.strip()
                if cleaned_content.startswith('```json'):
                    cleaned_content = cleaned_content[7:]
                if cleaned_content.endswith('```'):
                    cleaned_content = cleaned_content[:-3]
                cleaned_content = cleaned_content.strip()
                
                result = json.loads(cleaned_content)
                
                # Validate the response structure
                if not self._validate_response_structure(result):
                    self.logger.error("Invalid response structure from O3")
                    return self._create_fallback_response(cvs, "Invalid response structure from O3")
                
                self.logger.info(f"✅ O3 batch screening completed successfully for {len(cvs)} candidates")
                return result
                
            except json.JSONDecodeError as e:
                self.logger.error(f"Failed to parse O3 JSON response: {e}")
                self.logger.error(f"Raw response: {raw_content[:500]}...")
                return self._create_fallback_response(cvs, f"JSON parsing failed: {str(e)}")
                
        except Exception as e:
            self.logger.error(f"O3 batch screening error: {str(e)}")
            return self._create_fallback_response(cvs, f"O3 API error: {str(e)}")
    
    def _validate_response_structure(self, result: Dict[str, Any]) -> bool:
        """Validate that the O3 response has the expected structure"""
        try:
            # Check top-level keys
            required_keys = ['analysis', 'candidates', 'summary']
            if not all(key in result for key in required_keys):
                return False
            
            # Check analysis structure
            analysis = result['analysis']
            analysis_keys = ['total_candidates', 'qualification_threshold', 'screening_date']
            if not all(key in analysis for key in analysis_keys):
                return False
            
            # Check candidates structure
            candidates = result['candidates']
            if not isinstance(candidates, list) or len(candidates) == 0:
                return False
            
            # Check first candidate structure
            candidate = candidates[0]
            candidate_keys = ['id', 'name', 'overall_score', 'qualified', 'strengths', 'weaknesses', 'match_summary']
            if not all(key in candidate for key in candidate_keys):
                return False
            
            # Check summary structure
            summary = result['summary']
            summary_keys = ['qualified_count', 'top_candidates', 'recommendations']
            if not all(key in summary for key in summary_keys):
                return False
            
            return True
            
        except Exception as e:
            self.logger.error(f"Response validation error: {e}")
            return False
    
    def _create_fallback_response(self, cvs: List[Dict], error_message: str) -> Dict[str, Any]:
        """Create a fallback response when O3 fails"""
        self.logger.warning(f"Creating fallback response due to: {error_message}")
        
        return {
            "analysis": {
                "total_candidates": len(cvs),
                "qualification_threshold": 85.0,
                "screening_date": datetime.now().isoformat(),
                "job_title": "Position Analysis",
                "error": error_message
            },
            "candidates": [
                {
                    "id": cv.get("id", f"candidate_{i+1}"),
                    "name": cv.get("name", f"Candidate {i+1}"),
                    "overall_score": 50.0,
                    "qualified": False,
                    "strengths": ["Resume submitted successfully"],
                    "weaknesses": [f"Analysis failed: {error_message}"],
                    "match_summary": f"Unable to complete analysis due to system error: {error_message}",
                    "rejection_reason": f"System error: {error_message}"
                }
                for i, cv in enumerate(cvs)
            ],
            "summary": {
                "qualified_count": 0,
                "top_candidates": [],
                "recommendations": f"Unable to complete analysis. Error: {error_message}. Please check system configuration and try again."
            }
        }
    
    async def health_check(self) -> Dict[str, Any]:
        """Check O3 model health"""
        try:
            start_time = datetime.now()
            
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": "Test message: Analyze what makes a great data scientist. Use advanced reasoning."}],
                max_completion_tokens=500,
                reasoning_effort=self.reasoning_effort
            )
            
            response_time = datetime.now() - start_time
            
            return {
                "status": "healthy",
                "model": self.model,
                "reasoning_effort": self.reasoning_effort,
                "response_time_ms": response_time.total_seconds() * 1000,
                "tokens_available": True,
                "message": "O3 model responding normally"
            }
            
        except Exception as e:
            return {
                "status": "error",
                "model": self.model,
                "error": str(e),
                "message": "O3 model not available"
            }

# Create simplified client instance
def get_o3_client_simplified():
    """Create and return O3 client instance"""
    try:
        return O3ClientSimplified()
    except Exception as e:
        logging.error(f"Failed to create O3 client: {e}")
        return None