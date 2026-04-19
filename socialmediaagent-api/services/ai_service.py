import asyncio
from concurrent.futures import ThreadPoolExecutor
from typing import Any, AsyncIterator, Optional

from langchain_core.messages import HumanMessage, SystemMessage
from langchain_groq import ChatGroq

from core.config import get_settings

_executor = ThreadPoolExecutor(max_workers=4)

MARKDOWN_OUTPUT = """
Output format: Use GitHub-flavored Markdown only (no raw HTML tags). Structure the post clearly:
- Use ## for a short headline when it helps; use ### sparingly for subheads
- Use **bold** for emphasis on important phrases
- Use bullet lists with "-" for multiple distinct points
- Separate short paragraphs with a blank line
Do not wrap the post in ``` fences. Do not add preambles or notes about the draft — output the post only."""


def _append_markdown_rules(system_prompt: str) -> str:
    base = (system_prompt or "").strip()
    return f"{base}\n{MARKDOWN_OUTPUT}" if base else MARKDOWN_OUTPUT.strip()


def _chunk_text(chunk: Any) -> str:
    raw = chunk.content
    if raw is None:
        return ""
    if isinstance(raw, str):
        return raw
    if isinstance(raw, list):
        parts: list[str] = []
        for item in raw:
            if isinstance(item, dict) and item.get("type") == "text":
                parts.append(str(item.get("text", "")))
            elif isinstance(item, str):
                parts.append(item)
        return "".join(parts)
    return str(raw)


TONE_GUIDES = {
    "professional": "Use formal, polished language. Be authoritative and knowledgeable. Avoid slang and casual expressions.",
    "casual": "Use relaxed, informal language. Be friendly and approachable. Feel free to use slang naturally.",
    "friendly": "Use warm, approachable language. Be supportive and personable. Show enthusiasm and care.",
    "authoritative": "Use confident, decisive language. Be knowledgeable and commanding. Lead with expertise.",
    "humorous": "Use witty, playful language. Be fun and entertaining. Include appropriate humor and lightheartedness.",
    "inspirational": "Use uplifting, motivational language. Be empowering and hopeful. Focus on aspirational messages.",
}


class AIService:
    def __init__(self):
        self._llm: Optional[ChatGroq] = None

    @property
    def llm(self) -> ChatGroq:
        if self._llm is None:
            settings = get_settings()
            if not settings.GROQ_API_KEY:
                raise ValueError(
                    "GROQ_API_KEY is not set in environment. Please add it to your .env file."
                )
            self._llm = ChatGroq(
                model="groq/compound",
                groq_api_key=settings.GROQ_API_KEY,
                temperature=0.7,
            )
        return self._llm

    async def generate_post(
        self,
        user_prompt: str,
        system_prompt: str,
    ) -> str:
        full_system = _append_markdown_rules(system_prompt)

        def _invoke():
            messages = [
                SystemMessage(content=full_system),
                HumanMessage(content=user_prompt),
            ]
            result = self.llm.invoke(messages)
            return result.content

        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(_executor, _invoke)

    async def stream_generate_post(
        self,
        user_prompt: str,
        system_prompt: str,
    ) -> AsyncIterator[str]:
        full_system = _append_markdown_rules(system_prompt)
        messages = [
            SystemMessage(content=full_system),
            HumanMessage(content=user_prompt),
        ]
        async for chunk in self.llm.astream(messages):
            text = _chunk_text(chunk)
            if text:
                yield text

    async def generate_with_brand_voice(
        self,
        user_prompt: str,
        company_name: str,
        tone: str,
    ) -> str:
        tone_guide = TONE_GUIDES.get(tone, TONE_GUIDES["professional"])

        system_prompt = f"""You are an expert social media AI assistant for {company_name}.

Your role is to create engaging, on-brand social media content that resonates with the target audience.

TONE: {tone.upper()}
{tone_guide}

Guidelines:
- Always maintain the brand's voice and tone in all content
- Create content that sounds natural, not robotic
- Include relevant hashtags when appropriate
- Keep content concise and impactful
- Focus on value for the reader
- Ensure content is platform-appropriate (LinkedIn, Twitter, Instagram, Facebook)
- Adapt the content length and format to suit the target platform
"""

        return await self.generate_post(user_prompt, system_prompt)

    async def stream_with_brand_voice(
        self,
        user_prompt: str,
        company_name: str,
        tone: str,
    ) -> AsyncIterator[str]:
        tone_guide = TONE_GUIDES.get(tone, TONE_GUIDES["professional"])
        system_prompt = f"""You are an expert social media AI assistant for {company_name}.

Your role is to create engaging, on-brand social media content that resonates with the target audience.

TONE: {tone.upper()}
{tone_guide}

Guidelines:
- Always maintain the brand's voice and tone in all content
- Create content that sounds natural, not robotic
- Include relevant hashtags when appropriate
- Keep content concise and impactful
- Focus on value for the reader
- Ensure content is platform-appropriate (LinkedIn, Twitter, Instagram, Facebook)
- Adapt the content length and format to suit the target platform
"""
        async for part in self.stream_generate_post(user_prompt, system_prompt):
            yield part

    async def stream_default_writer(self, user_prompt: str) -> AsyncIterator[str]:
        async for part in self.stream_generate_post(
            user_prompt,
            "You are an expert social media content writer. Create engaging, well-structured posts.",
        ):
            yield part


ai_service = AIService()
