import { createCapsuleFromGitHubCapture } from "@/lib/github";
import { fail, handleRouteError, ok } from "@/lib/api-response";

export async function POST(request: Request) {
  try {
    const result = await createCapsuleFromGitHubCapture(await request.json());
    return ok(
      {
        capsule: result.capsule,
        githubCapture: result.githubCapture
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof SyntaxError) return fail("Invalid JSON body.", 400);
    if (error instanceof Error && error.message.includes("GITHUB_TOKEN")) {
      return fail(error.message, 400);
    }
    return handleRouteError(error);
  }
}
