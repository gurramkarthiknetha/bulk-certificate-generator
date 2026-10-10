"""Certificate template system."""

from app.templates.registry import TemplateRegistry, get_template_registry
from app.templates.base import BaseTemplate

__all__ = ["TemplateRegistry", "get_template_registry", "BaseTemplate"]
