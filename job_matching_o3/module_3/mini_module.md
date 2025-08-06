# Module 3.1: Interview Feedback Ingestion & Next-Stage Automation

## Overview
After Module 3 (Candidate Outreach & Scheduling) is in place, Module 3.1 handles the intake of interview feedback and automates progression to the next evaluation stages. It plugs into the existing project without altering the core matching or outreach logic.

### Goals
- Ingest structured feedback from HR consultants or interviewers
- Update candidate status automatically in the ATS/CRM
- Recalculate candidate suitability scores or flag for re-evaluation
- Trigger downstream actions (second-round interviews, offer process)

## Components
1. **Feedback API Endpoint**
   - `POST /api/interviews/feedback`
   - Payload: `{ "candidate_id": "uuid", "interview_id": "uuid", "feedback": {"strengths": [], "areas_for_improvement": [], "overall_rating": number}, "metadata": {...} }`

2. **Feedback Processor Service**
   - Module path: `module_3/feedback_processor.py`
   - Responsibilities:
     - Validate incoming feedback JSON
     - Persist feedback to `interview_feedback` table/collection
     - Update `candidate_status` to `feedback_received`
     - Invoke re-scoring via `evaluation_engine` if configured

3. **Event Integration**
   - Emit an event (`interview.feedback.received`) to the event store/message broker
   - Subscribe downstream consumers (e.g. Offer Generator) to this event

4. **Next-Stage Trigger**
   - Based on feedback rating thresholds, auto-assign candidates to:
     - Second-round interviews
     - Hiring manager review
     - Rejection/archival

## Implementation Steps
1. **Create Module 3.1 Folder**: `module_3/` (already present) and add `feedback_processor.py`
2. **Define Database Model**:
   ```python
   class InterviewFeedback(Base):
       id = Column(UUID, primary_key=True)
       candidate_id = Column(UUID, ForeignKey('candidates.id'))
       interview_id = Column(UUID)
       strengths = Column(ARRAY(String))
       areas_for_improvement = Column(ARRAY(String))
       overall_rating = Column(Float)
       received_at = Column(DateTime, default=datetime.utcnow)
   ```
3. **Expose FastAPI Route** in `main.py`:
   ```python
   @app.post('/api/interviews/feedback')
   async def receive_feedback(feedback: FeedbackSchema):
       result = await feedback_processor.handle(feedback.dict())
       return JSONResponse(result)
   ```
4. **Implement `feedback_processor.handle()`**:
   - Validate payload, write to DB, publish event, update candidate record

5. **Configure Event Broker** (Kafka/SQS): subscribe producers and consumers

6. **Update Evaluation Engine**:
   - Add a method `re_score_candidate(candidate_id: str)` to recompute overall_score

## Integration Notes
- **Non-invasive**: All new endpoints and models live under `module_3` namespace
- **Configuration**: Add feedback-specific settings to `.env`
  ```env
  FEEDBACK_QUEUE_URL=...
  FEEDBACK_MIN_RATING=...
  ```
- **Testing**: Write pytest fixtures and integration tests under `module_3/tests`

*Once Module 3 is fully operational, drop this directory into your codebase, register the new routes in `main.py`, and wire up the event publisher/consumer.*