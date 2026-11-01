"""
backend/routers/__init__.py
===========================
Modular FastAPI routers package for DuoMath.
"""
from .social_tournaments import build_social_tournaments_router
from .teacher_classes import build_teacher_classes_router

__all__ = ["build_social_tournaments_router", "build_teacher_classes_router"]
