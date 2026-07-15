/**
 * Security Controls Feature Test
 * Tests: Save Security Controls, Block IP, Audit Logs, OWASP Audit
 * Run: node scratch/test_security_features.js
 */

const BASE_URL = "http://localhost:3000";

const PASS = "✅ PASS";
const FAIL = "❌ FAIL";
const INFO = "ℹ️  INFO";

let cookie = "";

// ─── helpers ─────────────────────────────────────────────────────────────────
async function apiGet(path) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { Cookie: cookie, "x-site-id": "AHP" },
  });
  const json = await res.json();
  return { status: res.status, json };
}

async function apiPost(path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookie,
      "x-site-id": "AHP",
    },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, json };
}

async function apiPut(path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookie,
      "x-site-id": "AHP",
    },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, json };
}

async function apiDelete(path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookie,
      "x-site-id": "AHP",
    },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, json };
}

// ─── login ────────────────────────────────────────────────────────────────────
async function login() {
  console.log(`\n${INFO} Logging in as admin@example.com...`);
  const csrfRes = await fetch(`${BASE_URL}/api/auth/csrf`);
  const csrfData = await csrfRes.json();
  const csrfToken = csrfData.csrfToken;

  const setCookie = csrfRes.headers.get("set-cookie") || "";
  cookie = setCookie.split(";")[0] || "";

  const loginRes = await fetch(`${BASE_URL}/api/auth/callback/credentials`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Cookie: cookie,
    },
    redirect: "manual",
    body: new URLSearchParams({
      email: "admin@example.com",
      password: "Admin@123",
      csrfToken,
      callbackUrl: "/dashboard/dashboard",
      json: "true",
    }).toString(),
  });

  const newCookies = loginRes.headers.get("set-cookie");
  if (newCookies) {
    cookie = newCookies.split(",").map(c => c.split(";")[0]).join("; ");
  }

  // Verify we're authenticated
  const check = await apiGet("/api/dashboard/notifications");
  if (check.status === 200) {
    console.log(`${PASS} Login successful`);
    return true;
  } else {
    console.log(`${FAIL} Login failed (status ${check.status}) — may need manual session`);
    return false;
  }
}

// ─── tests ────────────────────────────────────────────────────────────────────
async function testSecurityControls() {
  console.log("\n" + "─".repeat(50));
  console.log("TEST 1: Save Security Controls");
  console.log("─".repeat(50));

  // First get current config
  const { status: getStatus, json: getJson } = await apiGet("/api/dashboard/security/config");
  if (getStatus !== 200) {
    console.log(`${FAIL} Could not fetch current config (${getStatus})`);
    console.log("       Response:", JSON.stringify(getJson).substring(0, 100));
    return;
  }
  const current = getJson.data?.settings?.securityControls || {};
  console.log(`${INFO} Current rate limit: ${current.apiRateLimitRps || "not set"}`);
  console.log(`${INFO} Current session timeout: ${current.sessionTimeoutMinutes || "not set"}`);

  // Save with updated rate limit
  const newRateLimit = 65;
  const { status: saveStatus, json: saveJson } = await apiPut("/api/dashboard/security/config", {
    securityControls: {
      ...current,
      apiRateLimitRps: newRateLimit,
      sessionTimeoutMinutes: 30,
    },
  });

  if (saveStatus === 200) {
    console.log(`${PASS} Security controls saved (rate limit → ${newRateLimit})`);
  } else {
    console.log(`${FAIL} Save failed (${saveStatus}): ${JSON.stringify(saveJson).substring(0, 150)}`);
  }
}

