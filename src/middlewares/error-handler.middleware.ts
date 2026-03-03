import { ErrorRequestHandler, NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { ErrorResponse } from "../core/error.response";

export const errorHandler: ErrorRequestHandler = async (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const isDev = process.env.NODE_ENV === "development";

  // Thông tin cơ bản
  let statusCode: number = err.statusCode || 500;
  let message: string = err.message;
  const stack = err.stack;

  // Thông tin bổ sung nếu là lỗi Zod
  if (err instanceof ZodError) {
    statusCode = 422;

    //
    const formattedErrors = (err as any).errors.map((e: any) => ({
      field: e.path.join("."),
      message: e.message,
    }));

    //
    message = formattedErrors.map((e: any) => e.message).join(" - ");

    //
    if (!isDev) {
      // await DiscordLog.sendLogError('🛑 Zod Validation Error:', {
      //   clientIp: req.ip,
      //   clientId: req.headers['x-client-id'] as string,
      //   request: {
      //     method: req.method,
      //     url: req.originalUrl,
      //     body: req.body,
      //     params: req.params,
      //     query: req.query
      //   },
      //   message: message,
      //   statusCode: statusCode
      // })
    }
  }

  // Log đầy đủ để dev dễ debug
  const resError = {
    message: message,
    statusCode: statusCode,
    stack: stack,
    otherFields: Object.keys(err)
      .filter(
        (k) =>
          ![
            "name",
            "message",
            "statusCode",
            "stack",
            "errors",
            "issues",
            "details",
          ].includes(k),
      )
      .reduce(
        (acc, key) => {
          acc[key] = err[key];
          return acc;
        },
        {} as Record<string, any>,
      ),
  };
  console.log("resError :::", resError);
  if (resError.statusCode !== 401 && !isDev) {
    // await DiscordLog.sendLogError(message, {
    //   clientIp: req.ip,
    //   clientId: req.headers['x-client-id'] as string,
    //   request: {
    //     method: req.method,
    //     url: req.originalUrl
    //   },
    //   message: resError.message,
    //   statusCode: resError.statusCode,
    //   stack: resError.stack,
    //   ...resError.otherFields
    // })
  }

  // Trả response ra client
  res
    .status(statusCode)
    .json(new ErrorResponse(statusCode, message, isDev ? stack : {}));

  return; // đảm bảo không rơi vào nhánh nào khác
};
