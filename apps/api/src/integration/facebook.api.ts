interface FacebookPage {
  id: string;
  name: string;
  access_token?: string;
}

/**
 *
 * @param accountId
 * @param accessToken
 * @returns
 * @example
 * // Example usage
 * const accountId = "USER_OR_BUSINESS_ACCOUNT_ID"; // ID của user hoặc business account
 * const accessToken = "YOUR_USER_ACCESS_TOKEN";
 * getFacebookPages(accountId, accessToken).then((pages) => console.log(pages));
 */
export async function getFacebookPages(
  accountId: string,
  accessToken: string,
): Promise<FacebookPage[]> {
  const url = `https://graph.facebook.com/v22.0/${accountId}/accounts?fields=id,name,access_token&access_token=${accessToken}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Error fetching pages: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data as FacebookPage[];
  } catch (error) {
    console.error('Failed to fetch Facebook pages:', error);
    return [];
  }
}

interface AccessTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}
/**
 *
 * @param code
 * @param redirectUri
 * @param clientId
 * @param clientSecret
 * @returns
 * @example
 * // Example usage
 * const code = "CODE_FROM_FACEBOOK";
 * const redirectUri = "REDIRECT_URI";
 * const clientId = "FACEBOOK_APP_ID";
 * const clientSecret = "FACEBOOK_APP_SECRET";
 * getFacebookAccessToken(code, redirectUri, clientId, clientSecret).then((accessToken) => console.log(accessToken));
 */
export async function getFacebookAccessToken(
  code: string,
  redirectUri: string,
  clientId: string,
  clientSecret: string,
): Promise<string | null> {
  const url = `https://graph.facebook.com/v22.0/oauth/access_token?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&client_secret=${clientSecret}&code=${code}`;

  try {
    const response = await fetch(url, { method: 'GET' });

    if (!response.ok) {
      throw new Error(`Error fetching access token: ${response.statusText}`);
    }

    const data: AccessTokenResponse = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('Failed to fetch Facebook access token:', error);
    return null;
  }
}
