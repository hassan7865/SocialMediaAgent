import httpx
import pytest
import respx

from services.postforme.client import PostForMeClient, PostForMeClientError
from services.postforme.platform_map import local_platform_slug_from_pfm_name


def test_pfm_x_maps_to_twitter_slug():
    assert local_platform_slug_from_pfm_name("x") == "twitter"
    assert local_platform_slug_from_pfm_name("twitter") == "twitter"


@pytest.mark.asyncio
async def test_create_social_account_auth_url():
    with respx.mock:
        respx.post("https://api.postforme.dev/v1/social-accounts/auth-url").mock(
            return_value=httpx.Response(200, json={"url": "https://oauth.example/authorize", "platform": "facebook"})
        )
        client = PostForMeClient("https://api.postforme.dev", "test-api-key")
        out = await client.create_social_account_auth_url(
            platform="facebook",
            external_id="company-uuid",
            permissions=["posts"],
        )
        assert out.url == "https://oauth.example/authorize"
        assert out.platform == "facebook"


@pytest.mark.asyncio
async def test_create_social_post_error_raises():
    with respx.mock:
        respx.post("https://api.postforme.dev/v1/social-posts").mock(return_value=httpx.Response(400, text="bad"))
        client = PostForMeClient("https://api.postforme.dev", "k")
        from services.postforme.schemas import CreateSocialPostBody

        body = CreateSocialPostBody(caption="hi", social_accounts=["sa_1"])
        with pytest.raises(PostForMeClientError) as ei:
            await client.create_social_post(body)
        assert ei.value.status_code == 400