async function testBlockIP() {
  console.log("\n" + "─".repeat(50));
  console.log("TEST 2: Block Network IP");
  console.log("─".repeat(50));

  const testIp = "10.0.0.99";

  // Block the IP
  const { status: blockStatus, json: blockJson } = await apiPost("/api/dashboard/security/ip-block", {
    ip: testIp,
  });

  if (blockStatus === 200 || blockStatus === 201) {
    console.log(`${PASS} IP ${testIp} blocked successfully`);
    const blocklist = blockJson.data?.ipBlocklist || [];
    console.log(`${PASS} Blocklist now has ${blocklist.length} entries: ${JSON.stringify(blocklist.map(b => b.ip))}`);
  } else {
    console.log(`${FAIL} Block failed (${blockStatus}): ${JSON.stringify(blockJson).substring(0, 150)}`);
    return;
  }

  // Unblock to clean up (DELETE uses query param)
  const unblockRes = await fetch(`${BASE_URL}/api/dashboard/security/ip-block?ip=${testIp}`, {
    method: "DELETE",
    headers: { Cookie: cookie, "x-site-id": "AHP" },
  });
  const unblockJson = await unblockRes.json().catch(() => ({}));
  console.log(`${unblockRes.status === 200 ? PASS : FAIL} IP ${testIp} unblocked (cleanup)`);
}

async function testAuditLogs() {
  console.log("\n" + "─".repeat(50));
  console.log("TEST 3: System Audit Logs");
  console.log("─".repeat(50));

  const { status, json } = await apiGet("/api/dashboard/security/audit-logs");
  if (status !== 200) {
    console.log(`${FAIL} Could not fetch audit logs (${status}): ${JSON.stringify(json).substring(0, 100)}`);
    return;
  }

  const logs = json.data?.auditLogs || [];
  console.log(`${PASS} Audit logs API responded with ${logs.length} entries`);
  logs.slice(0, 5).forEach((log) => {
    const who = log.user?.email || "system/null";
    console.log(`       • [${log.action}] by ${who}`);
  });
}

async function testOwaspAudit() {
  console.log("\n" + "─".repeat(50));
  console.log("TEST 4: OWASP Security Audit");
  console.log("─".repeat(50));

  const { status, json } = await apiPost("/api/dashboard/security/audit", {});
  if (status !== 200) {
    console.log(`${FAIL} OWASP audit failed (${status}): ${JSON.stringify(json).substring(0, 100)}`);
    return;
  }

  const data = json.data || json;
  console.log(`${PASS} OWASP Audit Score: ${data.securityScore}% (${data.passedChecks}/${data.totalChecks} checks passed)`);
  (data.checks || []).forEach((c) => {
    const icon = c.status === "PASSED" ? "✅" : c.status === "WARNING" ? "⚠️ " : "❌";
    console.log(`       ${icon} [${c.severity}] ${c.name}: ${c.status}`);
  });
}

async function testLoginHistory() {
  console.log("\n" + "─".repeat(50));
  console.log("TEST 5: Login History");
  console.log("─".repeat(50));

  const { status, json } = await apiGet("/api/dashboard/security/login-history");
  if (status !== 200) {
    console.log(`${FAIL} Could not fetch login history (${status})`);
    return;
  }

  const history = json.data?.history || json.history || [];
  console.log(`${PASS} Login history API returned ${history.length} entries`);
  history.slice(0, 3).forEach((h) => {
    const result = h.success ? "SUCCESS" : "FAILED";
    console.log(`       • ${result} from ${h.ipAddress} at ${h.createdAt}`);
  });
}

// ─── main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log("=".repeat(50));
  console.log("  SECURITY FEATURES API TEST");
  console.log("=".repeat(50));

  const loggedIn = await login();
  if (!loggedIn) {
    console.log("\n⚠️  Could not authenticate. Tests may show 401 errors.");
    console.log("   Make sure the dev server is running: npm run dev\n");
  }

  await testSecurityControls();
  await testBlockIP();
  await testAuditLogs();
  await testOwaspAudit();
  await testLoginHistory();

  console.log("\n" + "=".repeat(50));
  console.log("  TEST COMPLETE");
  console.log("=".repeat(50) + "\n");
}

main().catch(console.error);
