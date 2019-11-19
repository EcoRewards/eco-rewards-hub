import { compare, hash } from "bcrypt";

/**
 * Wrapper around the bcrypt library
 */
export class Cryptography {

  /**
   * Create a hash from the given secret
   */
  public async hash(secret: string): Promise<string> {
    return hash(secret, 10);
  }

  public async compare(plainText: string, hashed: string): Promise<boolean> {
    return compare(plainText, hashed);
  }

}
