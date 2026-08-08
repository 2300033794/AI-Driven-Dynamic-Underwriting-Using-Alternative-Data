"""
Advisor Route — Handles AI Chatbot Advisor queries
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, Dict, Any
from models.chatbot_advisor import process_advisor_chat

router = APIRouter(prefix="/api/advisor", tags=["advisor"])


class ChatRequest(BaseModel):
    message: str
    applicant_data: Optional[Dict[str, Any]] = None


@router.post("/chat")
def advisor_chat(req: ChatRequest):
    """
    Handles applicant questions and returns context-aware AI loan advice.
    """
    result = process_advisor_chat(req.message, req.applicant_data)
    return result
