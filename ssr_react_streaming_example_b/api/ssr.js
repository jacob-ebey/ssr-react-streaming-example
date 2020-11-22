import bootstrap from "../dist/server/runtime/main";

const initPromise = bootstrap().then((r) => r.default);

export default async (req, res) => {
  const server = await initPromise;
  const html = await server("/b");
  res.send(html);
};
