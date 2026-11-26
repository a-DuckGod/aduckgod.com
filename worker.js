export default {
  async fetch(request, env) {
    const res = await env.ASSETS.fetch(new URL("/404.html", request.url));
    return new Response(res.body, {
      status: 404,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  },
};
