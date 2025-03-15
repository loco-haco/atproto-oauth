
import {

  OAuthClientMetadataInput,
} from '@atproto/oauth-client-browser'


export function createBlueskyClient(): Promise<OAuthClientMetadataInput> {return Promise.resolve(blueskyClientMetadata())}

export function blueskyClientMetadata(): OAuthClientMetadataInput {
  const baseUrl: string = process.env.NEXT_PUBLIC_URL as string

  return {
            client_id: `${baseUrl}/client-metadata.json`,
            redirect_uris: [`${baseUrl}`]
          }
        };

    /*    
    client_name: 'atproto oAuth template',
    client_id: `${baseUrl}/client-metadata.json`,
    client_uri: `${baseUrl}`,
    redirect_uris: [`${baseUrl}`],
    policy_uri: `${baseUrl}`,
    tos_uri: `${baseUrl}`,
    scope: 'atproto transition:generic',
    grant_types: ['authorization_code', 'refresh_token'],
    response_types: ['code'],
    application_type: 'web',
    token_endpoint_auth_method: 'none',
    dpop_bound_access_tokens: true,
    */


