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

        Please provide a comprehensive JSON analysis with this exact structure:
        {{
            "meta_analysis": {{
                "total_processed": {len(cvs)},
                "qualified_count": 0,
                "reasoning_depth": "high",
                "threshold": {qualification_threshold}
            }},
            "candidates": [
                {{
                    "id": "candidate_id",
                    "name": "candidate_name",
                    "current_role": "current_position", 
                    "overall_score": 85.5,
                    "qualified": true,
                    "scoring_breakdown": {{
                        "technical_skills": 90,
                        "experience_match": 85,
                        "education_fit": 80,
                        "cultural_fit": 85
                    }},
                    "key_strengths": ["strength1", "strength2", "strength3"],
                    "development_areas": ["area1", "area2"],
                    "reasoning_summary": "Detailed analysis of why this candidate is/isn't suitable for the current_role",
                    "interview_recommendations": ["focus_area1", "focus_area2"],
                    "risk_level": "Low",
                    "availability": "Available",
                    "rejection_reason": "Reason for elimination if applicable"
                }}
            ],
            "recommendations": {{
                "top_candidates": ["id1", "id2", "id3"],
                "immediate_actions": "Next steps for hiring process",
                "market_insights": "Brief market analysis"
            }}
        }}

        Use your high reasoning capabilities to provide thorough analysis for each candidate, applying both the qualification threshold and mandatory elimination conditions.
        """
        
        try:
            self.logger.info(f"Starting IRIS screening of {len(cvs)} candidates with threshold {qualification_threshold}%")
            start_time = datetime.now()
            
            # System instructions enriched for consistent threshold and elimination-based evaluation
            # System instructions: enforce mandatory requirement elimination before any scoring
            system_msg = (
                "You are an expert recruitment AI (IRIS) with advanced reasoning capabilities. "
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
                return {
                    "error": "O3 model returned empty response",
                    "total_processed": len(cvs),
                    "qualified_count": 0,
                    "candidates": []
                }
            
            try:
                result = json.loads(raw_content)
                self.logger.info(f"Successfully parsed JSON response")
                
                # Add processing metadata
                result["processing_metadata"] = {
                    "model_used": self.model,
                    "reasoning_effort": self.reasoning_effort,
                    "processed_at": datetime.now().isoformat(),
                    "processing_duration": str(datetime.now() - start_time),
                    "tokens_used": response.usage.total_tokens if response.usage else 0,
                    "reasoning_tokens": getattr(response.usage, 'reasoning_tokens', 0) if response.usage else 0
                }
                
                # Update qualified count
                qualified_candidates = [c for c in result.get("candidates", []) if c.get("qualified", False)]
                result["meta_analysis"]["qualified_count"] = len(qualified_candidates)
                
                self.logger.info(f"Screening completed: {len(qualified_candidates)}/{len(cvs)} qualified")
                return result
                
            except json.JSONDecodeError as json_error:
                self.logger.error(f"Failed to parse JSON: {json_error}")
                self.logger.error(f"Raw response preview: {raw_content[:500]}...")
                return {
                    "error": f"JSON parsing failed: {str(json_error)}",
                    "total_processed": len(cvs),
                    "qualified_count": 0,
                    "candidates": [],
                    "raw_response_preview": raw_content[:1000]
                }
            
        except Exception as e:
            self.logger.error(f"Screening failed: {str(e)}")
            return {
                "error": str(e),
                "total_processed": len(cvs),
                "qualified_count": 0,
                "candidates": []
            }
    
    async def streaming_screening(self, cvs: List[Dict], job_description: str,
                                  qualification_threshold: float = 85.0) -> AsyncGenerator[Dict, None]:
        """
        Stream screening results progressively, applying the qualification threshold via the model
        """
        # Sequential batch processing: 20 CVs per batch
        total_cvs = len(cvs)
        batch_size = 20
        processed = 0

        # Initial notification
        yield {
            "event": "screening_started",
            "data": {
                "total_candidates": total_cvs,
                "reasoning_effort": self.reasoning_effort,
                "qualification_threshold": qualification_threshold,
                "message": "IRIS HIGH reasoning analysis starting..."
            }
        }

        # Process each batch sequentially
        for i in range(0, total_cvs, batch_size):
            batch = cvs[i:i+batch_size]
            # Batch start
            yield {
                "event": "batch_processing",
                "data": {
                    "message": f"Analyzing candidates {i+1}-{min(i+batch_size, total_cvs)}...",
                    "progress": (i / total_cvs) * 100
                }
            }
            # Perform screening
            result = await self.batch_screening(batch, job_description, qualification_threshold)
            candidates_out = result.get('candidates', [])
            processed += len(candidates_out)
            progress = (processed / total_cvs) * 100
            # Batch complete
            yield {
                "event": "batch_complete",
                "data": {
                    "batch_results": candidates_out,
                    "processed": processed,
                    "total": total_cvs,
                    "progress": progress
                }
            }
            await asyncio.sleep(0.2)

        # Final completion
        yield {
            "event": "screening_complete",
            "data": {
                "message": "IRIS HIGH reasoning screening complete!",
                "total_processed": processed,
                "reasoning_effort": self.reasoning_effort,
                "qualification_threshold": qualification_threshold
            }
        }
    
    async def deep_analysis(self, selected_candidates: List[Dict], 
                          job_description: str,
                          job_title: str = '') -> Dict[str, Any]:
        """
        Simplified deep analysis
        """
        
        analysis_prompt = f"""
        IMPORTANT: Only reference the provided {len(selected_candidates)} candidates and the specific role. Do NOT mention any other counts (e.g., total screened or longlisted). Focus strictly on factual analysis based on the job description and selected profiles.

        Create an executive recruitment dashboard for these {len(selected_candidates)} selected candidates.
        
        JOB: {job_title}
        DESCRIPTION: {job_description}
        
        SELECTED CANDIDATES:
        {json.dumps(selected_candidates, indent=2)}
        
        Create a comprehensive executive dashboard analysis covering:
        
        1. EXECUTIVE SUMMARY
        - Overall pool assessment
        - Top recommendations
        - Key insights
        
        2. CANDIDATE DEEP DIVE
        For each candidate provide:
        - Comprehensive strengths analysis
        - Risk assessment
        - Interview strategy
        - Onboarding recommendations
        
        3. STRATEGIC RECOMMENDATIONS
        - Hiring priorities
        - Compensation strategy
        - Timeline recommendations
        
        4. MARKET INTELLIGENCE
        - Competitive positioning
        - Talent market insights
        
        Provide a detailed, executive-level analysis formatted for presentation.
        """
        
        try:
            self.logger.info(f"Starting deep analysis for {len(selected_candidates)} candidates")
            start_time = datetime.now()
            
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are an executive recruitment consultant creating a comprehensive dashboard analysis for senior leadership. Provide detailed, strategic insights."},
                    {"role": "user", "content": analysis_prompt}
                ],
                max_completion_tokens=16000,
                reasoning_effort=self.reasoning_effort
            )
            
            dashboard_content = response.choices[0].message.content
            
            result = {
                "dashboard_content": dashboard_content,
                "analysis_metadata": {
                    "model_used": self.model,
                    "reasoning_effort": self.reasoning_effort,
                    "analyzed_candidates": len(selected_candidates),
                    "processed_at": datetime.now().isoformat(),
                    "processing_duration": str(datetime.now() - start_time),
                    "tokens_used": response.usage.total_tokens if response.usage else 0,
                    "reasoning_tokens": getattr(response.usage, 'reasoning_tokens', 0) if response.usage else 0
                },
                "html_content": f"<div class='executive-dashboard'><pre>{dashboard_content}</pre></div>",
                "export_ready": True
            }
            
            self.logger.info("Deep analysis completed successfully")
            return result
            
        except Exception as e:
            self.logger.error(f"Deep analysis failed: {str(e)}")
            return {
                "error": str(e),
                "dashboard_content": "",
                "html_content": "<div class='error'>Analysis failed. Please try again.</div>"
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
    return O3ClientSimplified()