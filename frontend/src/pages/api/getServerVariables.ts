import { NextApiRequest, NextApiResponse } from "next";

const HTTP_STATUS_CODES = {
  OK: 200,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  INTERNAL_SERVER_ERROR: 500,
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  switch (method) {
    case "POST":
      //const data = req.body;
      const protocol = req.headers["x-forwarded-proto"] || "http";
      const host = req.headers["host"]?.split(":")[0];
      const hostUrl = `${protocol}://${host}`;

      const retData = {
        HOST_URL: hostUrl,
        PORT_BACKEND: process.env.PORT_BACKEND,
        PORT_FRONTEND: process.env.PORT_FRONTEND,
        IMPORT_TOOL_ENCRYPTION_KEY: process.env.IMPORT_TOOL_ENCRYPTION_KEY,
        IMPORT_TOOL_FROM_DOCKER: process.env.IMPORT_TOOL_FROM_DOCKER,
      };
      res.status(HTTP_STATUS_CODES.OK).json(retData);
      break;

    default:
      res.setHeader("Allow", ["POST"]);
      res
        .status(HTTP_STATUS_CODES.METHOD_NOT_ALLOWED)
        .end(`Method ${method} Not Allowed`);
  }
}
