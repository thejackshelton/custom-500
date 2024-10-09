import { component$ } from "@builder.io/qwik";
import type { RequestEvent, RequestHandler } from "@builder.io/qwik-city";

export const onRequest: RequestHandler = async ({ redirect }: RequestEvent) => {
  try {
    // Simulate a server error
    throw new Error("Simulated 500 Internal Server Error");
  } catch (e) {
    // Log the error (you might want to use a proper logging system in a real app)
    console.error(e);

    // Redirect to a custom error page
    throw redirect(302, "/500");
  }
};

export const onError = ({ redirect }: RequestEvent) => {
  // Redirect to a custom error page
  throw redirect(302, "/500");
};

export default component$(() => {
  return (
    <>
      <h1>Hi 👋</h1>
      <div>
        Can't wait to see what you build with qwik!
        <br />
        Happy coding.
      </div>
    </>
  );
});

// ... existing code for head ...
