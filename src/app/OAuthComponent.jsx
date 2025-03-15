// OAuthComponent.jsx
'use client'
import { useEffect } from "react";
import { configureOAuth, resolveFromIdentity, createAuthorizationUrl, OAuthUserAgent, finalizeAuthorization, getSession } from '@atcute/oauth-browser-client';
import { XRPC } from '@atcute/client';

const APP_URL = process.env.NEXT_PUBLIC_URL;

// Export login function without immediately assigning to window
export async function login() {
  const username = document.getElementById("username")?.value;
  if (!username) return;
  
  const { identity, metadata } = await resolveFromIdentity(username);
  const authUrl = await createAuthorizationUrl({
    metadata: metadata,
    identity: identity,
    scope: 'atproto transition:generic transition:chat.bsky',
  });
  window.location.assign(authUrl);
  await sleep(200);
}

export default function OAuthComponent() {
  useEffect(() => {
    // Configure OAuth and set window.login only on client-side
    configureOAuth({
      metadata: {
        client_id: `${APP_URL}/client-metadata.json`,
        redirect_uri: `${APP_URL}`,
      }
    });

    // Assign login to window only when running in browser
    window.login = login;

    // Handle OAuth flow
    handleOauth().then(async () => {
      await restoreSession();
      if (window.xrpc) {
        const follows = await getFollowing(window.xrpc);
        display(follows);
      }
    });
  }, []);

  return null;
}

async function finalize() {
  const params = new URLSearchParams(location.hash.slice(1));
  history.replaceState(null, '', location.pathname + location.search);
  const session = await finalizeAuthorization(params);
  const agent = new OAuthUserAgent(session);
  return agent;
}

async function getFollowing(xrpc) {
  const following = await xrpc.request({
    type: 'get',
    nsid: 'app.bsky.graph.getFollows',
    params: {
      actor: window.agent?.session.info.sub,
      limit: 5
    }
  });
  return following.data.follows;
}

function display(follows) {
  const list = document.createElement('ul');
  for (const follow of follows) {
    const item = document.createElement('li');
    item.textContent = follow.handle;
    list.appendChild(item);
  }
  const followingDiv = document.getElementById("following");
  if (followingDiv) {
    followingDiv.textContent = "5 people you're following:";
    followingDiv.appendChild(list);
  }
}

async function handleOauth() {
  if (!location.href.includes('state')) {
    return;
  }
  const agent = await finalize();
  window.xrpc = new XRPC({handler: agent});
  window.agent = agent;
}

async function restoreSession() {
  const sessions = localStorage.getItem('atcute-oauth:sessions');
  if (!sessions) {
    return;
  }
  const did = Object.keys(JSON.parse(sessions))[0];
  const session = await getSession(did, { allowStale: true });
  const agent = new OAuthUserAgent(session);
  window.xrpc = new XRPC({handler: agent});
  window.agent = agent;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}