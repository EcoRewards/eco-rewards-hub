import { Organisation } from "./Organisation";
import { SchemeId } from "../scheme/Scheme";
import { Cryptography } from "../cryptography/Cryptography";

/**
 * Creates organisations
 */
export class OrganisationFactory {

  constructor(
    private readonly crypto: Cryptography
  ) {}

  /**
   * Create an organisation. The apiKey will be hashed for storage.
   */
  public async create(name: string, schemeId: SchemeId, apiKey: string): Promise<Organisation> {
    return {
      id: null,
      name: name,
      scheme_id: schemeId,
      api_key: await this.crypto.hash(apiKey)
    };
  }

}
