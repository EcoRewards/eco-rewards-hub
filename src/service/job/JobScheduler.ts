import autobind from "autobind-decorator";
import { Logger } from "pino";
import Timeout = NodeJS.Timeout;

/**
 * Scheduler that will run a given job at a specified interval. It will acquire a lock to ensure the job is not run
 * concurrently, but not this is only a local lock and does not apply to other instances of the application.
 */
@autobind
export class JobScheduler {
  private processing = false;
  private timeout?: Timeout;

  constructor(
    private readonly job: Job,
    private readonly interval: number,
    private readonly log: Logger
  ) { }

  /**
   * Start the job
   */
  public start(): void {
    this.timeout = setInterval(this.triggerJob, this.interval);
  }

  /**
   * Stop the job
   */
  public stop(): void {
    clearInterval(this.timeout!);
    this.timeout = undefined;
  }

  /**
   * If a job is already running trigger a warning and do nothing. Otherwise run the job.
   */
  private async triggerJob(): Promise<void> {
    if (this.processing) {
      this.log.warn("A job is already running.");
    }

    this.processing = true;

    try {
      await this.job.run();
    }
    catch (err) {
      this.log.error(err);
    }

    this.processing = false;
  }
}

export interface Job {
  run(): any
}
