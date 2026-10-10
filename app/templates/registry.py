"""Template registry for managing certificate templates."""

from functools import lru_cache

from app.templates.base import BaseTemplate
from app.templates.classic_gold import ClassicGoldTemplate
from app.templates.modern_minimal import ModernMinimalTemplate
from app.templates.academic import AcademicTemplate


class TemplateRegistry:
    """Registry of available certificate templates."""

    def __init__(self):
        self._templates: dict[str, BaseTemplate] = {}
        self._register_defaults()

    def _register_defaults(self):
        """Register built-in templates."""
        for template_cls in [
            ClassicGoldTemplate,
            ModernMinimalTemplate,
            AcademicTemplate,
        ]:
            template = template_cls()
            self._templates[template.template_id] = template

    def register(self, template: BaseTemplate) -> None:
        """Register a new template."""
        self._templates[template.template_id] = template

    def get(self, template_id: str) -> BaseTemplate | None:
        """Get a template by ID."""
        return self._templates.get(template_id)

    def list_all(self) -> list[BaseTemplate]:
        """List all registered templates."""
        return list(self._templates.values())

    def exists(self, template_id: str) -> bool:
        """Check if a template exists."""
        return template_id in self._templates


@lru_cache
def get_template_registry() -> TemplateRegistry:
    return TemplateRegistry()
