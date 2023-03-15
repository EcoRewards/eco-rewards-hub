import { ServiceContainer } from "./service/ServiceContainer";

const container = new ServiceContainer();

container
  .getKoaService()
  .then(service => service.start())
  .then(() => container.getJourneyProcessingJob())
  .then(scheduler => scheduler.start())
  .then(() => container.getDatabaseBackupJob())
  .then(scheduler => scheduler.start())
  .then(() => container.getTrophyAllocationJob())
  .then(trophyJob => trophyJob.start())
  .catch(e => console.error(e));
