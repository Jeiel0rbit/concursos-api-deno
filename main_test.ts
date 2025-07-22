import { assertEquals } from "https://deno.land/std@0.207.0/assert/mod.ts";

// Helper function to wait for the server to be ready
async function waitForServer(url: string) {
  let retries = 10;
  while (retries > 0) {
    try {
      const response = await fetch(url);
      if (response.status === 200) {
        await response.body?.cancel();
        return;
      }
    } catch {
      // Ignore connection errors and retry
    }
    await new Promise(resolve => setTimeout(resolve, 500));
    retries--;
  }
  throw new Error("Server did not start in time.");
}


Deno.test("API tests", { sanitizeResources: false, sanitizeOps: false }, async (t) => {
  // Start the server in the background for testing.
  const serverProcess = new Deno.Command(Deno.execPath(), {
    args: ["run", "--allow-net", "--allow-read", "main.ts"],
    stdout: "piped",
    stderr: "piped",
  }).spawn();

  // Wait for the server to be ready before running tests
  await waitForServer("http://localhost:8000/");


  await t.step("should return 200 for the main route", async () => {
    const response = await fetch("http://localhost:8000/");
    assertEquals(response.status, 200);
    await response.body?.cancel();
  });

  await t.step("should return 200 for a valid UF", async () => {
    const response = await fetch("http://localhost:8000/pa");
    assertEquals(response.status, 200);
    await response.body?.cancel();
  });

  await t.step("should return 404 for an invalid UF", async () => {
    const response = await fetch("http://localhost:8000/xx");
    assertEquals(response.status, 404);
    await response.body?.cancel();
  });

  // Kill the server process after all tests are done
  serverProcess.kill();
  // The following lines are important to prevent leaks
  await serverProcess.status;
  await serverProcess.stdout.cancel();
  await serverProcess.stderr.cancel();
});
