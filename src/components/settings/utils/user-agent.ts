export function parseUserAgent(userAgent: string) {
  const isMobile = /mobile|android|iphone|ipad/i.test(userAgent);
  let os = "Unknown OS";
  if (/Windows/i.test(userAgent)) os = "Windows";
  else if (/Macintosh/i.test(userAgent)) os = "macOS";
  else if (/iPhone|iPad|iPod/i.test(userAgent)) os = "iOS";
  else if (/Android/i.test(userAgent)) os = "Android";
  else if (/Linux/i.test(userAgent)) os = "Linux";
  let browser = "Unknown Browser";
  if (/Edg/i.test(userAgent)) browser = "Edge";
  else if (/Chrome/i.test(userAgent)) browser = "Chrome";
  else if (/Firefox/i.test(userAgent)) browser = "Firefox";
  else if (/Safari/i.test(userAgent)) browser = "Safari";
  return { os, browser, isMobile };
}
