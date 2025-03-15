'use client'
import { useEffect } from "react";
import { configureOAuth, resolveFromIdentity, createAuthorizationUrl, OAuthUserAgent, finalizeAuthorization, getSession } from '@atcute/oauth-browser-client';
import { XRPC } from '@atcute/client';

const APP_URL = "https://atproto-oauth-rjpayl9ng-loco-hacos-projects.vercel.app";

export default function OAuthComponent() {
  useEffect(() => {
    configureOAuth({
      metadata: {
        client_id: `${APP_URL}/client-metadata.json`,
        redirect_uri: `${APP_URL}`,
      }
    });

    // Handle OAuth and session restoration when component mounts
    handleOauth().then(async () => {
      await restoreSession();
      if (window.xrpc) {
        const follows = await getFollowing(window.xrpc);
        display(follows);
      }
    });

  }, []); // Empty dependency array means this runs once on mount

  return null; // This component doesn't need to render anything
}

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

// Utility function (you might need to define this if not already imported)
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Make login available globally
window.login = login;