import "server-only";
import { Svix } from "svix";
import { keys } from "../keys";

const svixToken = keys().SVIX_TOKEN;

// Better Auth uses API routes; org context must be passed explicitly.
export const send = (eventType: string, payload: object, orgId?: string) => {
  if (!svixToken) {
    throw new Error("SVIX_TOKEN is not set");
  }

  if (!orgId) {
    return;
  }

  const svix = new Svix(svixToken);

  return svix.message.create(orgId, {
    eventType,
    payload: {
      eventType,
      ...payload,
    },
    application: {
      name: orgId,
      uid: orgId,
    },
  });
};

export const getAppPortal = (orgId?: string) => {
  if (!svixToken) {
    throw new Error("SVIX_TOKEN is not set");
  }

  if (!orgId) {
    return;
  }

  const svix = new Svix(svixToken);

  return svix.authentication.appPortalAccess(orgId, {
    application: {
      name: orgId,
      uid: orgId,
    },
  });
};
