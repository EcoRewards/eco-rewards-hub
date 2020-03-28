import { Job } from "../../service/job/JobScheduler";
import mysqldump, { ConnectionOptions } from "mysqldump";
import { DateTimeFormatter, LocalDateTime } from "@js-joda/core";
import * as S3 from "aws-sdk/clients/s3";
import { promisify } from "util";
import * as fs from "fs";

/**
 * Dump the MySQL database and upload it to S3
 */
export class DatabaseBackupJob implements Job {

  constructor(
    private readonly databaseConfiguration: ConnectionOptions,
    private readonly aws: S3
  ) { }

  public async run(): Promise<void> {
    const localDate = LocalDateTime.now();
    const date = localDate.format(DateTimeFormatter.ofPattern("yyyy-MM-dd-HHmm"));
    const filename = `ecorewards-${date}.sql.gz`;
    const path = "/tmp/" + filename;

    await mysqldump({
      connection: {
        user: this.databaseConfiguration.user,
        host: this.databaseConfiguration.host,
        password: this.databaseConfiguration.password || "",
        database: this.databaseConfiguration.database
      },
      dumpToFile: path,
      compressFile: true,
    });

    let s3directory = this.getExpiryPath(localDate);

    const upload = promisify(this.aws.upload.bind(this.aws));

    await upload({
      Bucket: "eco-rewards-backups",
      Key: s3directory + filename,
      Body: fs.createReadStream(path),
    });

    fs.unlink(path, () => {});
  }

  /**
   * Midnight backups on the first of the month last for a year
   * Midnight backups on the first day of the week last a month
   * Midnight backups last a week
   * Hourly backups last a day
   */
  private getExpiryPath(localDate: LocalDateTime): string {
    if (localDate.hour() === 0) {
      if (localDate.dayOfMonth() === 1) {
        return "monthly/";
      }

      if (localDate.dayOfWeek().value() === 1) {
        return "weekly/";
      }

      return "daily/";
    }

    return "hourly/";
  }
}