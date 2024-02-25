import { JourneyFactory } from "../JourneyFactory";
import { indexBy } from "ts-array-utils";
import { Member, toMemberId } from "../../member/Member";
import { GenericRepository } from "../../database/GenericRepository";
import { Context } from "koa";
import { Journey, JourneyType } from "../Journey";
import { MultiPartFormReader } from "./MultiPartFormReader";
import autobind from "autobind-decorator";
import { MemberModelFactory } from "../../member/MemberModelFactory";
import { ExternalMemberRepository } from "../../member/repository/ExternalMemberRepository";
import sharp = require("sharp");
import ReadableStream = NodeJS.ReadableStream;

@autobind
export class JourneyController {
  private static SELF_REPORT_USER = 1;

  constructor(
    private readonly memberRepository: GenericRepository<Member>,
    private readonly journeyRepository: GenericRepository<Journey>,
    private readonly formReader: MultiPartFormReader,
    private readonly storage: RemoteFileStorage,
    private readonly memberFactory: MemberModelFactory,
    private readonly externalMemberRepository: ExternalMemberRepository
  ) { }

  /**
   * Multi-part form handler for POST /journey requests. Allows users to create a journey and upload an image to S3
   */
  public async post(input: any, ctx: Context): Promise<PostJourneyResponse> {
    const form: PostJourneyRequest =  ctx.headers["content-type"] === "application/json"
      ? input as PostJourneyRequest
      : await this.formReader.getForm(ctx.req) as PostJourneyRequest;

    const errors = this.validateForm(form);

    if (errors.length > 0) {
      return { code: 400, data: { errors } };
    }

    const factory = await this.getJourneyFactory(form.memberId!);
    const isQrScan = typeof form.deviceId === "string" && form.deviceId.length > 5;
    const journey = await factory.create(
      [form.memberId + "", form.date!, form.mode, form.distance, form.latitude, form.longitude, form.type],
      ctx.adminUserId || JourneyController.SELF_REPORT_USER,
      isQrScan ? form.deviceId?.substr(0, 25) : ""
    );
    const savedJourney = await this.journeyRepository.save(journey);

    if (form.image) {
      const resize = sharp().resize({ width: 500, withoutEnlargement: true }).jpeg({ quality: 90 });

      try {
        await this.storage({
          Bucket: "eco-rewards-images",
          Key: savedJourney.id + ".jpg",
          Body: form.image.pipe(resize),
        });
      } catch {}
    }

    return { code: 201, data: "success" };
  }

  private async getJourneyFactory(fullId: string): Promise<JourneyFactory> {
    const id = fullId.length >= 16 ? fullId : toMemberId(fullId + "") + "";
    const members = await this.memberRepository.selectIn(["id", [id]], ["smartcard", [id]]);
    const membersById = members.reduce(indexBy(m => m.id), {});
    const membersBySmartcard = Object.values(members).reduce(indexBy(m => m.smartcard || ""), {});

    return new JourneyFactory(
      membersById,
      membersBySmartcard,
      this.memberRepository,
      this.memberFactory,
      this.externalMemberRepository
    );
  }

  private validateForm(form: PostJourneyRequest) {
    const errors: string[] = [];

    if (!form.memberId) {
      errors.push("Member ID must be set");
    }

    if (!form.date || form.date.match(/\d{4}-\d{2}-\d{2}/) === null) {
      errors.push("Travel date must be set");
    }
    else {
      const travelDate = new Date(form.date);
      const now = new Date();
      const eightDaysAgo = new Date(now.getTime() - (1000 * 3600 * 24 * 8));

      if (travelDate.getTime() > now.getTime()) {
        errors.push("Travel date cannot be in the future");
      }

      if (travelDate.getTime() < eightDaysAgo.getTime()) {
        errors.push("Travel date must be within the last 7 days");
      }
    }

    // if a device ID has been provided allow use of default mode and distance
    if (form.deviceId) {
      return errors;
    }

    if (!form.mode) {
      errors.push("Travel mode must be set");
    }

    if (!form.distance) {
      errors.push("Travel distance must be set");
    }
    else {
      const maxDistance = form.mode === "train" ? 500 : 99;

      if (form.distance > maxDistance) {
        errors.push("Travel distance must not exceed 99 miles or 500 miles for train journeys");
      }
      if (form.distance < 0) {
        errors.push("Travel distance must not be negative");
      }
    }

    return errors;
  }
}

export interface PostJourneyResponse {
  code: 201 | 400,
  data: "success" | {
    errors: string[]
  }
}

interface PostJourneyRequest {
  memberId?: string,
  date?: string,
  mode?: string,
  distance?: number,
  image?: ReadableStream,
  deviceId?: string,
  latitude?: number,
  longitude?: number,
  type?: JourneyType
}

export type RemoteFileStorage = (opts: {
  Bucket: string,
  Key: string,
  Body: ReadableStream
}) => Promise<any>;
