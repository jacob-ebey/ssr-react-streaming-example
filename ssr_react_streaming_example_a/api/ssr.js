import bootstrap from "../dist/server/runtime/main";

const initPromise = bootstrap().then((r) => r.default);

export default async (req, res) => {
  try {
    const server = await initPromise;
    const html = await server(req.query.location || "");
    res.send(html);
  } catch (err) {
    console.error(err);
    res.send("ERROR :(");
  }
};
