import autobind from "autobind-decorator";
import { HttpError, HttpResponse } from "../../service/controller/HttpResponse";
import { GenericRepository } from "../../database/GenericRepository";
import { Cryptography } from "../../cryptography/Cryptography";
import { AdminUser } from "../AdminUser";
import { keyValue } from "ts-array-utils";
import { Base64 } from "js-base64";
import toBase64 = Base64.toBase64;
import { AdminUserRepository } from "../AdminUserRepository";

/**
 * Controller that checks a users login. This is a convenience method for the front end, it just checks the credentials
 * are valid and then returns them as a valid HTTP Authorization header.
 */
@autobind
export class LoginController {

  constructor(
    private readonly repository: AdminUserRepository,
    private readonly crypto: Cryptography
  ) {}

  /**
   * Load the current users and check the credentials in the request match a user.
   *
   * A token and a 201 are returned if the credentials are valid
   * A 401 error is return if the credentials are not valid
   */
  public async post(request: LoginRequest): Promise<LoginResponse> {
    const links = {};
    const userIndex = await this.repository.getUserIndex();

    if (userIndex[request.username]) {
      const isValid = await this.crypto.compare(request.password, userIndex[request.username].password);

      if (isValid) {
        const data = {
          token: toBase64(request.username + ":" + request.password)
        };

        return { data, links, code: 201 };
      }
    }

    return {
      data: {
        error: "Unauthorized"
      },
      links: links,
      code: 401
    };
  }
}

interface LoginRequest {
  username: string,
  password: string
}

interface LoginToken {
  token: string
}

export type LoginResponse = HttpResponse<LoginToken | HttpError>;
